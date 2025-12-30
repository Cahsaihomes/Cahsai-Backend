import e from "express";

export default (sequelize, DataTypes) => {
  const TourRequest = sequelize.define("TourRequest", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    buyerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "New lead",
        "Awaiting Call",
        "Confirmed Claimed",
        "Needs Follow-up",
        "Unresponsive"
      ),
      defaultValue: "New lead",
    },
    
    bookingStatus: {
      type: DataTypes.ENUM("pending", "confirmed", "active"),
      defaultValue: "pending",
    },
    activeLead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timerExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiredStatus: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
  });

  return TourRequest;
};
