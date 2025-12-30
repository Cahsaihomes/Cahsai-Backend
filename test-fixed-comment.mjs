// Test the fixed comment creation
import sequelize from "./src/config/database.mjs";
import { createComment } from "./src/app/services/postComment.service.mjs";

async function testFixedCommentCreation() {
  try {
    console.log("🧪 Testing fixed comment creation...");
    
    await sequelize.authenticate();
    console.log("✅ Database connection successful");
    
    // Test creating a comment using the fixed service
    const result = await createComment(
      5,    // postId - exists
      2,    // userId - Agent 1
      "Test comment after fixing isPrivate issue",
      null  // parentId - null for top-level comment
    );
    
    console.log("✅ Comment created successfully!");
    console.log("📝 Created comment:", {
      id: result.id,
      postId: result.postId,
      userId: result.userId,
      content: result.content,
      parentId: result.parentId,
      createdAt: result.createdAt
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testFixedCommentCreation();