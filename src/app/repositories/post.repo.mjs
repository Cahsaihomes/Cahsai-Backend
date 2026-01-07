
import { Op } from "sequelize";
import { Post, PostStats } from "../../models/postModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";

const postRepo = {
  createPost: async (postData) => {
    return await Post.create(postData);
  },
  getPostsByUserId: async (userId) => {
    return await Post.findAll({
      where: { userId },  
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "user_name",
            "role",
            "avatarUrl",
            "followers_ids",
            "following_ids",
          ],
        },
      ],
    });
  },
  getPaginatedPosts: async (page = 1, pageSize = 10) => {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Post.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "user_name",
            "role",
            "avatarUrl",
            "followers_ids",
            "following_ids",
          ],
        },
      ],
    });
    return { total: count, posts: rows };
  },

  // getAllPosts: async () => {
  //   return await Post.findAll({
  //     order: [["createdAt", "DESC"]],
  //   });
  // },
  getAllPosts: async (options = {}) => {
    return await Post.findAll({
      order: [["createdAt", "DESC"]],
      ...options,
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });
  },
  updatePostById: async (postId, userId, updateData) => {
    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) {
      return null;
    }
    await post.update(updateData);
    return post;
  },
  getPostById: async (id) => {
    return await Post.findByPk(id);
  },

  deleteById: async (id) => {
    return await Post.destroy({ where: { id } });
  },
  deleteByPostId: async (postId) => {
    return await PostStats.destroy({ where: { postId } });
  },
  getPostViews: async (agentId) => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const posts = await Post.findAll({
      where: { userId: agentId },
      attributes: ["id"],
    });

    const postIds = posts.map((p) => p.id);
    if (!postIds.length) return { currentMonthViews: 0, previousMonthViews: 0 };

    const currentMonthViews = await PostStats.count({
      where: {
        postId: { [Op.in]: postIds },
        createdAt: { [Op.between]: [startOfCurrentMonth, now] },
      },
    });

    const previousMonthViews = await PostStats.count({
      where: {
        postId: { [Op.in]: postIds },
        createdAt: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] },
      },
    });

    return { currentMonthViews, previousMonthViews };
  },
  getPostConversion: async (agentId) => {
    const totalLeads = await Post.count({
      where: { userId: agentId },
    });

    const activeLeads = await Post.count({
      where: {
        userId: agentId,
        claimed: true,
      },
    });

    return { totalLeads, activeLeads };
  },
    // Increment totalViews for a post
  incrementTotalViews: async (postId) => {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error('Post not found');
    post.totalViews += 1;
    await post.save();
    return post.totalViews;
  },
};

export default postRepo;
