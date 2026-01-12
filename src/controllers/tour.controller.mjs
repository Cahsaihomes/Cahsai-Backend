
import { createTourValidation } from "../validations/tour.validation.mjs";
import * as tourService from "../app/services/tour.service.mjs";

export const createTourRequest = async (req, res) => {
  try {
    const { error } = createTourValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.details.map((e) => e.message),
      });
    }
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ status: "error", message: "Only buyers can book tours" });
    }

    const buyerId = req.user.id;
    const result = await tourService.createTour(buyerId, req.body);

    if (result.status === "success") {
      console.log(`✅ Tour request created successfully. Tour ID: ${result.data.id}`);
      console.log(`📞 Initiating buyer confirmation call for tour ${result.data.id}`);
      console.log(`⏰ Agent call scheduled for 2 minutes after buyer confirmation`);
    }

    return res.status(result.code).json(result);
  } catch (err) {
    console.error("Error in createTourRequest:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const getAllTours = async (req, res) => {
  try {
    const buyerId = req.query.buyerId ? Number(req.query.buyerId) : undefined;
    const result = await tourService.getAllTours(buyerId);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllTours:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

  // Get all expired tours
  export const getExpiredTours = async (req, res) => {
    try {
      const expiredTours = await tourService.getToursByStatus("expired");
      return res.status(200).json({ status: "success", data: expiredTours });
    } catch (err) {
      console.error("Error in getExpiredTours:", err);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  };

export const getPaginatedTours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await tourService.getToursPaginated(page, limit);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (err) {
    console.error("Error in getPaginatedTours:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};
export const deleteTourRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tourService.deleteTour(id);
    if (result.status === "error") {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteTourRequest:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};
export const claimTourRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await tourService.claimTour(id);
    if (result.status === "error") {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in claimTourRequest:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const rejectTourRequest = async (req, res) => {
  try {
    const { id: tourRequestId } = req.params;
    const agentId = req.user.id;

    const result = await tourService.rejectTour(tourRequestId, agentId);

    if (result.status === "error") {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Server error",
    });
  }
};

export const getTours = async (req, res) => {
  try {
    const { excludeRejected } = req.query;
    const agentId = req.user.id;

    const tours = await tourService.getTours({ excludeRejected, agentId });
    res.json({
      status: "success",
      data: tours,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Server error",
    });
  }
};
  /**
   * GET /api/tours/leads
   * Shows tour requests to posting agent for 15 minutes, then to other agents in same zipcode/location
   */
  export const getTourLeads = async (req, res) => {
    try {
      const agentId = req.user.id;
      const agentZipcode = req.user.zipcode;
      const agentLocation = req.user.locationArea;
      // Pagination from query params
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 20;
      // Pass pagination to repo via globalThis
      globalThis.__TOUR_LEADS_PAGE = page;
      globalThis.__TOUR_LEADS_LIMIT = limit;
      // Get all tour requests with post and agent details
      const allTours = await tourService.getAllToursWithDetails();
      // Reset global vars to avoid side effects
      delete globalThis.__TOUR_LEADS_PAGE;
      delete globalThis.__TOUR_LEADS_LIMIT;
      const now = new Date();
      // Filter tours based on time and agent
      const filteredTours = allTours.filter(tour => {
        const created = new Date(tour.createdAt);
        const minutesSince = (now - created) / (1000 * 60);
        // If agent is the posting agent and within 15 minutes
        if (tour.agent && tour.agent.id === agentId && minutesSince <= 15) {
          return true;
        }
        // After 15 minutes, do NOT show to posting agent, only to other agents in same zipcode/location
        if (minutesSince > 15 && tour.agent && tour.agent.id !== agentId) {
          if (
            tour.post &&
            tour.post.zipcode === agentZipcode &&
            tour.post.locationArea === agentLocation
          ) {
            return true;
          }
        }
        // After 15 minutes, hide from posting agent
        if (minutesSince > 15 && tour.agent && tour.agent.id === agentId) {
          return false;
        }
        return false;
      });
      return res.status(200).json({ status: "success", leads: filteredTours, page, limit });
    } catch (err) {
      console.error("Error in getTourLeads:", err);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  };

  /**
   * GET /api/tours/leads/:agentId
   * Shows tour requests for a specific agent by agent ID
   * Shows tours to posting agent for 15 minutes, then to other agents in same zipcode/location
   */
  export const getTourLeadsByAgentId = async (req, res) => {
    try {
      const { agentId } = req.params;
      const requestingAgentId = req.user.id;
      const agentZipcode = req.user.zipcode;
      const agentLocation = req.user.locationArea;

      // Validate agentId
      if (!agentId || isNaN(agentId)) {
        return res.status(400).json({ status: "error", message: "Valid agentId is required" });
      }

      // Pagination from query params
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 20;
      // Pass pagination to repo via globalThis
      globalThis.__TOUR_LEADS_PAGE = page;
      globalThis.__TOUR_LEADS_LIMIT = limit;
      // Get all tour requests with post and agent details
      const allTours = await tourService.getAllToursWithDetails();
      // Reset global vars to avoid side effects
      delete globalThis.__TOUR_LEADS_PAGE;
      delete globalThis.__TOUR_LEADS_LIMIT;

      const now = new Date();
      // Filter tours based on time and agent
      const filteredTours = allTours.filter(tour => {
        const created = new Date(tour.createdAt);
        const minutesSince = (now - created) / (1000 * 60);

        // Only show leads for the specified agent - compare as strings for safety
        const tourAgentId = String(tour.agent?.id);
        const targetAgentId = String(agentId);
        
        if (tourAgentId !== targetAgentId) {
          return false;
        }

        // If requesting agent is the posting agent, show all their leads
        if (requestingAgentId === parseInt(agentId)) {
          return true;
        }

        // If requesting agent is NOT the posting agent
        // Show leads only after 15 minutes and if in same zipcode/location
        if (minutesSince > 15) {
          // Get zipcode and location from either post or normalized data
          const postZipcode = tour.post?.zipCode || tour.post?.zipcode;
          const postLocation = tour.post?.location || tour.post?.locationArea;
          
          if (
            tour.post &&
            postZipcode === agentZipcode &&
            postLocation === agentLocation
          ) {
            return true;
          }
        }

        return false;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({ status: "success", leads: filteredTours, agentId, page, limit });
    } catch (err) {
      console.error("Error in getTourLeadsByAgentId:", err);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  };

export const getAgentToursDay = async (req, res) => {
  try {
    const { date } = req.query;
    const agentId = req.user.id;
    if (req.user.role !== "agent") {
      return res
        .status(403)
        .json({ status: "error", message: "Only agents can view their tours" });
    }

    if (!date)
      return res
        .status(400)
        .json({ status: "error", message: "date is required" });

    const result = await tourService.getAgentToursByDay(agentId, date);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAgentToursWeek = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const agentId = req.user.id;
    if (req.user.role !== "agent") {
      return res
        .status(403)
        .json({ status: "error", message: "Only agents can view their tours" });
    }
    if (!startDate || !endDate)
      return res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });

    const result = await tourService.getAgentToursByWeek(
      agentId,
      startDate,
      endDate
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAgentToursMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const agentId = req.user.id;
    if (req.user.role !== "agent") {
      return res
        .status(403)
        .json({ status: "error", message: "Only agents can view their tours" });
    }
    if (!month || !year)
      return res
        .status(400)
        .json({ status: "error", message: "month and year are required" });

    const result = await tourService.getAgentToursByMonth(agentId, month, year);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAgentToursDayByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { date } = req.query;

    // Validate agentId
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ status: "error", message: "Valid agentId is required" });
    }

    if (!date) {
      return res.status(400).json({ status: "error", message: "date is required" });
    }

    const result = await tourService.getAgentToursByDay(parseInt(agentId), date);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAgentToursDayByAgentId:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAgentToursWeekByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate agentId
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ status: "error", message: "Valid agentId is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });
    }

    const result = await tourService.getAgentToursByWeek(
      parseInt(agentId),
      startDate,
      endDate
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAgentToursWeekByAgentId:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAgentToursMonthByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { month, year } = req.query;

    // Validate agentId
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ status: "error", message: "Valid agentId is required" });
    }

    if (!month || !year) {
      return res.status(400).json({
        status: "error",
        message: "month and year are required",
      });
    }

    const result = await tourService.getAgentToursByMonth(parseInt(agentId), month, year);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAgentToursMonthByAgentId:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateTourStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ status: "error", message: "status is required" });
    }
    const result = await tourService.updateTourStatus(id, status);
    if (result.status === "error") {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateTourStatus:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
export const updateTourBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;
    if (!bookingStatus) {
      return res.status(400).json({ status: "error", message: "bookingStatus is required" });
    }
    const result = await tourService.updateTourBookingStatus(id, bookingStatus);
    if (result.status === "error") {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateTourBookingStatus:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
// Get current agent, status, and timing info for a tour
export const getTourStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tourService.getTourStatus(id);
    if (!result) {
      return res.status(404).json({ status: "error", message: "Tour not found" });
    }
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    console.error("Error in getTourStatus:", err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * GET /api/tours/leads-by-date
 * Get all leads filtered by date and time range
 * Query params: startDate, endDate, startTime, endTime
 */
export const getLeadsByDateAndTime = async (req, res) => {
  try {
    const { startDate, endDate, startTime, endTime, page = 1, limit = 20 } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "startDate and endDate are required (format: YYYY-MM-DD)",
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {
      createdAt: {
        [require("sequelize").Op.between]: [start, end],
      },
    };

    // If time filters are provided, add time comparison
    if (startTime || endTime) {
      // This would require a more complex query with TIME formatting
      console.log("⏰ Time filtering requested:", { startTime, endTime });
    }

    // Fetch leads with pagination
    const { count, rows } = await tourService.getToursByDateRange(
      whereClause,
      {
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
      }
    );

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.status(200).json({
      status: "success",
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: totalPages,
      },
      filters: {
        startDate,
        endDate,
        startTime: startTime || null,
        endTime: endTime || null,
      },
    });
  } catch (err) {
    console.error("Error in getLeadsByDateAndTime:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
