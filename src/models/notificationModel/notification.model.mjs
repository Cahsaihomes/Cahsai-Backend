import { DataTypes } from "sequelize";

const NotificationModel = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "ID of the user receiving the notification",
      },
      fromUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "ID of the user who triggered the notification",
      },
      type: {
        type: DataTypes.ENUM(
          "comment",
          "reply", 
          "like",
          "follow",
          "system"
        ),
        allowNull: false,
        defaultValue: "comment",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      postId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "ID of the related post",
      },
      commentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "ID of the related comment",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional notification data",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["fromUserId"],
        },
        {
          fields: ["isRead"],
        },
        {
          fields: ["createdAt"],
        },
        {
          fields: ["type"],
        },
      ],
    }
  );

  return Notification;
};

export default NotificationModel;