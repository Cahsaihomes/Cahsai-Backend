

import UserModel from "../../models/userModel/user.model.mjs";
import postRepo from "../repositories/post.repo.mjs";
import { Op, DataTypes } from "sequelize";
import { sequelize } from "../../models/postModel/index.mjs";
import PostModel from "../../models/postModel/post.model.mjs";
import PostStatsModel from "../../models/postModel/postStats.model.mjs";
import PostLikeModel from "../../models/postModel/postLike.model.mjs";
import PostCommentModel from "../../models/postModel/postComment.model.mjs";
import BuyerShareModel from "../../models/buyerSharePostModel/buyerSharePost.model.mjs";
import BuyerSavedPostModel from "../../models/buyerSavedPostModel/buyerSavedPostModel.mjs";
import getAgentPerformanceRepo from "../repositories/dashboard.repo.mjs";

export const getAgentDashboardService = async (agentId) => {
  const performance = await getAgentPerformanceRepo.getAgentPerformance(
    agentId
  );

  return {
    totalPostsView: performance.totalPostViews,
    totalLeads: performance.totalLeads,
    convertedLeads: performance.convertedLeads,
    leadConversionRate: performance.conversionRate,
    pendingTours: performance.pendingTours,
    confirmedTours: performance.confirmedTours,
  };
};

export const getAgentCustomersService = async (agentId) => {
  const customers = await getAgentPerformanceRepo.findCustomersByAgent(agentId);
  return customers;
};

export const getUpcomingToursService = async (agentId) => {
  return await getAgentPerformanceRepo.getUpcomingTours(agentId);
};
export const getAgentClaimedTourService = async (agentId) => {
  return await getAgentPerformanceRepo.getClaimedToursByMonth(agentId);
};

export const getVideoAnalyticsService = async (agentId, viewType, year) => {
  if (viewType === "week") {
    return await getAgentPerformanceRepo.getWeeklyData(agentId, year);
  } else if (viewType === "month") {
    return await getAgentPerformanceRepo.getMonthlyData(agentId, year);
  } else {
    throw new Error("Invalid viewType. Use 'week' or 'month'.");
  }
};
// Creator Dashboard Service
export const getCreatorDashboardService = async (creatorId) => {
  // Get all posts by creator
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  const PostLike = PostLikeModel(sequelize, DataTypes);
  const PostComment = PostCommentModel(sequelize, DataTypes);
  const BuyerShare = BuyerShareModel(sequelize, DataTypes);
  const BuyerSavedPost = BuyerSavedPostModel(sequelize, DataTypes);


  // Fetch all posts for this creator
  const posts = await Post.findAll({ where: { userId: creatorId } });
  const postIds = posts.map((p) => p.id);

  // Filter posts with videos
  const videoPosts = posts.filter((p) => p.video);

  // Get stats for each post
  const stats = await Promise.all(
    posts.map(async (post) => {
      const views = await PostStats.sum("views", { where: { postId: post.id } });
      const likes = await PostLike.count({ where: { postId: post.id } });
      const shares = await BuyerShare.count({ where: { postId: post.id } });
      const saves = await BuyerSavedPost.count({ where: { postId: post.id } });
      const comments = await PostComment.count({ where: { postId: post.id } });
      return { postId: post.id, views, likes, shares, saves, comments, hasVideo: !!post.video };
    })
  );

  // Aggregate totals
  const totalViews = stats.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = stats.reduce((sum, s) => sum + (s.likes || 0), 0);
  const totalShares = stats.reduce((sum, s) => sum + (s.shares || 0), 0);
  const totalSaves = stats.reduce((sum, s) => sum + (s.saves || 0), 0);
  const totalComments = stats.reduce((sum, s) => sum + (s.comments || 0), 0);

  // Dummy earnings logic: $0.01 per view, $0.05 per like, $0.10 per share
  const totalEarnings = (totalViews * 0.01) + (totalLikes * 0.05) + (totalShares * 0.1);

  // Engagement score: sum of all interactions
  const engagementScore = totalLikes + totalShares + totalSaves + totalComments + totalViews;

  // Upcoming payout (dummy: today's earnings)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const todayViews = await PostStats.sum("views", {
    where: {
      postId: { [Op.in]: postIds },
      createdAt: { [Op.gte]: startOfDay, [Op.lt]: endOfDay },
    },
  });
  const todayEarnings = (todayViews || 0) * 0.01;

  const payoutDate = today.toISOString().slice(0, 10);
  return {
    totalPosts: posts.length,
    videoPosts: videoPosts.length,
    // posts: stats,
    totalViews,
    totalLikes,
    totalShares,
    totalSaves,
    totalComments,
    totalEarnings,
    engagementScore,
    payouts: [
      {
        upcomingPayout: todayEarnings,
        payoutDate,
      },
    ],
  };
};

