import sequelize from "./src/config/database.mjs";
import { DataTypes } from "sequelize";
import PostModel from "./src/models/postModel/post.model.mjs";

async function migrateProductLink() {
  try {
    console.log("🔄 Starting productLink migration...");
    
    // Initialize Post model
    const Post = PostModel(sequelize, DataTypes);
    
    // Sync the model to add the new column
    await sequelize.sync({ alter: true });
    
    console.log("✅ ProductLink column migrated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrateProductLink();
