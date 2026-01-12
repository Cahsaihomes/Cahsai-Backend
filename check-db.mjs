import sequelize from "./src/config/database.mjs";

async function checkDatabase() {
  const queryInterface = sequelize.getQueryInterface();
  const table = "TourRequests";

  try {
    console.log("🔍 Checking TourRequests table structure...\n");

    const columns = await queryInterface.describeTable(table);
    
    console.log("Current columns in TourRequests:");
    Object.keys(columns).forEach(col => {
      console.log(`  ✓ ${col}`);
    });

    console.log("\n📋 Checking for required columns:");
    const requiredCols = [
      'resolutionStatus', 
      'voicemailLeft', 
      'callSid', 
      'agentCallStatus', 
      'agentCallTime',
      'buyerCallSid',
      'buyerCallStatus', 
      'buyerCallTime',
      'scheduledCallTime'
    ];

    requiredCols.forEach(col => {
      if (columns[col]) {
        console.log(`  ✅ ${col} - EXISTS`);
      } else {
        console.log(`  ❌ ${col} - MISSING`);
      }
    });

  } catch (error) {
    console.error("❌ Error checking table:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase().catch(console.error);
