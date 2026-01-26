(() => {
  const payload = {
    pf: 51.077,
    residual_std: 0.0135,
    // Using test-mock hourlyLossEuro = 120 EUR/hr as representative
    cost_of_inaction_30d: 120 * 24 * 30,
    anchor_timestamp: new Date().toISOString()
  };

  console.log('DRY-RUN PAYLOAD:');
  console.log(JSON.stringify(payload, null, 2));

  console.log('\nSIMULATED INSERT:');
  console.log('{ status: "ok", inserted: 1, id: "dryrun-0001" }');
})();
