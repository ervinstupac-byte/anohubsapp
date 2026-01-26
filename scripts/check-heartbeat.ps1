<#
Dispatch ingest.yml, poll until completion, then run Pf comparison.
Requires: gh CLI, node, and ADMIN_TOKEN env var set locally before running.
#>

param(
  [string]$AssetId = '1',
  [int]$PollIntervalSec = 10,
  [int]$TimeoutSec = 600
)

function Exit-WithMessage($code, $msg) {
  Write-Host $msg
  exit $code
}

# Verify ADMIN_TOKEN exists
if (-not $env:ADMIN_TOKEN) {
  Exit-WithMessage 2 "Missing ADMIN_TOKEN environment variable. Please set ADMIN_TOKEN (a GitHub PAT with admin rights) and retry."
}

# Export token for gh CLI to use during this script
$env:GITHUB_TOKEN = $env:ADMIN_TOKEN
$env:GH_TOKEN = $env:ADMIN_TOKEN

Write-Host "Dispatching ingest.yml workflow on branch 'main'..."
$dispatch = gh workflow run ingest.yml --ref main 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to dispatch workflow: $dispatch"
  Exit-WithMessage 3 "Workflow dispatch failed." 
}

Write-Host "Workflow dispatched. Polling for run completion (timeout ${TimeoutSec}s)..."

$start = Get-Date
while ($true) {
  Start-Sleep -Seconds $PollIntervalSec

  $runsJson = gh run list --workflow ingest.yml --branch main --json databaseId,number,status,conclusion,createdAt -L 5 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: failed to query runs, retrying..."
    if ( ((Get-Date) - $start).TotalSeconds -gt $TimeoutSec ) { Exit-WithMessage 4 "Timed out while querying workflow runs." }
    continue
  }

  try {
    $runs = $runsJson | ConvertFrom-Json
  } catch {
    Write-Host "Failed to parse run list JSON, retrying..."
    if ( ((Get-Date) - $start).TotalSeconds -gt $TimeoutSec ) { Exit-WithMessage 5 "Timed out while parsing run list." }
    continue
  }

  if (-not $runs) { continue }

  # Pick the most recent run
  $latest = $runs | Sort-Object createdAt -Descending | Select-Object -First 1
  if (-not $latest) { continue }

  Write-Host "Found run #$($latest.number) — status: $($latest.status) — conclusion: $($latest.conclusion)"

  if ($latest.status -eq 'completed') {
    if ($latest.conclusion -eq 'success') {
      Write-Host "Workflow completed successfully."; break
    } else {
      Write-Host "Workflow completed with conclusion: $($latest.conclusion). Exiting."; Exit-WithMessage 6 "Workflow failed or cancelled." }
  }

  if ( ((Get-Date) - $start).TotalSeconds -gt $TimeoutSec ) { Exit-WithMessage 7 "Timed out waiting for workflow to complete." }
}

Write-Host "Running live Pf computation for asset $AssetId..."
$compute = node ./scripts/compute_pf_for_asset.mjs $AssetId 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host $compute; Exit-WithMessage 8 "compute_pf_for_asset failed." }

Write-Host $compute

# Parse residualStd and pf
$m = [regex]::Match($compute, 'residualStd=([0-9.]+)\s+Pf=([0-9.]+)%')
if (-not $m.Success) { Exit-WithMessage 9 "Failed to parse compute output." }

$residualStd = [double]$m.Groups[1].Value
$pf = [double]$m.Groups[2].Value

$anchorResidual = 0.0135
$tolerance = 0.0001

if ([math]::Abs($residualStd - $anchorResidual) -gt $tolerance) {
  Write-Host "INTEGRITY BREACH: RECALIBRATE — residualStd=$residualStd (anchor=$anchorResidual)"
  $status = 'BREACH'
} else {
  Write-Host "SYSTEM INTEGRITY: OK — residualStd=$residualStd (anchor=$anchorResidual)"
  $status = 'OK'
}

# Invoke compare script to ensure logging into telemetry_alerts if needed
Write-Host "Invoking compare_pf_anchor script to log event if required..."
node ./scripts/compare_pf_anchor.mjs $AssetId

if ($status -eq 'OK') { exit 0 } else { exit 11 }
