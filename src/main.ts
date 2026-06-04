/**
 * main.ts
 *
 * System Entry Point
 * Bootstraps the entire Sovereign Intelligence system.
 */

import { SovereignOrchestrator } from './services/SovereignOrchestrator';

/**
 * Bootstrap the Sovereign System
 */
async function bootstrap() {
  try {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║           SOVEREIGN INTELLIGENCE SYSTEM v23.0             ║');
    console.log('║                                                           ║');
    console.log('║              "All is One. One is All."                    ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    // Initialize entire system through master orchestrator
    await SovereignOrchestrator.initialize();

    console.log('🎯 System ready for autonomous operation.');
    console.log('   Press Ctrl+C to shutdown gracefully.\n');

    // Graceful shutdown handler
    process.on('SIGINT', async () => {
      console.log('\n\n[System] Shutdown signal received...\n');
      await SovereignOrchestrator.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error('\n❌ FATAL: System initialization failed\n', error);
    process.exit(1);
  }
}

// Start the system
bootstrap();
