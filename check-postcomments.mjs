// Check PostComments table structure
import sequelize from "./src/config/database.mjs";

async function checkPostCommentsStructure() {
  try {
    console.log("📋 Checking PostComments table structure...");
    
    await sequelize.authenticate();
    console.log("✅ Database connection successful");
    
    // Get table structure
    const [tableDesc] = await sequelize.query("DESCRIBE PostComments");
    console.log("\n📋 PostComments table columns:");
    console.table(tableDesc.map(col => ({ 
      Field: col.Field, 
      Type: col.Type, 
      Null: col.Null,
      Default: col.Default,
      Key: col.Key
    })));
    
    // Test with correct columns only
    console.log("\n🧪 Testing comment creation without isPrivate...");
    
    try {
      const [result, metadata] = await sequelize.query(`
        INSERT INTO PostComments (postId, userId, content, createdAt, updatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `, {
        replacements: [5, 2, 'Test comment without isPrivate']
      });
      
      console.log("✅ Comment creation successful without isPrivate!");
      console.log("📋 Insert ID:", result.insertId || metadata.insertId);
      
    } catch (insertError) {
      console.error("❌ Still failed:", insertError.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }
}

checkPostCommentsStructure();