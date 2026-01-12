import sequelize from "./src/config/database.mjs";

async function checkColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable("TourRequests");
    
    console.log("📋 TourRequests table columns:");
    Object.keys(columns).forEach(col => {
      console.log(`  ✓ ${col}: ${columns[col].type}`);
    });
    
    console.log("\n🔍 Checking for required columns:");
    const requiredCols = ['resolutionStatus', 'voicemailLeft', 'callSid', 'agentCallStatus', 'agentCallTime', 'buyerCallSid', 'buyerCallStatus', 'buyerCallTime'];
    
    requiredCols.forEach(col => {
      if (columns[col]) {
        console.log(`  ✅ ${col} exists`);
      } else {
        console.log(`  ❌ ${col} MISSING`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
