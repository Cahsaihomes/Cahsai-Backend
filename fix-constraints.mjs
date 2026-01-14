import sequelize from "./src/config/database.mjs";
import { DataTypes } from "sequelize";
import TourRequest from "./src/models/tourModel/tourRequest.model.mjs";
import Post from "./src/models/postModel/post.model.mjs";

async function fixConstraints() {
  try {
    console.log("🔄 Starting constraint fix...");
    
    // Initialize models
    const TourReq = TourRequest(sequelize, DataTypes);
    const PostModel = Post(sequelize, DataTypes);
    
    // Delete orphaned TourRequests
    console.log("🧹 Checking for orphaned TourRequests...");
    const sequelizeQuery = `
      DELETE FROM TourRequests 
      WHERE postId IS NOT NULL AND postId NOT IN (
        SELECT id FROM Posts
      )
    `;
    
    const [results] = await sequelize.query(sequelizeQuery);
    console.log("✅ Orphaned records cleaned");
    
    // Now sync
    console.log("🔄 Syncing models...");
    await sequelize.sync({ alter: true });
    
    console.log("✅ Constraints fixed and models synced successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fix error:", error.message);
    process.exit(1);
  }
}

fixConstraints();
