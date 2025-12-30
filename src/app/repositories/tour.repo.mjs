import { col, fn, Op } from "sequelize";
import {
  TourRequest,
  Post,
  User,
  TourRejection,
} from "../../models/tourModel/index.mjs";
import { BuyerReviewPost } from "../../models/buyerReviewPostModel/index.mjs";

const tourRepo = {
  createTourRequest: async (data) => {
    return await TourRequest.create({ ...data, bookingStatus: "pending" });
  },

  // Get tours by expiredStatus
  getToursByStatus: async (status) => {
    return await TourRequest.findAll({
      where: { expiredStatus: status },
    });
  },
  getTourRequestsByBuyer: async (buyerId) => {
    return await TourRequest.findAll({ where: { buyerId } });
  },
  getTourRequestsByAgent: async (agentId) => {
    return await TourRequest.findAll({ where: { agentId } });
  },
  // getAllToursWithDetails: async () => {
  //   return await TourRequest.findAll({
  //     include: [
  //       { model: Post, as: "post" },
  //       { model: User, as: "buyer" },
  //       { model: User, as: "agent" },
  //     ],
  //   });
  // },
  getAllToursWithDetails: async (buyerId) => {
    const whereClause = buyerId ? { buyerId } : {};
    // Pagination: get page/limit from env or default
    const DEFAULT_LIMIT = 20;
    let page = 1;
    let limit = DEFAULT_LIMIT;
    if (typeof globalThis.__TOUR_LEADS_PAGE === 'number') page = globalThis.__TOUR_LEADS_PAGE;
    if (typeof globalThis.__TOUR_LEADS_LIMIT === 'number') limit = globalThis.__TOUR_LEADS_LIMIT;
    const offset = (page - 1) * limit;

    const tours = await TourRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Post,
          as: "post",
          attributes: {
            exclude: ["createdAt", "updatedAt"], // optional
          },
        },
        {
          model: User,
          as: "buyer",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "user_name",
            "email",
            "contact",
            "role",
            "avatarUrl",
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
            "contact",
            "role",
            "avatarUrl",
          ],
        },
      ],
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
      offset,
      limit,
    });

    // Parse JSON fields in posts
    // return tours.map((tour) => {
    //   const post = tour.post?.toJSON ? tour.post.toJSON() : tour.post;

    //   return {
    //     ...tour.toJSON(),
    //     post: {
    //       ...post,
    //       tags: post?.tags ? JSON.parse(post.tags) : [],
    //       homeStyle: post?.homeStyle ? JSON.parse(post.homeStyle) : [],
    //       amenities: post?.amenities ? JSON.parse(post.amenities) : [],
    //       images: post?.images ? JSON.parse(post.images) : [],
    //     },
    //   };
    // });
    // Helper: safely parse a field that may be an array, JSON string, CSV string, or plain string
    const safeList = (val) => {
      try {
        if (val == null) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "object") return val; 
        if (typeof val !== "string") return [];
        const s = val.trim();
        if (!s) return [];
        // if it's a JSON array/object
        if (s.startsWith("[") || s.startsWith("{")) {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed : parsed;
        }
        // fallback: CSV split
        if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
        // single token string -> wrap as array for uniformity
        return [s];
      } catch (_) {
        // last resort: return original string wrapped in array
        return typeof val === "string" ? [val] : [];
      }
    };

    return Promise.all(
      tours.map(async (tour) => {
        const tourJson = tour.toJSON();
        const post = tourJson.post || {};

        // --- Reviews for this post ---
        let reviewCount = 0;
        let ratingCount = 0;
        let views = 0;
        if (post.id) {
          reviewCount = await BuyerReviewPost.count({
            where: { postId: post.id },
          });

          const avgRatingResult = await BuyerReviewPost.findOne({
            attributes: [[fn("AVG", col("rating")), "avgRating"]],
            where: { postId: post.id },
            raw: true,
          });

          if (avgRatingResult && avgRatingResult.avgRating !== null) {
            ratingCount = parseFloat(
              Number(avgRatingResult.avgRating).toFixed(1)
            );
          }
          // Get views from PostStats
          const { PostStats } = await import("../../models/postModel/index.mjs");
          views = await PostStats.sum("views", { where: { postId: post.id } });
        }

        return {
          ...tourJson,
          post: {
            ...post,
            tags: safeList(post?.tags),
            homeStyle: safeList(post?.homeStyle),
            amenities: safeList(post?.amenities),
            images: safeList(post?.images),
            reviewCount,
            ratingCount,
            views: views || 0,
          },
        };
      })
    );
  },

  getPaginatedTours: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await TourRequest.findAndCountAll({
      include: [
        { model: Post, as: "post" },
        { model: User, as: "buyer" },
        { model: User, as: "agent" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    };
  },
  deleteTourById: async (tourId) => {
    const deletedCount = await TourRequest.destroy({
      where: { id: tourId },
    });

    return deletedCount;
  },
  updateActiveLeadById: async (tourId) => {
    return await TourRequest.update(
      {
        activeLead: true,
        status: "Confirmed Claimed",
        bookingStatus: "active",
      },
      { where: { id: tourId } }
    );
  },
  createTourRejection: async (data) => {
    return await TourRejection.create(data);
  },
  findRejectionsByAgent: async (agentId) => {
    return await TourRejection.findAll({ where: { agentId } });
  },
  getAllTours: async () => {
    return await TourRequest.findAll({
      include: [
        { model: Post, as: "post" },
        { model: User, as: "buyer" },
        { model: User, as: "agent" },
      ],
    });
  },

  getToursExcludingRejected: async (agentId) => {
    const rejectedTours = await TourRejection.findAll({
      attributes: ["tourRequestId"],
      where: { agentId },
    });

    const rejectedIds = rejectedTours.map((rt) => rt.tourRequestId);

    return await TourRequest.findAll({
      where: {
        id: { [Op.notIn]: rejectedIds },
      },
      include: [{ model: User, as: "customer" }],
    });
  },
  getAgentToursByDateRange: async (agentId, startDate, endDate) => {
    return await TourRequest.findAll({
      where: {
        agentId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: { exclude: ["passwordHash"] },
        },
      ],
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });
  },
  updateTourStatusById: async (tourId, status) => {
    return await TourRequest.update({ status }, { where: { id: tourId } });
  },
  updateTourBookingStatusById: async (tourId, bookingStatus) => {
    return await TourRequest.update(
      { bookingStatus },
      { where: { id: tourId } }
    );
  },
};
export default tourRepo;
