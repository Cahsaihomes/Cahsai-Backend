

import * as dashboardService from "../app/services/dashboard.service.mjs";
// Controller for creator video analytics
export const getCreatorVideoAnalyticsController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only creators can view their video analytics.",
      });
    }
    const creatorId = req.user.id;
    const { viewType = "week", year = new Date().getFullYear() } = req.query;

    const data = await dashboardService.getCreatorVideoAnalyticsService(
      creatorId,
      viewType,
      year
    );

    return res.status(200).json({
      success: true,
      message: `Creator video analytics (${viewType}) for year ${year} fetched successfully`,
      data,
    });
  } catch (error) {
    console.error("Creator Video Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching creator video analytics",
    });
  }
};
export const getAgentDashboardController = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only agents can view this dashboard.",
      });
    }

    const agentId = req.user.id;
    const data = await dashboardService.getAgentDashboardService(agentId);

    return res.status(200).json({
      success: true,
      message: "Agent Dashboard fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard",
    });
  }
};

export const getAgentCustomersController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only agents can view thier customers.",
      });
    }
    const agentId = req.user.id;

    const customers = await dashboardService.getAgentCustomersService(agentId);

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (err) {
    console.error("Error in getAgentCustomersController:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUpcomingToursController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only agents can view their customers.",
      });
    }
    const agentId = req.user.id;
    const tours = await dashboardService.getUpcomingToursService(agentId);

    return res.status(200).json({
      success: true,
      message: "Upcoming tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    console.error("Upcoming Tours Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching upcoming tours",
    });
  }
};

export const getAgentClaimedTourController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only agents can view their Claimed Tours.",
      });
    }
    const agentId = req.user.id;
    const data = await dashboardService.getAgentClaimedTourService(agentId);

    return res.status(200).json({
      success: true,
      message: "Claimed tours by month fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Agent Claimed Tour Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching claimed tours by month",
    });
  }
};

export const getVideoAnalyticsController = async (req, res) => {
  console.log("getVideoAnalyticsController called", req.user, req.query);
  
  try {
    const user = req.user;
    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only agents can view their video analytics.",
      });
    }
    const agentId = req.user.id;
    const { viewType = "week", year = new Date().getFullYear() } = req.query;

    const data = await dashboardService.getVideoAnalyticsService(
      agentId,
      viewType,
      year
    );

    return res.status(200).json({
      success: true,
      message: `Video analytics (${viewType}) for year ${year} fetched successfully`,
      data,
    });
  } catch (error) {
    console.error("Video Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching video analytics",
    });
  }
};
// Creator Dashboard Controller
export const getCreatorDashboardController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only creators can view this dashboard.",
      });
    }
    const creatorId = req.user.id;
    const { month, year } = req.query;
    const data = await dashboardService.getCreatorDashboardService(creatorId, month, year);
    return res.status(200).json({
      success: true,
      message: "Creator dashboard fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Creator Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching creator dashboard",
    });
  }
};

// Controller for all clips sorted by views
export const getAllClipsSortedByViewsController = async (req, res) => {
  try {
    const data = await dashboardService.getAllClipsSortedByViewsService();
    return res.status(200).json({
      success: true,
      message: "All video clips sorted by views (top first)",
      data
    });
  } catch (error) {
    console.error("All Clips Sorted By Views Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching video clips"
    });
  }
};
// Controller for top performing clip
export const getTopPerformingClipController = async (req, res) => {
  try {
    const data = await dashboardService.getAllClipsSortedByViewsService();
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No video clips found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "All video clips sorted by views (top first)",
      data
    });
  } catch (error) {
    console.error("Top Performing Clip Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching video clips"
    });
  }
};
// Edit a video post (clip) by id
export const editTopPerformingClipController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const post = await dashboardService.editClipService(id, updateData);
    if (!post) {
      return res.status(404).json({ success: false, message: "Clip not found." });
    }
    return res.status(200).json({ success: true, message: "Clip updated successfully", data: post });
  } catch (error) {
    console.error("Edit Clip Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while editing the clip" });
  }
};

// Delete a video post (clip) by id
export const deleteTopPerformingClipController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dashboardService.deleteClipService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Clip not found." });
    }
    return res.status(200).json({ success: true, message: "Clip deleted successfully" });
  } catch (error) {
    console.error("Delete Clip Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while deleting the clip" });
  }
};
// Controller for creator clips stats
export const getCreatorClipsStatsController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only creators can view their clips stats."
      });
    }
    const creatorId = req.user.id;
    const data = await dashboardService.getCreatorClipsStatsService(creatorId);
    return res.status(200).json({
      success: true,
      message: "Creator clips stats fetched successfully",
      data
    });
  } catch (error) {
    console.error("Creator Clips Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching creator clips stats"
    });
  }
};
// Controller for creator earnings, conversion rate, avg per lead, and current month earnings
export const getCreatorEarningsStatsController = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only creators can view their earnings stats."
      });
    }
    const creatorId = req.user.id;
    const stats = await dashboardService.getCreatorEarningsStatsService(creatorId);
    return res.status(200).json({
      success: true,
      message: "Creator earnings stats fetched successfully",
      data: stats
    });
  } catch (error) {
    console.error("Creator Earnings Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching creator earnings stats"
    });
  }
};
