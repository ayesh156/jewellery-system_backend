import 'dotenv/config';
import { poolConnection } from './db/index.js';

// MariaDB Live Resource Monitor for Onelka Jewellery
async function monitorDatabase() {
  console.log('🔄 Connecting to Database Monitor for Onelka Jewellery...');

  const timer = setInterval(async () => {
    try {
      const [rows] = await poolConnection.query(`
        SHOW STATUS WHERE Variable_name IN (
          'Threads_connected', 
          'Threads_running', 
          'Max_used_connections', 
          'Aborted_connects',
          'Connections'
        )
      `);

      console.clear();
      console.log('=== 📊 Onelka Jewellery - MariaDB Live Pool Monitor ===');
      console.log(`⏰ Timestamp: ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo' })}`);
      console.log('⚙️ Target Pool Limit per Instance: 5 connections');
      console.log('------------------------------------------------------------');
      console.table(rows);
    } catch (error) {
      console.error('❌ Monitor Query Error:', (error as Error).message);
    }
  }, 1000);

  process.on('SIGINT', async () => {
    clearInterval(timer);
    await poolConnection.end();
    console.log('\n🛑 Monitor stopped cleanly.');
    process.exit(0);
  });
}

monitorDatabase();