// Creator Video Analytics Service
export const getCreatorVideoAnalyticsService = async (creatorId, viewType, year) => {
  // Models
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  // Get all posts with a video (not filtered by creator)
  const posts = await Post.findAll({ where: { video: { [Op.ne]: null } } });
  const postIds = posts.map((p) => p.id);

  let data = {};
  if (viewType === "month") {
    // Prepare month keys
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let m = 0; m < 12; m++) {
      data[months[m]] = 0;
    }
    // For each month, sum all video post views
    for (let month = 0; month < 12; month++) {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      let monthViews = 0;
      for (const postId of postIds) {
        const views = await PostStats.sum("views", { where: { postId, createdAt: { [Op.gte]: start, [Op.lt]: end } } });
        monthViews += views || 0;
      }
      data[months[month]] = monthViews;
    }
  } else if (viewType === "week") {
    // Days of the week
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach(day => data[day] = 0);

    // Get current date and calculate start of this week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Calculate how many days to subtract to get to Monday
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    // For each day, calculate views
    for (let i = 0; i < 7; i++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() + i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      let dayViews = 0;
      for (const postId of postIds) {
        const views = await PostStats.sum("views", { where: { postId, createdAt: { [Op.gte]: start, [Op.lt]: end } } });
        dayViews += views || 0;
      }
      data[days[i]] = dayViews;
    }
  } else {
    throw new Error("Invalid viewType. Use 'month' or 'week'.");
  }

  return {
    viewType,
    year,
    data,
  };
};
// Get all video posts sorted by views (top first)
export const getAllClipsSortedByViewsService = async () => {
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  const User = UserModel(sequelize);

  // Find all video posts
  const posts = await Post.findAll({ where: { video: { [Op.ne]: null } } });
  // Get views for each post
  const postViews = await Promise.all(posts.map(async (post) => {
    const views = await PostStats.sum("views", { where: { postId: post.id } });
    return { post, views: views || 0 };
  }));
  // Sort by views descending
  postViews.sort((a, b) => b.views - a.views);

  // Map to response format
  const now = new Date();
  const result = await Promise.all(postViews.map(async ({ post, views }) => {
    const creator = await User.findByPk(post.userId);
    const postedDate = post.createdAt;
    const diffMs = now - postedDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let postedAgo = "Posted today";
    if (diffDays === 1) postedAgo = "Posted 1 day ago";
    else if (diffDays < 7) postedAgo = `Posted ${diffDays} days ago`;
    else if (diffDays < 30) postedAgo = `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    else if (diffDays < 365) postedAgo = `Posted ${Math.floor(diffDays / 30)} months ago`;
    else postedAgo = `Posted ${Math.floor(diffDays / 365)} years ago`;
    return {
      id: post.id,
      title: post.title,
      video: post.video,
      description: post.description,
      createdAt: post.createdAt,
      postedAgo,
      views,
      creator: creator ? {
        id: creator.id,
        first_name: creator.first_name,
        last_name: creator.last_name,
        user_name: creator.user_name,
        avatarUrl: creator.avatarUrl,
      } : null,
    };
  }));
  return result;
};
// Get top performing video post (clip) with details
export const getTopPerformingClipService = async () => {
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  const User = UserModel(sequelize);

  // Find all video posts
  const posts = await Post.findAll({ where: { video: { [Op.ne]: null } } });
  let topPost = null;
  let topViews = -1;
  let topStats = null;
  for (const post of posts) {
    const views = await PostStats.sum("views", { where: { postId: post.id } });
    if ((views || 0) > topViews) {
      topViews = views || 0;
      topPost = post;
      topStats = { views: topViews };
    }
  }
  if (!topPost) return null;

  // Get creator info
  const creator = await User.findByPk(topPost.userId);

  // Human-readable posted date
  const postedDate = topPost.createdAt;
  const now = new Date();
  const diffMs = now - postedDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let postedAgo = "Posted today";
  if (diffDays === 1) postedAgo = "Posted 1 day ago";
  else if (diffDays < 7) postedAgo = `Posted ${diffDays} days ago`;
  else if (diffDays < 30) postedAgo = `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  else if (diffDays < 365) postedAgo = `Posted ${Math.floor(diffDays / 30)} months ago`;
  else postedAgo = `Posted ${Math.floor(diffDays / 365)} years ago`;

  return {
    id: topPost.id,
    title: topPost.title,
    video: topPost.video,
    description: topPost.description,
    createdAt: topPost.createdAt,
    postedAgo,
    views: topStats.views,
    creator: creator ? {
      id: creator.id,
      first_name: creator.first_name,
      last_name: creator.last_name,
      user_name: creator.user_name,
      avatarUrl: creator.avatarUrl,
    } : null,
  };
};
// Edit a video post (clip) by id
export const editClipService = async (id, updateData) => {
  const Post = PostModel(sequelize, DataTypes);
  const post = await Post.findByPk(id);
  if (!post) return null;
  await post.update(updateData);
  return post;
};

// Delete a video post (clip) by id
export const deleteClipService = async (id) => {
  const Post = PostModel(sequelize, DataTypes);
  const post = await Post.findByPk(id);
  if (!post) return false;
  await post.destroy();
  return true;
};

// Get creator's video clips stats
export const getCreatorClipsStatsService = async (creatorId) => {
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  const PostLike = PostLikeModel(sequelize, DataTypes);
  const BuyerShare = BuyerShareModel(sequelize, DataTypes);
  const BuyerSavedPost = BuyerSavedPostModel(sequelize, DataTypes);

  // Find all posts for this creator
  const posts = await Post.findAll({ where: { userId: creatorId } });
  // Only count posts with a non-empty video string
  const videoPosts = posts.filter((p) => typeof p.video === 'string' && p.video.trim() !== '');
  const postIds = videoPosts.map((p) => p.id);
  const totalVideos = videoPosts.length;

  // Total views
  let totalViews = 0;
  for (const postId of postIds) {
    const views = await PostStats.sum("views", { where: { postId } });
    totalViews += views || 0;
  }

  // Total likes
  const totalLikes = postIds.length > 0 ? await PostLike.count({ where: { postId: { [Op.in]: postIds } } }) : 0;
  // Total shares
  const totalShares = postIds.length > 0 ? await BuyerShare.count({ where: { postId: { [Op.in]: postIds } } }) : 0;
  // Total saves
  const totalSaves = postIds.length > 0 ? await BuyerSavedPost.count({ where: { postId: { [Op.in]: postIds } } }) : 0;

  // Dummy earning logic: $0.01 per view, $0.05 per like, $0.10 per share
  const totalEarning = (totalViews * 0.01) + (totalLikes * 0.05) + (totalShares * 0.1);

  // Engagement score: sum of all interactions
  const engagementScore = totalLikes + totalShares + totalSaves;

  return {
    totalVideos,
    totalViews,
    totalEarning,
    engagementScore,
    totalLikes,
    totalShares,
    totalSaves,
  };
};
// Service for creator earnings, conversion rate, avg per lead, and current month earnings
export const getCreatorEarningsStatsService = async (creatorId) => {
  const Post = PostModel(sequelize, DataTypes);
  const PostStats = PostStatsModel(sequelize, DataTypes);
  const PostLike = PostLikeModel(sequelize, DataTypes);
  const BuyerShare = BuyerShareModel(sequelize, DataTypes);
  const BuyerSavedPost = BuyerSavedPostModel(sequelize, DataTypes);

  // Get all posts by creator
  const posts = await Post.findAll({ where: { userId: creatorId } });
  const postIds = posts.map((p) => p.id);

  // Total earnings (same logic as dashboard)
  const totalViews = postIds.length > 0 ? await PostStats.sum("views", { where: { postId: { [Op.in]: postIds } } }) : 0;
  const totalLikes = postIds.length > 0 ? await PostLike.count({ where: { postId: { [Op.in]: postIds } } }) : 0;
  const totalShares = postIds.length > 0 ? await BuyerShare.count({ where: { postId: { [Op.in]: postIds } } }) : 0;
  const totalEarnings = (totalViews * 0.01) + (totalLikes * 0.05) + (totalShares * 0.1);

  // Conversion rate and avg per lead (dummy: leads = posts, converted = posts with claimed=true)
  const totalLeads = await Post.count({ where: { userId: creatorId } });
  const convertedLeads = await Post.count({ where: { userId: creatorId, claimed: true } });
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const avgPerLead = totalLeads > 0 ? totalEarnings / totalLeads : 0;

  // Current month earnings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthViews = postIds.length > 0 ? await PostStats.sum("views", { where: { postId: { [Op.in]: postIds }, createdAt: { [Op.gte]: startOfMonth, [Op.lt]: endOfMonth } } }) : 0;
  const monthLikes = postIds.length > 0 ? await PostLike.count({ where: { postId: { [Op.in]: postIds }, createdAt: { [Op.gte]: startOfMonth, [Op.lt]: endOfMonth } } }) : 0;
  const monthShares = postIds.length > 0 ? await BuyerShare.count({ where: { postId: { [Op.in]: postIds }, createdAt: { [Op.gte]: startOfMonth, [Op.lt]: endOfMonth } } }) : 0;
  const currentMonthEarnings = (monthViews * 0.01) + (monthLikes * 0.05) + (monthShares * 0.1);

  return {
    totalEarnings,
    conversionRate,
    avgPerLead,
    currentMonthEarnings,
    totalLeads,
    convertedLeads,
  };
};
