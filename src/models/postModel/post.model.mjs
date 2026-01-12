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
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true,
    },
    isPromoted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },

    // ===== NEW RENTAL FIELDS =====
    listing_type: {
      type: DataTypes.ENUM("FOR_SALE", "FOR_RENT", "STAY"),
      defaultValue: "FOR_SALE",
      allowNull: true,
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

    // ===== NEW PROPERTY FIELDS =====
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propertyType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lotSize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearBuilt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hoaFees: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brokerageName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stateDisclosures: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publishToWatchHomes: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    postType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedPostId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
     features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return Post;
};
