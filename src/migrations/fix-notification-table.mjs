// Migration script to fix notification table data types
import sequelize from "../config/database.mjs";

async function migrateNotificationTable() {
  try {
    console.log("🔄 Starting notification table migration...");
    
    // First, create the notification table using raw SQL to avoid Sequelize constraint conflicts
    await sequelize.query("DROP TABLE IF EXISTS `notifications`");
    console.log("✅ Dropped existing notifications table");
    
    // Create the table with proper data types and unique constraint names
    await sequelize.query(`
      CREATE TABLE notifications (
        id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId INTEGER UNSIGNED NOT NULL COMMENT 'ID of the user receiving the notification',
        fromUserId INTEGER UNSIGNED NOT NULL COMMENT 'ID of the user who triggered the notification',
        type ENUM('comment', 'reply', 'like', 'follow', 'system') NOT NULL DEFAULT 'comment',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        isRead TINYINT(1) DEFAULT 0,
        postId INTEGER UNSIGNED NULL COMMENT 'ID of the related post',
        commentId INTEGER UNSIGNED NULL COMMENT 'ID of the related comment',
        metadata JSON NULL COMMENT 'Additional notification data',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_notifications_userId (userId),
        INDEX idx_notifications_fromUserId (fromUserId),
        INDEX idx_notifications_isRead (isRead),
        INDEX idx_notifications_createdAt (createdAt),
        INDEX idx_notifications_type (type),
        CONSTRAINT fk_notifications_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_notifications_fromUserId FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
    
    console.log("✅ Created notifications table with correct data types and constraints");
    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateNotificationTable();