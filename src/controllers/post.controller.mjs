import postRepo from "../app/repositories/post.repo.mjs";


import * as postService from "../app/services/post.service.mjs";
import { Post } from "../models/postModel/index.mjs";
import { uploadToCloudinary } from "../utils/helper.mjs";

export const createPost = async (req, res) => {
  console.log("Request body (raw):", req.body);

  try {
    /* =====================================================
       2️⃣ Normalize numeric & boolean fields
    ===================================================== */
    const normalizeNumber = (v) =>
      v === "" || v === null || v === undefined ? null : Number(v);

    const normalizeBoolean = (v) =>
      typeof v === "string" ? v === "true" : Boolean(v);

    req.body.price = normalizeNumber(req.body.price);
    req.body.bedrooms = normalizeNumber(req.body.bedrooms);
    req.body.bathrooms = normalizeNumber(req.body.bathrooms);
    req.body.monthly_rent = normalizeNumber(req.body.monthly_rent);
    req.body.security_deposit = normalizeNumber(req.body.security_deposit);
    req.body.manager_id = normalizeNumber(req.body.manager_id);

    req.body.furnished = normalizeBoolean(req.body.furnished);
    req.body.is_verified_manager = normalizeBoolean(
      req.body.is_verified_manager
    );
    req.body.publishToWatchHomes = normalizeBoolean(req.body.publishToWatchHomes);
    req.body.yearBuilt = normalizeNumber(req.body.yearBuilt);
    req.body.hoaFees = normalizeNumber(req.body.hoaFees);
    req.body.linkedPostId = normalizeNumber(req.body.linkedPostId);

    /* =====================================================
       3️⃣ Handle files (multer)
    ===================================================== */
    const imageFiles = req.files?.post_images || [];
    const videoFiles = req.files?.post_videos || [];

    if (imageFiles.length > 5) {
      return res.status(400).json({
        status: "error",
        message: "You can upload a maximum of 5 images.",
      });
    }

    if (videoFiles.length > 1) {
      return res.status(400).json({
        status: "error",
        message: "You can upload only 1 video.",
      });
    }

    let imageUrls = [];
    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file, "post_images");
      imageUrls.push(url);
    }

    let videoUrl = null;
    if (videoFiles.length > 0) {
      videoUrl = await uploadToCloudinary(
        videoFiles[0],
        "post_videos"
      );
    }

    /* =====================================================
       4️⃣ Parse array-like fields
    ===================================================== */
    const parseArrayField = (value) => {
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch {
        return value.split(",").map((v) => v.trim());
      }
    };

    const tagsArray = parseArrayField(req.body.tags);
    const amenitiesArray = parseArrayField(req.body.amenities);
    const homeStyleArray = parseArrayField(req.body.homeStyle);
    const featuresArray = parseArrayField(req.body.features);

    /* =====================================================
       5️⃣ Create Post
    ===================================================== */
    const result = await postService.createPost(
      {
        ...req.body,
        tags: tagsArray,
        amenities: amenitiesArray,
        homeStyle: homeStyleArray,
        features: featuresArray,
        images: imageUrls.length ? imageUrls : null,
        video: videoUrl,
        forYou: true,
        isPromoted: false,
        street: req.body.street || null,
        unit: req.body.unit || null,
        state: req.body.state || null,
        propertyType: req.body.propertyType || null,
        lotSize: req.body.lotSize || null,
        yearBuilt: req.body.yearBuilt || null,
        hoaFees: req.body.hoaFees || null,
        agentName: req.body.agentName || null,
        brokerageName: req.body.brokerageName || null,
        stateDisclosures: req.body.stateDisclosures || null,
        publishToWatchHomes: req.body.publishToWatchHomes || false,
        postType: req.body.postType || null,
        linkedPostId: req.body.linkedPostId || null,
      },
      req.user.id
    );

    if (result?.data && typeof result.data === "object") {
      result.data.isPromoted = false;
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("🔥 Error in createPost:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


export const getUserPosts = async (req, res) => {
  try {
    const result = await postService.getUserPosts(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await postService.getUserPosts(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const getPaginatedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await postService.getPaginatedPosts(page, pageSize);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPaginatedPosts:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const result = await postService.getAllPosts();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // const updateData = { ...req.body };
    // if (updateData.homeStyle) {
    //   try {
    //     updateData.homeStyle = JSON.parse(updateData.homeStyle);
    //   } catch (e) {
    //     updateData.homeStyle = updateData.homeStyle
    //       .split(",")
    //       .map((h) => h.trim());
    //   }
    // }

    // if (req.files?.video?.length > 0) {
    //   updateData.video = req.files.video[0].filename;
    //   updateData.images = null;
    // }

    // if (req.files?.images?.length > 0) {
    //   updateData.images = req.files.images.map((file) => file.filename);
    //   updateData.video = null;
    // }

    // const { error } = updatePostValidation.validate(updateData, {
    //   abortEarly: false,
    // });
    // if (error) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Validation failed",
    //     errors: error.details.map((err) => err.message),
    //   });
    // }
    let updateData = {};

    if (req.body.title) updateData.title = req.body.title;
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.zipCode) updateData.zipCode = req.body.zipCode;
    if (req.body.city) updateData.city = req.body.city;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.bedrooms) updateData.bedrooms = req.body.bedrooms;
    if (req.body.bathrooms) updateData.bathrooms = req.body.bathrooms;
    if (req.body.forYou !== undefined) updateData.forYou = req.body.forYou;

    if (req.body.homeStyle) {
      try {
        updateData.homeStyle = JSON.parse(req.body.homeStyle);
      } catch {
        updateData.homeStyle = req.body.homeStyle
          .split(",")
          .map((h) => h.trim());
      }
    }

    if (req.body.tags) {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch {
        updateData.tags = req.body.tags.split(",").map((t) => t.trim());
      }
    }

    if (req.body.amenities) {
      try {
        updateData.amenities = JSON.parse(req.body.amenities);
      } catch {
        updateData.amenities = req.body.amenities
          .split(",")
          .map((a) => a.trim());
      }
    }

    // New property fields
    if (req.body.street) updateData.street = req.body.street;
    if (req.body.unit) updateData.unit = req.body.unit;
    if (req.body.state) updateData.state = req.body.state;
    if (req.body.propertyType) updateData.propertyType = req.body.propertyType;
    if (req.body.lotSize) updateData.lotSize = req.body.lotSize;
    if (req.body.yearBuilt) updateData.yearBuilt = req.body.yearBuilt;
    if (req.body.hoaFees) updateData.hoaFees = req.body.hoaFees;
    if (req.body.agentName) updateData.agentName = req.body.agentName;
    if (req.body.brokerageName) updateData.brokerageName = req.body.brokerageName;
    if (req.body.stateDisclosures) updateData.stateDisclosures = req.body.stateDisclosures;
    if (req.body.publishToWatchHomes !== undefined) updateData.publishToWatchHomes = req.body.publishToWatchHomes;
    if (req.body.postType) updateData.postType = req.body.postType;
    if (req.body.linkedPostId) updateData.linkedPostId = req.body.linkedPostId;
    if (req.body.features) {
      try {
        updateData.features = JSON.parse(req.body.features);
      } catch {
        updateData.features = req.body.features.split(",").map((f) => f.trim());
      }
    }

    // if (req.files?.post_videos?.length > 0) {
    //   updateData.video = req.files.post_videos.map((f) => f.filename);
    //   updateData.images = null;
    // }

    // if (req.files?.post_images?.length > 0) {
    //   updateData.images = req.files.post_images.map((f) => f.filename);
    //   updateData.video = null;
    // }

    const imageFiles = req.files?.post_images || [];
    const videoFiles = req.files?.post_videos || [];

    if (imageFiles.length > 0 && videoFiles.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "You can only upload either images or a video, not both.",
      });
    }

    if (imageFiles.length > 0) {
      let imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file, "post_images");
        imageUrls.push(url);
      }

      const existingPost = await Post.findByPk(id);

      let oldImages = [];
      if (existingPost && existingPost.images) {
        try {
          if (typeof existingPost.images === "string") {
            oldImages = JSON.parse(existingPost.images);
          } else {
            oldImages = existingPost.images;
          }
        } catch (err) {
          oldImages = [];
        }
      }

      // Support replace at index if replaceIndex is provided
      const replaceIndex = req.body.replaceIndex !== undefined ? Number(req.body.replaceIndex) : undefined;
      if (
        typeof replaceIndex === "number" &&
        !isNaN(replaceIndex) &&
        replaceIndex >= 0 &&
        replaceIndex < oldImages.length &&
        imageUrls.length === 1
      ) {
        // Replace the image at the given index
        oldImages[replaceIndex] = imageUrls[0];
        updateData.images = oldImages;
      } else {
        // Default: append new images
        updateData.images = [...oldImages, ...imageUrls];
      }
      // updateData.video = null;
    }

    if (videoFiles.length > 0) {
      const videoUrl = await uploadToCloudinary(videoFiles[0], "post_videos");

      // Support replace at index for video if replaceVideo is provided
      const existingPost = await Post.findByPk(id);
      let oldVideos = [];
      if (existingPost && existingPost.video) {
        try {
          if (typeof existingPost.video === "string") {
            // If it's a JSON array string, parse it, else treat as single video
            try {
              const parsed = JSON.parse(existingPost.video);
              if (Array.isArray(parsed)) {
                oldVideos = parsed;
              } else {
                oldVideos = [existingPost.video];
              }
            } catch {
              oldVideos = [existingPost.video];
            }
          } else if (Array.isArray(existingPost.video)) {
            oldVideos = existingPost.video;
          } else {
            oldVideos = [existingPost.video];
          }
        } catch {
          oldVideos = [];
        }
      }

      const replaceVideo = req.body.replaceVideo !== undefined ? Number(req.body.replaceVideo) : undefined;
      if (
        typeof replaceVideo === "number" &&
        !isNaN(replaceVideo) &&
        replaceVideo >= 0 &&
        replaceVideo < oldVideos.length
      ) {
        // Replace the video at the given index
        oldVideos[replaceVideo] = videoUrl;
        updateData.video = oldVideos.length === 1 ? oldVideos[0] : oldVideos;
      } else {
        // Default: replace or append (if multiple videos supported)
        if (oldVideos.length > 0) {
          updateData.video = [...oldVideos, videoUrl];
        } else {
          updateData.video = videoUrl;
        }
      }
      // updateData.images = null;
    }

    const result = await postService.updatePost(id, userId, updateData);

    if (result.status === "error") {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in updatePost:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await postService.deletePost(id, req.user.id);

    if (result.status === "error") {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in deletePost:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};
export const getPostPerformance = async (req, res) => {
  const agentId = req.user.id;
  const data = await postService.getPostPerformance(agentId);
  res.json({ status: "success", data });
};

export const getPostConversion = async (req, res) => {
  const agentId = req.user.id;
  const data = await postService.getPostConversion(agentId);
  res.json({ status: "success", data });
};
// Set isPromoted true for a post
export const promotePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ status: "error", message: "Post not found" });
    }
    post.isPromoted = true;
    await post.save();
    return res.status(200).json({ status: "success", message: "Post promoted successfully", data: post });
  } catch (error) {
    console.error("Error in promotePost:", error);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }

};
// Increment totalViews for a post
export const incrementTotalViews = async (req, res) => {
  try {
    const { id } = req.params;
    const totalViews = await postRepo.incrementTotalViews(id);
    return res.status(200).json({ status: "success", postId: id, totalViews });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// Get totalViews for a post
export const getTotalViews = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postRepo.getPostById(id);
    const totalViews = post ? post.totalViews : 0;
    return res.status(200).json({ status: "success", postId: id, totalViews });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};