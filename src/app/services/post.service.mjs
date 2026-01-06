import { col, fn } from "sequelize";
import { User } from "../../models/postModel/index.mjs";
import postRepo from "../repositories/post.repo.mjs";

export const createPost = async (postData, userId) => {
  const newPost = await postRepo.createPost({ ...postData, userId });
  return {
    status: "success",
    message: "Post created successfully",
    data: newPost,
  };
};
export const getUserPosts = async (userId) => {
  const posts = await postRepo.getPostsByUserId(userId);
  const { PostStats } = await import("../../models/postModel/index.mjs");
  const parsedPosts = await Promise.all(
    posts.map(async (post) => {
      const views = await PostStats.sum("views", {
        where: { postId: post.id },
      });
      const raw = post.toJSON ? post.toJSON() : post;

      const safeParse = (value) => {
        if (!value) return [];
        if (typeof value === "string" && value.trim().startsWith("[")) {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return typeof value === "string" ? [value] : value;
      };

      let author = raw.user || null;
      if (author && author.toJSON) author = author.toJSON();
      const toArray = (v) => (Array.isArray(v) ? v : v ? JSON.parse(v) : []);

      return {
        ...raw,
        tags: safeParse(raw.tags),
        homeStyle: safeParse(raw.homeStyle),
        amenities: safeParse(raw.amenities),
        images: safeParse(raw.images),
        video:
          raw.video &&
          typeof raw.video === "string" &&
          raw.video.trim().startsWith("[")
            ? JSON.parse(raw.video)
            : raw.video,
        user: author
          ? {
              id: author.id,
              first_name: author.first_name,
              last_name: author.last_name,
              user_name: author.user_name,
              role: author.role,
              avatarUrl: author.avatarUrl,
              followers_count: toArray(author.followers_ids).length,
              following_count: toArray(author.following_ids).length,
            }
          : null,
        totalViews: views || 0,
        // NEW PROPERTY FIELDS:
        street: raw.street || null,
        unit: raw.unit || null,
        state: raw.state || null,
        propertyType: raw.propertyType || null,
        lotSize: raw.lotSize || null,
        yearBuilt: raw.yearBuilt || null,
        hoaFees: raw.hoaFees || null,
        agentName: raw.agentName || null,
        brokerageName: raw.brokerageName || null,
        stateDisclosures: raw.stateDisclosures || null,
        publishToWatchHomes: raw.publishToWatchHomes || false,
        postType: raw.postType || null,
        linkedPostId: raw.linkedPostId || null,
      };
    }),
  );
  return {
    status: "success",
    message: "Posts fetched successfully",
    count: parsedPosts.length,
    data: parsedPosts,
  };
};
export const getPaginatedPosts = async (page, pageSize) => {
  const result = await postRepo.getPaginatedPosts(page, pageSize);
  const parsedPosts = result.posts.map((post) => {
    const raw = post.toJSON ? post.toJSON() : post;

    const safeParse = (value) => {
      if (!value) return [];
      if (typeof value === "string" && value.trim().startsWith("[")) {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return typeof value === "string" ? [value] : value;
    };

    // Attach author info with follower/following counts
    let author = raw.user || null;
    if (author && author.toJSON) author = author.toJSON();
    const toArray = (v) => (Array.isArray(v) ? v : v ? JSON.parse(v) : []);

    return {
      ...raw,
      tags: safeParse(raw.tags),
      homeStyle: safeParse(raw.homeStyle),
      amenities: safeParse(raw.amenities),
      images: safeParse(raw.images),
      video:
        raw.video &&
        typeof raw.video === "string" &&
        raw.video.trim().startsWith("[")
          ? JSON.parse(raw.video)
          : raw.video,
      user: author
        ? {
            id: author.id,
            first_name: author.first_name,
            last_name: author.last_name,
            user_name: author.user_name,
            role: author.role,
            avatarUrl: author.avatarUrl,
            followers_count: toArray(author.followers_ids).length,
            following_count: toArray(author.following_ids).length,
          }
        : null,
      // NEW PROPERTY FIELDS:
      street: raw.street || null,
      unit: raw.unit || null,
      state: raw.state || null,
      propertyType: raw.propertyType || null,
      lotSize: raw.lotSize || null,
      yearBuilt: raw.yearBuilt || null,
      hoaFees: raw.hoaFees || null,
      agentName: raw.agentName || null,
      brokerageName: raw.brokerageName || null,
      stateDisclosures: raw.stateDisclosures || null,
      publishToWatchHomes: raw.publishToWatchHomes || false,
      postType: raw.postType || null,
      linkedPostId: raw.linkedPostId || null,
    };
  });
  return {
    status: "success",
    message: "Posts fetched successfully",
    total: result.total,
    page,
    pageSize,
    data: parsedPosts,
  };
};

// export const getAllPosts = async () => {
//   const posts = await postRepo.getAllPosts({
//     include: [
//       {
//         model: User,
//         as: "user",
//         attributes: [
//           "first_name",
//           "last_name",
//           "user_name",
//           "role",
//           "avatarUrl",
//           "contact",
//           "email",
//         ],
//       },
//     ],
//   });

//   const parsedPosts = posts.map((post) => {
//   // Import models directly for counting
//   const { BuyerReviewPost } = await import("../../models/buyerReviewPostModel/index.mjs");
//   const { BuyerShare } = await import("../../models/buyerSharePostModel/index.mjs");
//   const { BuyerSavedPost } = await import("../../models/buyerSavedPostModel/index.mjs");

//   const posts = await postRepo.getAllPosts();

//   const parsedPosts = await Promise.all(posts.map(async (post) => {
//     const raw = post.toJSON ? post.toJSON() : post;

//     const safeParse = (value) => {
//       if (!value) return [];
//       if (typeof value === "string" && value.trim().startsWith("[")) {
//         try {
//           return JSON.parse(value);
//         } catch {
//           return [];
//         }
//       }
//       return typeof value === "string" ? [value] : value;
//     };

//     // Attach user data if present
//     let user = raw.user || null;
//     if (user && user.toJSON) user = user.toJSON();

//   // Get counts for likes, comments, shares
//   const { getPostLikeCount } = await import("./postLike.service.mjs");
//   const likeCount = await getPostLikeCount(raw.id);
//   // Count all comments (including replies) for this post
//   const { sequelize } = await import("../../models/postModel/index.mjs");
//   const { default: PostCommentModel } = await import("../../models/postModel/postComment.model.mjs");
//   const { DataTypes } = await import("sequelize");
//   const PostComment = PostCommentModel(sequelize, DataTypes);
//   const commentCount = await PostComment.count({ where: { postId: raw.id } });
//   const shareCount = await BuyerShare.count({ where: { postId: raw.id } });

//     return {
//       ...raw,
//       tags: safeParse(raw.tags),
//       homeStyle: safeParse(raw.homeStyle),
//       amenities: safeParse(raw.amenities),
//       images: safeParse(raw.images),
//       video:
//         raw.video &&
//         typeof raw.video === "string" &&
//         raw.video.trim().startsWith("[")
//           ? JSON.parse(raw.video)
//           : raw.video,
//       user,
//       likeCount,
//       commentCount,
//       shareCount,
//     };
//   }));
//   return {
//     status: "success",
//     message: "All posts fetched successfully",
//     total: posts.length,
//     data: parsedPosts,
//   }
//   }
export const getAllPosts = async () => {
  // Import models directly for counting
  const { BuyerReviewPost } =
    await import("../../models/buyerReviewPostModel/index.mjs");
  const { BuyerShare } =
    await import("../../models/buyerSharePostModel/index.mjs");
  const { BuyerSavedPost } =
    await import("../../models/buyerSavedPostModel/index.mjs");
  const { getPostLikeCount } = await import("./postLike.service.mjs");
  const { sequelize } = await import("../../models/postModel/index.mjs");
  const { default: PostCommentModel } =
    await import("../../models/postModel/postComment.model.mjs");
  const { DataTypes } = await import("sequelize");

  const PostComment = PostCommentModel(sequelize, DataTypes);

  // Fetch all posts with user info
  const posts = await postRepo.getAllPosts({
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "first_name",
          "last_name",
          "user_name",
          "role",
          "avatarUrl",
          "contact",
          "email",
        ],
      },
    ],
  });

  // Helper to safely parse JSON fields
  const safeParse = (value) => {
    if (!value) return [];
    if (typeof value === "string" && value.trim().startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return typeof value === "string" ? [value] : value;
  };

  const parsedPosts = await Promise.all(
    posts.map(async (post) => {
      const raw = post.toJSON ? post.toJSON() : post;

      // Attach user data if present
      let user = raw.user || null;
      if (user && user.toJSON) user = user.toJSON();

      // Get counts for likes, comments, shares
      const likeCount = await getPostLikeCount(raw.id);
      const commentCount = await PostComment.count({
        where: { postId: raw.id },
      });
      const shareCount = await BuyerShare.count({ where: { postId: raw.id } });
      // --- Reviews ---
      const reviewCount = await BuyerReviewPost.count({
        where: { postId: raw.id },
      });

      const avgRatingResult = await BuyerReviewPost.findOne({
        attributes: [[fn("AVG", col("rating")), "avgRating"]],
        where: { postId: raw.id },
        raw: true,
      });
      let ratingCount = 0;
      if (avgRatingResult && avgRatingResult.avgRating !== null) {
        ratingCount = parseFloat(Number(avgRatingResult.avgRating).toFixed(1));
      }

      return {
        ...raw,
        tags: safeParse(raw.tags),
        homeStyle: safeParse(raw.homeStyle),
        amenities: safeParse(raw.amenities),
        images: safeParse(raw.images),
        video:
          raw.video &&
          typeof raw.video === "string" &&
          raw.video.trim().startsWith("[")
            ? JSON.parse(raw.video)
            : raw.video,
        user,
        likeCount,
        commentCount,
        shareCount,
        ratingCount,
        reviewCount,
        // ADD ALL NEW RENTAL FIELDS HERE:
        listing_type: raw.listing_type || "FOR_SALE",
        monthly_rent: raw.monthly_rent || null,
        security_deposit: raw.security_deposit || null,
        lease_term: raw.lease_term || null,
        available_from: raw.available_from || null,
        pet_policy: raw.pet_policy || null,
        parking: raw.parking || null,
        furnished: raw.furnished || false,
        application_url: raw.application_url || null,
        manager_id: raw.manager_id || null,
        is_verified_manager: raw.is_verified_manager || false,
        // NEW PROPERTY FIELDS:
        street: raw.street || null,
        unit: raw.unit || null,
        state: raw.state || null,
        propertyType: raw.propertyType || null,
        lotSize: raw.lotSize || null,
        yearBuilt: raw.yearBuilt || null,
        hoaFees: raw.hoaFees || null,
        agentName: raw.agentName || null,
        brokerageName: raw.brokerageName || null,
        stateDisclosures: raw.stateDisclosures || null,
        publishToWatchHomes: raw.publishToWatchHomes || false,
        postType: raw.postType || null,
        linkedPostId: raw.linkedPostId || null,
      };
    }),
  );

  return {
    status: "success",
    message: "All posts fetched successfully",
    total: posts.length,
    data: parsedPosts,
  };
};

