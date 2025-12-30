import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "PaymentDetails",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      cardHolderName: { type: DataTypes.STRING, allowNull: true },
      cardNumber: { type: DataTypes.STRING, allowNull: true },
      cardCvv: { type: DataTypes.STRING, allowNull: true },
      cardExpiryDate: { type: DataTypes.STRING, allowNull: true },
      cardBrand: { type: DataTypes.STRING, allowNull: true },
      // cardExpiryMonth: { type: DataTypes.INTEGER, allowNull: true },
      // cardExpiryYear: { type: DataTypes.INTEGER, allowNull: true },
      billingAddress: { type: DataTypes.STRING, allowNull: true },

      account_name: { type: DataTypes.STRING, allowNull: true },
      account_type: { type: DataTypes.STRING, allowNull: true },
      bank_name: { type: DataTypes.STRING, allowNull: true },
      iban: { type: DataTypes.STRING, allowNull: true },
      routing_number: { type: DataTypes.STRING, allowNull: true },
      currency: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      phone_number: { type: DataTypes.STRING, allowNull: true },
      verification_documents: {
        type: DataTypes.JSON,
        allowNull: true,
        default: [],
      },
    },
    {
      tableName: "payment_details",
      timestamps: true,
    }
  );
};
