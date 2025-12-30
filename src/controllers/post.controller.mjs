import postRepo from "../app/repositories/post.repo.mjs";


import * as postService from "../app/services/post.service.mjs";
import { Post } from "../models/postModel/index.mjs";
import { uploadToCloudinary } from "../utils/helper.mjs";
import {
  createPostValidation,
  updatePostValidation,
} from "../validations/post.validation.mjs";

export const createPost = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { error } = createPostValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    const imageFiles = req.files?.post_images || [];
    const videoFiles = req.files?.post_videos || [];

    // if (imageFiles.length > 0 && videoFiles.length > 0) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "You can upload either one video OR up to 5 images, not both.",
    //   });
    // }
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
    if (imageFiles?.length > 0) {
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file, "post_images");
        imageUrls.push(url);
      }
    }

    let videoUrl = null;
    if (videoFiles?.length > 0) {
      videoUrl = await uploadToCloudinary(videoFiles[0], "post_videos");
    }
    // const tagsArray = req.body.tags
    //   ? req.body.tags.split(",").map((t) => t.trim())
    //   : [];
    // const amenitiesArray = req.body.amenities
    //   ? req.body.amenities.split(",").map((a) => a.trim())
    //   : [];

    let tagsArray = [];
    if (req.body.tags) {
      try {
        tagsArray = JSON.parse(req.body.tags);
      } catch (e) {
        tagsArray = req.body.tags.split(",").map((h) => h.trim());
      }
    }

    let amenitiesArray = [];
    if (req.body.amenities) {
      try {
        amenitiesArray = JSON.parse(req.body.amenities);
      } catch (e) {
        amenitiesArray = req.body.amenities.split(",").map((h) => h.trim());
      }
    }

    let homeStyleArray = [];
    if (req.body.homeStyle) {
      try {
        homeStyleArray = JSON.parse(req.body.homeStyle);
      } catch (e) {
        homeStyleArray = req.body.homeStyle.split(",").map((h) => h.trim());
      }
    }

    const result = await postService.createPost(
      {
        ...req.body,
        tags: tagsArray,
        amenities: amenitiesArray,
        homeStyle: homeStyleArray,
        images: imageUrls.length ? imageUrls : null,
        video: videoUrl,
        forYou: true,
        isPromoted: false,
      },
      req.user.id
    );

    // Ensure isPromoted is included in the response data
    if (result && result.data && typeof result.data === 'object') {
      result.data.isPromoted = false;
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error in createPost:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
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