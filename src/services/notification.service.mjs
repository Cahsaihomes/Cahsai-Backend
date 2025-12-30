import { Notification, User } from "../models/notificationModel/index.mjs";
import { PostComment, Post } from "../models/postModel/index.mjs";
import sequelize from "../config/database.mjs";
import { notifyNewNotification } from "../socket/notify.mjs";

class NotificationService {
  
  // Create a new notification
  async createNotification({
    userId,
    fromUserId,
    type,
    title,
    message,
    postId = null,
    commentId = null,
    metadata = {}
  }) {
    try {
      const notification = await Notification.create({
        userId,
        fromUserId,
        type,
        title,
        message,
        postId,
        commentId,
        metadata,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Include sender info
      const notificationWithSender = await Notification.findByPk(notification.id, {
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id", 
              "first_name", 
              "last_name", 
              "avatarUrl",
              [sequelize.fn('CONCAT', sequelize.col('first_name'), ' ', sequelize.col('last_name')), 'fullname']
            ]
          }
        ]
      });

      // Emit real-time notification
      try {
        notifyNewNotification(notificationWithSender.toJSON());
      } catch (error) {
        console.error("Failed to emit real-time notification:", error);
        // Don't fail the notification creation if socket emission fails
      }

      return notificationWithSender;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Create notification when someone comments on a post
  async createCommentNotification(commentData) {
    try {
      const { userId: commenterId, postId, content, commentId } = commentData;

      // Get post details and owner
      const post = await Post.findByPk(postId, {
        attributes: ["id", "title", "description", "userId"],
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id", 
              "first_name", 
              "last_name", 
              "avatarUrl",
              [sequelize.fn('CONCAT', sequelize.col('user.first_name'), ' ', sequelize.col('user.last_name')), 'fullname']
            ]
          }
        ]
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // Don't notify if user is commenting on their own post
      if (post.userId === commenterId) {
        return null;
      }

      // Get commenter details
      const commenter = await User.findByPk(commenterId, {
        attributes: [
          "id", 
          "first_name", 
          "last_name", 
          "avatarUrl",
          [sequelize.fn('CONCAT', sequelize.col('first_name'), ' ', sequelize.col('last_name')), 'fullname']
        ]
      });

      if (!commenter) {
        throw new Error("Commenter not found");
      }

      const notification = await this.createNotification({
        userId: post.userId, // Post owner gets the notification
        fromUserId: commenterId, // Who made the comment
        type: "comment",
        title: "New Comment",
        message: `${commenter.getDataValue('fullname')} commented on your post`,
        postId,
        commentId,
        metadata: {
          postTitle: post.title || post.description?.substring(0, 50) + "...",
          commentPreview: content?.substring(0, 100) + "...",
          commenterName: commenter.getDataValue('fullname'),
          commenterAvatar: commenter.avatarUrl
        }
      });

      return notification;
    } catch (error) {
      console.error("Error creating comment notification:", error);
      throw error;
    }
  }

  // Create notification when someone replies to a comment
  async createReplyNotification(replyData) {
    try {
      const { userId: replierId, parentCommentId, content, commentId } = replyData;

      // Get parent comment details
      const parentComment = await PostComment.findByPk(parentCommentId, {
        attributes: ["id", "content", "userId", "postId"],
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id", 
              "first_name", 
              "last_name", 
              "avatarUrl",
              [sequelize.fn('CONCAT', sequelize.col('user.first_name'), ' ', sequelize.col('user.last_name')), 'fullname']
            ]
          }
        ]
      });

      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      // Don't notify if user is replying to their own comment
      if (parentComment.userId === replierId) {
        return null;
      }

      // Get replier details
      const replier = await User.findByPk(replierId, {
        attributes: [
          "id", 
          "first_name", 
          "last_name", 
          "avatarUrl",
          [sequelize.fn('CONCAT', sequelize.col('first_name'), ' ', sequelize.col('last_name')), 'fullname']
        ]
      });

      if (!replier) {
        throw new Error("Replier not found");
      }

      const notification = await this.createNotification({
        userId: parentComment.userId, // Original commenter gets the notification
        fromUserId: replierId, // Who made the reply
        type: "reply",
        title: "New Reply",
        message: `${replier.getDataValue('fullname')} replied to your comment`,
        postId: parentComment.postId,
        commentId,
        metadata: {
          parentCommentPreview: parentComment.content?.substring(0, 100) + "...",
          replyPreview: content?.substring(0, 100) + "...",
          replierName: replier.getDataValue('fullname'),
          replierAvatar: replier.avatarUrl
        }
      });

      return notification;
    } catch (error) {
      console.error("Error creating reply notification:", error);
      throw error;
    }
  }

  // Get all notifications for a user
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause = { userId };
      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id", 
              "first_name", 
              "last_name", 
              "avatarUrl",
              [sequelize.fn('CONCAT', sequelize.col('fromUser.first_name'), ' ', sequelize.col('fromUser.last_name')), 'fullname']
            ]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset
      });

      return {
        notifications,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: offset + notifications.length < count
      };
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update({ isRead: true });
      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
      return { success: true };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false }
      });
      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.destroy();
      return { success: true };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}

export default new NotificationService();