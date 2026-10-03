import { db } from './db.js';
import { StorageRouter } from './storageRouter.js';
import { primaryAudioProvider, archiveAudioProvider } from './storage.js';

export async function runDualStorageSimulation() {
  console.log('--- STARTING AUTONOMOUS DUAL-STORAGE SPILLOVER SIMULATION ---');
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false
  };

  try {
    // Save current settings to restore later
    const originalSettings = db.getSettings();

    // -------------------------------------------------------------
    // TEST 1: R2 Below Threshold
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Simulated R2 usage within limits...');
    db.updateSettings({ r2SafetyThresholdGb: 10 }); // safety threshold set to 10GB
    
    // We mock a light file of 1MB
    const providerForLightFile = await StorageRouter.selectProvider(1024 * 1024, 'audio/mpeg');
    console.log(`- Routed file of size 1MB to: ${providerForLightFile.name}`);
    if (providerForLightFile.name === primaryAudioProvider.name) {
      console.log('=> Test 1 Success: Light file correctly routed to Cloudflare R2.');
      results.test1 = true;
    }

    // -------------------------------------------------------------
    // TEST 2: R2 Safety Limit Exceeded (Overflow)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Simulated R2 safety threshold exceeded (Overflow to Internet Archive)...');
    // Set safety threshold extremely low to trigger overflow threshold
    db.updateSettings({ r2SafetyThresholdGb: 0.00001 }); // ~10KB threshold

    const providerForHeavyFile = await StorageRouter.selectProvider(5 * 1024 * 1024, 'audio/mpeg');
    console.log(`- Routed file of size 5MB to: ${providerForHeavyFile.name}`);
    if (providerForHeavyFile.name === archiveAudioProvider.name) {
      console.log('=> Test 2 Success: File correctly routed to Internet Archive overflow bucket.');
      results.test2 = true;
    }

    // -------------------------------------------------------------
    // TEST 3: Restore R2 to normal
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Restored R2 state below threshold...');
    db.updateSettings({ r2SafetyThresholdGb: 10 });

    const restoredProvider = await StorageRouter.selectProvider(1024 * 1024, 'audio/mpeg');
    console.log(`- Routed file to: ${restoredProvider.name}`);
    if (restoredProvider.name === primaryAudioProvider.name) {
      console.log('=> Test 3 Success: Routing successfully restored back to primary R2.');
      results.test3 = true;
    }

    // -------------------------------------------------------------
    // TEST 4: Simulated Primary Health Failure
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Simulated Cloudflare R2 primary gateway failure...');
    // We force healthCheck response of primaryAudioProvider to fail
    const originalHealthCheck = primaryAudioProvider.healthCheck;
    primaryAudioProvider.healthCheck = async () => ({
      providerName: 'cloudflare_r2_audio',
      status: 'ERROR',
      totalObjects: 0,
      totalBytes: 0,
      details: 'Simulated connection failure.'
    });

    const fallbackProvider = await StorageRouter.selectProvider(1024 * 1024, 'audio/mpeg');
    console.log(`- Routed file to fallback: ${fallbackProvider.name}`);
    if (fallbackProvider.name === archiveAudioProvider.name) {
      console.log('=> Test 4 Success: Correctly diverted file to Internet Archive during primary health failure.');
      results.test4 = true;
    }

    // Restore health check function and original settings
    primaryAudioProvider.healthCheck = originalHealthCheck;
    db.updateSettings(originalSettings);

  } catch (err) {
    console.error('Simulation run failed:', err);
  }

  console.log('\n--- SIMULATION RESULTS SUMMARY ---');
  console.log(`TEST 1 (Normal Routing): ${results.test1 ? 'PASS' : 'FAIL'}`);
  console.log(`TEST 2 (Overflow Switch): ${results.test2 ? 'PASS' : 'FAIL'}`);
  console.log(`TEST 3 (Recovery Mode): ${results.test3 ? 'PASS' : 'FAIL'}`);
  console.log(`TEST 4 (Gateway Failure Fallback): ${results.test4 ? 'PASS' : 'FAIL'}`);
  console.log('---------------------------------');

  return results;
}
