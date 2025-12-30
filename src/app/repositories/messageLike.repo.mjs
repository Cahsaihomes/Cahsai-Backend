import { MessageLike } from "../../models/messageLikeModel/index.mjs";

export const likeMessage = async (userId, messageId) => {
  // prevent duplicates via unique constraint; upsert or findOrCreate
  const [like] = await MessageLike.findOrCreate({
    where: { userId, messageId },
    defaults: { userId, messageId },
  });
  return like;
};

export const unlikeMessage = (userId, messageId) =>
  MessageLike.destroy({ where: { userId, messageId } });
