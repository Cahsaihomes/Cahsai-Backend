import { TourRejection, TourRequest, Post, User } from "../../models/tourModel/index.mjs";
import tourRepo from "../repositories/tour.repo.mjs";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const createTour = async (buyerId, tourData) => {
  const { date, time, postId, agentId } = tourData;

  // Validate referenced rows exist to avoid FK violations
  const [post, agent, buyer] = await Promise.all([
    Post.findByPk(postId),
    User.findByPk(agentId),
    User.findByPk(buyerId),
  ]);

  if (!post) {
    return { status: "error", code: 404, message: "Post not found" };
  }
  if (!agent || agent.role !== "agent") {
    return { status: "error", code: 400, message: "Invalid agent" };
  }
  if (!buyer || buyer.role !== "buyer") {
    return { status: "error", code: 400, message: "Invalid buyer" };
  }

  const payload = {
    ...tourData,
    buyerId,
    activeLead: false,
    bookingStatus: "pending",
    timerExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
  };

  const existingTour = await TourRequest.findOne({
    where: { buyerId, date, time, bookingStatus: "pending" },
  });

  if (existingTour) {
    return {
      status: "error",
      code: 409,
      message:
        "Booking already exists for this time. Please choose a different time",
    };
  }

  try {
    const newTour = await tourRepo.createTourRequest(payload);
    return {
      status: "success",
      code: 200,
      message: "Tour request created successfully",
      data: newTour,
    };
  } catch (err) {
    // Handle FK violations gracefully
    const fkErrorNames = [
      "SequelizeForeignKeyConstraintError",
      "SequelizeDatabaseError",
    ];
    if (
      fkErrorNames.includes(err?.name) ||
      err?.parent?.code === "ER_NO_REFERENCED_ROW_2"
    ) {
      return {
        status: "error",
        code: 400,
        message:
          "Invalid reference provided (postId/agentId/buyerId). Please verify IDs.",
      };
    }
    // Unknown error -> bubble up details to controller logging, but avoid 500 leak
    console.error("createTour unexpected error:", err);
    return {
      status: "error",
      code: 500,
      message: "Unable to create tour at this time",
    };
  }
};

export const getAllTours = async (buyerId) => {
  const tours = await tourRepo.getAllToursWithDetails(buyerId);
  return {
    status: "success",
    data: tours,
  };
};
  // Get tours by expiredStatus
  export const getToursByStatus = async (status) => {
    return await tourRepo.getToursByStatus(status);
  };

export const getToursPaginated = async (page, limit) => {
  return await tourRepo.getPaginatedTours(page, limit);
};
  // Get all tours with details for lead filtering
  export const getAllToursWithDetails = async () => {
    return await tourRepo.getAllToursWithDetails();
  };
export const deleteTour = async (tourId) => {
  const deletedCount = await tourRepo.deleteTourById(tourId);

  if (deletedCount === 0) {
    return {
      status: "error",
      message: "Tour not found or already deleted",
    };
  }

  return {
    status: "success",
    message: "Tour deleted successfully",
  };
};
export const claimTour = async (tourId) => {
  const [updatedCount] = await tourRepo.updateActiveLeadById(tourId);

  if (updatedCount === 0) {
    return {
      status: "error",
      message: "Tour not found or already claimed",
    };
  }

  return {
    status: "success",
    message: "Tour successfully claimed",
  };
};
export const rejectTour = async (tourRequestId, agentId, reason) => {
  const tourRequest = await TourRequest.findByPk(tourRequestId);

  if (!tourRequest) {
    return {
      status: "error",
      message: `Tour request with ID ${tourRequestId} not found`,
    };
  }
  await TourRejection.create({
    tourRequestId,
    agentId,
  });

  return {
    status: "success",
    message: "Tour request rejected successfully",
  };
};
export const getTours = async ({ excludeRejected, agentId }) => {
  if (excludeRejected && excludeRejected === "true") {
    return await tourRepo.getToursExcludingRejected(agentId);
  }
  return await tourRepo.getAllTours();
};

export const getAgentToursByDay = async (agentId, date) => {
  const startDate = new Date(date);
  const endDate = new Date(date);
  return {
    status: "success",
    data: await tourRepo.getAgentToursByDateRange(agentId, startDate, endDate),
  };
};

// Week service
export const getAgentToursByWeek = async (agentId, startDate, endDate) => {
  return {
    status: "success",
    data: await tourRepo.getAgentToursByDateRange(agentId, startDate, endDate),
  };
};

// Month service
export const getAgentToursByMonth = async (agentId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return {
    status: "success",
    data: await tourRepo.getAgentToursByDateRange(agentId, startDate, endDate),
  };
};
export const updateTourStatus = async (tourId, status) => {
  const [updatedCount] = await tourRepo.updateTourStatusById(tourId, status);
  if (updatedCount === 0) {
    return {
      status: "error",
      message: "Tour not found or status not updated",
    };
  }
  return {
    status: "success",
    message: `Tour status updated to ${status}`,
  };
};
export const updateTourBookingStatus = async (tourId, bookingStatus) => {
  const [updatedCount] = await tourRepo.updateTourBookingStatusById(tourId, bookingStatus);
  if (updatedCount === 0) {
    return {
      status: "error",
      message: "Tour not found or status not updated",
    };
  }
  return {
    status: "success",
    message: `Tour bookingStatus updated to ${bookingStatus}`,
  };
};
// Get current agent, status, and timing info for a tour
export const getTourStatus = async (tourId) => {
  const tour = await tourRepo.getTourStatusById(tourId);
  if (!tour) return null;
  // Calculate time left for agent response (if needed)
  let timeLeft = null;
  if (tour.createdAt && tour.status !== "confirmed") {
    const created = new Date(tour.createdAt);
    const now = new Date();
    const elapsed = (now - created) / 1000; // seconds
    const limit = 15 * 60; // 15 minutes in seconds
    timeLeft = Math.max(0, limit - elapsed);
  }
  return {
    tourId: tour.id,
    agent: tour.agent,
    status: tour.status,
    expiredStatus: tour.expiredStatus,
    createdAt: tour.createdAt,
    timeLeft,
  };
};