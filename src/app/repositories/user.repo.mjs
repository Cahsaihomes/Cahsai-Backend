import {
  User,
  PaymentDetails,
  AgentTable,
  CreatorTable,
} from "../../models/userModel/index.mjs";

const userRepo = {
  create: (data, tx = null) => User.create(data, { transaction: tx }),
  findUserById: (id) => User.findByPk(id),
  getFullUserProfile: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "otp", "otpExpiry"] },
    });

    if (user.role === "agent") {
      const paymentDetails = await PaymentDetails.findOne({
        where: { userId },
      });
      const agentTable = await AgentTable.findOne({ where: { userId } });
      return { user, paymentDetails, agentTable };
    }
    if (user.role === "creator") {
      const creatorTable = await CreatorTable.findOne({ where: { userId } });
      return { user, creatorTable };
    }

    return user;
  },
  findPaymentDetails: (userId) => PaymentDetails.findOne({ where: { userId } }),
  findAgents: (userId) => AgentTable.findOne({ where: { userId } }),
  findCreators: (userId) => CreatorTable.findOne({ where: { userId } }),

  updateUser: async (id, data) => {
    const [updatedCount] = await User.update(data, { where: { id } });
    return updatedCount;
  },

  updatePaymentDetails: (userId, data) =>
    PaymentDetails.upsert({ userId, ...data }),

  updateAgents: (userId, data) => AgentTable.upsert({ userId, ...data }),
  updateCreators: (userId, data) => CreatorTable.upsert({ userId, ...data }),
  blacklistToken: async (token) => {
    return true;
  },
};

export default userRepo;
