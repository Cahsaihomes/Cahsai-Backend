import { Post, PostStats } from "../../models/postModel/index.mjs";
import { TourRequest } from "../../models/tourModel/index.mjs";
import { User } from "../../models/userModel/index.mjs";
import { Op, fn, col, literal } from "sequelize";

const agentPerformanceRepo = {
  getAgentPerformance: async (agentId) => {
    const totalPostViews =
      (await PostStats.sum("views", {
        include: [
          {
            model: Post,
            as: "Post",
            attributes: [],
            where: { userId: agentId },
          },
        ],
      })) || 0;

    const totalPosts = await Post.count({ where: { userId: agentId } });

    const totalLeads = await TourRequest.count({ where: { agentId } });

    const convertedLeads = await TourRequest.count({
      where: {
        agentId,
        activeLead: true,
        status: "Confirmed Claimed",
      },
    });

    const pendingTours = await TourRequest.count({
      where: { agentId, status: "New lead" },
    });

    const confirmedTours = await TourRequest.count({
      where: { agentId, status: "Confirmed Claimed" },
    });

    const conversionRate =
      totalLeads > 0
        ? Math.round((convertedLeads / totalLeads) * 100) + "%"
        : "0%";

    return {
      totalPosts, // 👈 added this
      totalPostViews,
      totalLeads,
      convertedLeads,
      pendingTours,
      confirmedTours,
      conversionRate,
    };
  },
  findCustomersByAgent: async (agentId) => {
    const tours = await TourRequest.findAll({
      where: {
        agentId,
        status: "Confirmed Claimed",
      },
      include: [
        {
          model: User,
          as: "buyer",
          where: { role: "buyer" },
        },
      ],
    });

    const uniqueBuyers = [
      ...new Map(tours.map((t) => [t.buyer.id, t.buyer])).values(),
    ];

    return uniqueBuyers;
  },
  getUpcomingTours: async (agentId) => {
    return await TourRequest.findAll({
      where: {
        agentId,
        status: "Confirmed Claimed",
        activeLead: true,
        date: {
          [Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: Post,
          as: "post",
        },
        {
          model: User,
          as: "buyer",
        },
      ],
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });
  },
  getClaimedToursByMonth: async (agentId) => {
    const results = await TourRequest.findAll({
      where: {
        agentId,
        status: "Confirmed Claimed",
        bookingStatus: "active",
        activeLead: true,
      },
      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("COUNT", col("id")), "total"],
      ],
      group: [fn("MONTH", col("date"))],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    // Convert Sequelize results into { Jan: X, Feb: Y, ... }
    const monthMap = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };

    const formatted = Object.fromEntries(
      Object.values(monthMap).map((m) => [m, 0])
    );

    results.forEach((row) => {
      formatted[monthMap[row.month]] = parseInt(row.total, 10);
    });

    return formatted;
  },
  getWeeklyData: async (agentId, year) => {
    const results = await Post.findAll({
      where: {
        userId: agentId,
        video: { [Op.ne]: null },
      },
      attributes: [
        [fn("DAYNAME", col("createdAt")), "day"],
        [fn("COUNT", col("id")), "videoCount"],
      ],
      group: [fn("DAYNAME", col("createdAt"))],
      order: [
        [
          literal(
            "FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')"
          ),
        ],
      ],

      raw: true,
    });

    const formatted = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    results.forEach((row) => {
      formatted[row.day] = parseInt(row.videoCount, 10);
    });

    return formatted;
  },

  getMonthlyData: async (agentId, year) => {
    const results = await Post.findAll({
      where: {
        userId: agentId,
        video: { [Op.ne]: null },
      },
      attributes: [
        [fn("MONTH", col("createdAt")), "month"],
        [fn("COUNT", col("id")), "videoCount"],
      ],
      group: [fn("MONTH", col("createdAt"))],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    const monthMap = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };

    const formatted = Object.fromEntries(
      Object.values(monthMap).map((m) => [m, 0])
    );

    results.forEach((row) => {
      formatted[monthMap[row.month]] = parseInt(row.videoCount, 10);
    });

    return formatted;
  },
};

export default agentPerformanceRepo;
