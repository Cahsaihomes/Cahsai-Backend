import { Chat } from "../../models/chatModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";
import { Op } from "sequelize";

export const findByParticipants = (buyerId, agentId) =>
  Chat.findOne({ where: { buyerId, agentId } });

export const createChat = ({ buyerId, agentId }) =>
  Chat.create({ buyerId, agentId });

export const findById = (id) =>
  Chat.findByPk(id, {
    include: [
      {
        model: User,
        as: "buyer",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "email",
          "avatarUrl",
          "role",
        ],
      },
      {
        model: User,
        as: "agent",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "email",
          "avatarUrl",
          "role",
        ],
      },
    ],
  });

export const listByUser = (userId) =>
  Chat.findAll({
    where: { [Op.or]: [{ buyerId: userId }, { agentId: userId }] },
    include: [
      {
        model: User,
        as: "buyer",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "avatarUrl",
          "role",
        ],
      },
      {
        model: User,
        as: "agent",
        attributes: [
          "id",
          "first_name",
          "last_name",
          "user_name",
          "avatarUrl",
          "role",
        ],
      },
    ],
    // Filter in-code: Sequelize v6 doesn't support "or" directly in include — use raw where
    // Better:
    // where: { [Op.or]: [{ buyerId: userId }, { agentId: userId }] }
  });