export const updatePost = async (postId, userId, updateData) => {
  const updatedPost = await postRepo.updatePostById(postId, userId, updateData);

  if (!updatedPost) {
    return { status: "error", message: "Post not found or unauthorized" };
  }

  return {
    status: "success",
    message: "Post updated successfully",
    data: updatedPost,
  };
};

export const deletePost = async (postId, userId) => {
  const post = await postRepo.getPostById(postId);
  if (!post || post.userId !== userId) {
    return { status: "error", message: "Post not found or unauthorized" };
  }

  await postRepo.deleteByPostId(postId);

  await postRepo.deleteById(postId);

  return {
    status: "success",
    message: "Post and related stats deleted successfully",
  };
};
export const getPostPerformance = async (agentId) => {
  const { currentMonthViews, previousMonthViews } =
    await postRepo.getPostViews(agentId);

  const percentageChange =
    previousMonthViews === 0
      ? 100
      : ((currentMonthViews - previousMonthViews) / previousMonthViews) * 100;

  return {
    totalViews: currentMonthViews,
    changePercent: parseFloat(percentageChange.toFixed(2)),
  };
};
export const getPostConversion = async (agentId) => {
  const { totalLeads, activeLeads } = await postRepo.getLeadConversion(agentId);

  const conversionRate =
    totalLeads === 0 ? 0 : (activeLeads / totalLeads) * 100;

  return {
    conversionRate: parseFloat(conversionRate.toFixed(2)), // %
    activeListings: activeLeads,
    totalLeads,
  };
};
