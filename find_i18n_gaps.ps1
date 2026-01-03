$en = Get-Content 'src/i18n/en.json' | ConvertFrom-Json
$bs = Get-Content 'src/i18n/bs.json' | ConvertFrom-Json

function Get-Keys($obj, $prefix) {
    if ($null -eq $obj) { return @() }
    $keys = @()
    foreach ($prop in $obj.psobject.properties) {
        if ($prop.value -is [System.Management.Automation.PSCustomObject]) {
            $keys += Get-Keys $prop.value ($prefix + $prop.name + '.')
        } else {
            $keys += ($prefix + $prop.name)
        }
    }
    return $keys
}

$enKeys = Get-Keys $en ''
$bsKeys = Get-Keys $bs ''

$missingFromBs = $enKeys | Where-Object { $_ -notin $bsKeys }
$missingFromEn = $bsKeys | Where-Object { $_ -notin $enKeys }

Write-Host "--- MISSING FROM BS ---"
$missingFromBs | ForEach-Object { Write-Host $_ }
Write-Host "--- MISSING FROM EN ---"
$missingFromEn | ForEach-Object { Write-Host $_ }
Write-Host "Count Missing BS: $($missingFromBs.Count)"
Write-Host "Count Missing EN: $($missingFromEn.Count)"
