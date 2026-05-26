import { col, fn, Op } from "sequelize";
import { User } from "../../models/userModel/index.mjs";
import postRepo from "../repositories/post.repo.mjs";

const disabledCloudinaryCloudNames = new Set(
  (process.env.CLOUDINARY_DISABLED_CLOUD_NAMES || "dgp7glwvw")
    .split(",")
    .map((cloudName) => cloudName.trim())
    .filter(Boolean)
);

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
        videos: safeParse(raw.videos),
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
        features: raw.features || null,
        discoveryStay: raw.discoveryStay || false,
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
      videos: safeParse(raw.videos),
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
      // features: raw.features || null,
      discoveryStay: raw.discoveryStay || false,
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
  const { BuyerReviewPost } = await import(
    "../../models/buyerReviewPostModel/index.mjs"
  );
  const { BuyerShare } = await import("../../models/buyerSharePostModel/index.mjs");
  const { PostComment, PostLike } = await import("../../models/postModel/index.mjs");

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

  const postIds = posts.map((post) => post.id);

  if (postIds.length === 0) {
    return {
      status: "success",
      message: "All posts fetched successfully",
      total: 0,
      data: [],
    };
  }

  const [
    likeRows,
    commentRows,
    shareRows,
    reviewRows,
  ] = await Promise.all([
    PostLike.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    PostComment.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    BuyerShare.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    BuyerReviewPost.findAll({
      attributes: [
        "postId",
        [fn("COUNT", col("id")), "reviewCount"],
        [fn("AVG", col("rating")), "avgRating"],
      ],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
  ]);

  const countMap = (rows, field = "count") =>
    new Map(rows.map((row) => [Number(row.postId), Number(row[field] || 0)]));

  const likeCounts = countMap(likeRows);
  const commentCounts = countMap(commentRows);
  const shareCounts = countMap(shareRows);
  const reviewCounts = countMap(reviewRows, "reviewCount");
  const ratingCounts = new Map(
    reviewRows.map((row) => [
      Number(row.postId),
      row.avgRating === null ? 0 : parseFloat(Number(row.avgRating).toFixed(1)),
    ])
  );

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

  const parsedPosts = posts.map((post) => {
      const raw = post.toJSON ? post.toJSON() : post;

      // Attach user data if present
      let user = raw.user || null;
      if (user && user.toJSON) user = user.toJSON();

      const postId = Number(raw.id);
      const likeCount = likeCounts.get(postId) || 0;
      const commentCount = commentCounts.get(postId) || 0;
      const shareCount = shareCounts.get(postId) || 0;
      const reviewCount = reviewCounts.get(postId) || 0;
      const ratingCount = ratingCounts.get(postId) || 0;

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
        videos: safeParse(raw.videos),
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
        features: raw.features || null,
        discoveryStay: raw.discoveryStay || false,
      };
    });

  return {
    status: "success",
    message: "All posts fetched successfully",
    total: posts.length,
    data: parsedPosts,
  };
};

export const getFeedPosts = async ({ type = "sale", cursor, limit = 10 } = {}) => {
  const { BuyerReviewPost } = await import(
    "../../models/buyerReviewPostModel/index.mjs"
  );
  const { BuyerShare } = await import("../../models/buyerSharePostModel/index.mjs");
  const { Post, PostComment, PostLike } = await import("../../models/postModel/index.mjs");

  const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 20);
  const listingWhere =
    type === "rent"
      ? { listing_type: "FOR_RENT" }
      : type === "stays"
        ? { listing_type: "STAY" }
        : {
            [Op.or]: [
              { listing_type: "FOR_SALE" },
              { listing_type: null },
            ],
          };

  const where = {
    ...listingWhere,
    [Op.and]: [
      { video: { [Op.ne]: null } },
      { video: { [Op.ne]: "" } },
      ...Array.from(disabledCloudinaryCloudNames).map((cloudName) => ({
        video: { [Op.notLike]: `%res.cloudinary.com/${cloudName}/%` },
      })),
    ],
  };

  if (cursor) {
    const [cursorCreatedAt, cursorId] = String(cursor).split("|");
    const cursorDate = new Date(cursorCreatedAt);
    const parsedCursorId = Number(cursorId);

    if (!Number.isNaN(cursorDate.getTime()) && Number.isFinite(parsedCursorId)) {
      where[Op.and] = [
        ...where[Op.and],
        {
          [Op.or]: [
            { createdAt: { [Op.lt]: cursorDate } },
            {
              createdAt: cursorDate,
              id: { [Op.lt]: parsedCursorId },
            },
          ],
        },
      ];
    }
  }

  const posts = await Post.findAll({
    where,
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    limit: pageSize + 1,
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
          "contact",
          "email",
        ],
      },
    ],
  });

  const pagePosts = posts.slice(0, pageSize);
  const postIds = pagePosts.map((post) => post.id);

  const safeParse = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim().startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return typeof value === "string" ? [value] : value;
  };

  if (postIds.length === 0) {
    return {
      status: "success",
      message: "Feed posts fetched successfully",
      data: [],
      nextCursor: null,
    };
  }

  const [likeRows, commentRows, shareRows, reviewRows] = await Promise.all([
    PostLike.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    PostComment.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    BuyerShare.findAll({
      attributes: ["postId", [fn("COUNT", col("id")), "count"]],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
    BuyerReviewPost.findAll({
      attributes: [
        "postId",
        [fn("COUNT", col("id")), "reviewCount"],
        [fn("AVG", col("rating")), "avgRating"],
      ],
      where: { postId: { [Op.in]: postIds } },
      group: ["postId"],
      raw: true,
    }),
  ]);

  const countMap = (rows, field = "count") =>
    new Map(rows.map((row) => [Number(row.postId), Number(row[field] || 0)]));
  const likeCounts = countMap(likeRows);
  const commentCounts = countMap(commentRows);
  const shareCounts = countMap(shareRows);
  const reviewCounts = countMap(reviewRows, "reviewCount");
  const ratingCounts = new Map(
    reviewRows.map((row) => [
      Number(row.postId),
      row.avgRating === null ? 0 : parseFloat(Number(row.avgRating).toFixed(1)),
    ])
  );

  const data = pagePosts.map((post) => {
    const raw = post.toJSON ? post.toJSON() : post;
    const postId = Number(raw.id);
    const user = raw.user?.toJSON ? raw.user.toJSON() : raw.user;

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
      videos: safeParse(raw.videos),
      user,
      likeCount: likeCounts.get(postId) || 0,
      commentCount: commentCounts.get(postId) || 0,
      shareCount: shareCounts.get(postId) || 0,
      ratingCount: ratingCounts.get(postId) || 0,
      reviewCount: reviewCounts.get(postId) || 0,
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
      features: raw.features || null,
      discoveryStay: raw.discoveryStay || false,
    };
  });

  const lastPost = pagePosts[pagePosts.length - 1];
  const nextCursor =
    posts.length > pageSize && lastPost
      ? `${lastPost.createdAt.toISOString()}|${lastPost.id}`
      : null;

  return {
    status: "success",
    message: "Feed posts fetched successfully",
    data,
    nextCursor,
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
