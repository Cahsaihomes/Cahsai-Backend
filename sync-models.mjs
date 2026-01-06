// Sync script to sync models with database
import sequelize from "./src/config/database.mjs";
import { DataTypes } from "sequelize";
import PostModel from "./src/models/postModel/post.model.mjs";
import userModel from "./src/models/userModel/user.model.mjs";

async function syncModels() {
  try {
    console.log("🔄 Syncing models with database...");
    
    const User = userModel(sequelize);
    const Post = PostModel(sequelize, DataTypes);
    
    // Sync without dropping tables
    await sequelize.sync({ alter: true });
    
    console.log("✅ Models synced successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync error:", error);
    process.exit(1);
  }
}

syncModels();
