import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Post = sequelize.define("Post", {
    totalViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    homeStyle: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forYou: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isPromoted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // ===== NEW RENTAL FIELDS =====
    listing_type: {
      type: DataTypes.ENUM("FOR_SALE", "FOR_RENT", "STAY"),
      defaultValue: "FOR_SALE",
      allowNull: false,
    },
    monthly_rent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    security_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    lease_term: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    available_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    pet_policy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    furnished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    application_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    is_verified_manager: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  });

  return Post;
};
