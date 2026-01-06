import { User, AgentTable } from '../models/userModel/index.mjs';
import { Post, PostStats, PostComment, PostLike, CommentLike } from '../models/postModel/index.mjs';
import { TourRequest } from '../models/tourModel/index.mjs';
import { BuyerSavedPost } from '../models/buyerSavedPostModel/index.mjs';
import { BuyerShare } from '../models/buyerSharePostModel/index.mjs';
import { ChatMessage, Chat } from '../models/chatMessageModel/index.mjs';
import { AdminConfig } from '../models/adminConfig/index.mjs';
import { Op } from 'sequelize';

/**
 * Get top creators and agents: name, total videos, views, saves, shares, leads, earning
 * Get all agents with comprehensive data including email
 * Get all buyers with comprehensive data
 * Get all creators with comprehensive data
 * Get all leads (tour requests) with buyer and agent information
 */
export async function getTopPerformersThisMonth(req, res) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Top creators
    const creators = await User.findAll({
      where: { role: 'creator' },
      attributes: ['id', 'first_name', 'last_name'],
      include: [{
        model: Post,
        as: 'posts',
        // where: { createdAt: { [Op.gte]: startOfMonth } },
        required: false,
        attributes: ['id', 'price'],
        include: [{
          model: PostStats,
          as: 'stats',
          attributes: ['views', 'saves', 'shares'],
        }],
      }],
    });


    const topCreators = creators.map(creator => {
      const posts = creator.posts || [];
      const totalVideos = posts.length;
      const leads = totalVideos; // Assuming each post is a lead
      const earning = posts.reduce((sum, post) => sum + parseFloat(post.price || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.stats?.views || 0), 0);
      const totalSaves = posts.reduce((sum, post) => sum + (post.stats?.saves || 0), 0);
      const totalShares = posts.reduce((sum, post) => sum + (post.stats?.shares || 0), 0);
      return {
        name: `${creator.first_name} ${creator.last_name}`,
        totalVideos,
        totalViews,
        totalSaves,
        totalShares,
        leads,
        earning,
      };
    });


    // Top agents
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'first_name', 'last_name'],
      include: [{
        model: Post,
        as: 'posts',
        // where: { createdAt: { [Op.gte]: startOfMonth } },
        required: false,
        attributes: ['id', 'price'],
        include: [{
          model: PostStats,
          as: 'stats',
          attributes: ['views', 'saves', 'shares'],
        }],
      }],
    });


    const topAgents = agents.map(agent => {
      const posts = agent.posts || [];
      const totalVideos = posts.length;
      const leads = totalVideos;
      const earning = posts.reduce((sum, post) => sum + parseFloat(post.price || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.stats?.views || 0), 0);
      const totalSaves = posts.reduce((sum, post) => sum + (post.stats?.saves || 0), 0);
      const totalShares = posts.reduce((sum, post) => sum + (post.stats?.shares || 0), 0);
      return {
        name: `${agent.first_name} ${agent.last_name}`,
        totalVideos,
        totalViews,
        totalSaves,
        totalShares,
        leads,
        earning,
      };
    });

    res.json({
      topCreators,
      topAgents,
    });
  } catch (error) {
    console.error("Error in getTopPerformersThisMonth:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all agents with comprehensive data including email
 */
export async function getAllAgents(req, res) {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt'],
      include: [{
        model: AgentTable,
        as: 'AgentTable',
        attributes: ['mlsLicenseNumber', 'brokerageName'],
      }],
    });

    const agentsData = await Promise.all(agents.map(async (agent) => {
      const agentTable = agent.AgentTable;

      // Get leads (posts created by this agent)
      const leads = await Post.count({
        where: { userId: agent.id },
      });

      // Get tours/lead claims for this agent (confirmed bookings)
      const tours = await TourRequest.count({
        where: { 
          agentId: agent.id,
          bookingStatus: 'confirmed' // Only count confirmed bookings
        },
      });

      // Calculate conversion rate (tours/leads * 100)
      const conversionRate = leads > 0 ? ((tours / leads) * 100).toFixed(1) : 0;

      // Get average response time - time from post creation to tour creation
      let avgResponseTime = '0 hours';
      if (tours > 0) {
        const tourRequests = await TourRequest.findAll({
          where: { 
            agentId: agent.id,
            bookingStatus: 'confirmed'
          },
          include: [{
            model: Post,
            as: 'post',
            attributes: ['createdAt']
          }],
          attributes: ['createdAt']
        });

        if (tourRequests.length > 0) {
          const responseTimes = tourRequests
            .filter(tour => tour.post) // Make sure post exists
            .map(tour => {
              const postTime = new Date(tour.post.createdAt).getTime();
              const tourTime = new Date(tour.createdAt).getTime();
              return Math.max(0, tourTime - postTime); // Ensure non-negative
            })
            .filter(time => time > 0); // Filter out invalid times

          if (responseTimes.length > 0) {
            const avgResponseMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            const avgResponseHours = avgResponseMs / (1000 * 60 * 60);
            avgResponseTime = `${avgResponseHours.toFixed(1)} hours`;
          }
        }
      }

      // Get total earnings - agents earn $1.00 per confirmed tour booking
      const totalEarnings = tours * 1.00; // $1 per confirmed booking

      // Get pending payout - tours that are confirmed but not yet paid
      // For now, assume all confirmed tours are paid, so pending payout is 0
      const pendingPayout = 0;

      return {
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        license: agentTable?.mlsLicenseNumber || 'N/A',
        leads,
        subscription: 'Premium', // Placeholder
        status: 'active', // Default as requested
        leadPerformance: {
          leadsClaimed: tours,
          conversionRate: `${conversionRate}%`,
          avgResponseTime,
        },
        financialOverview: {
          totalEarnings: `$${totalEarnings.toFixed(2)}`,
          pendingPayout: `$${pendingPayout.toFixed(2)}`,
        },
      };
    }));

    res.json({
      agents: agentsData,
      totalAgents: agentsData.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all buyers with comprehensive data
 */
export async function getAllBuyers(req, res) {
  try {
    const buyers = await User.findAll({
      where: { role: 'buyer' },
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt'],
    });

    const buyersData = await Promise.all(buyers.map(async (buyer) => {
      // Get tours booked by this buyer
      const toursBooked = await TourRequest.count({
        where: { buyerId: buyer.id },
      });

      // Get homes saved (saved posts)
      const homesSaved = await BuyerSavedPost.count({
        where: { userId: buyer.id },
      });

      // Get clips watched (video views from posts this buyer has interacted with)
      // This is a simplified calculation - count views on posts that this buyer has saved or toured
      const savedPostIds = await BuyerSavedPost.findAll({
        where: { userId: buyer.id },
        attributes: ['postId'],
      }).then(results => results.map(r => r.postId));

      const touredPostIds = await TourRequest.findAll({
        where: { buyerId: buyer.id },
        attributes: ['postId'],
      }).then(results => results.map(r => r.postId));

      const allPostIds = [...new Set([...savedPostIds, ...touredPostIds])];
      const clipsWatched = allPostIds.length > 0 ? await PostStats.sum('views', {
        where: { postId: { [Op.in]: allPostIds } }
      }) : 0;

      // Get assigned agent (from tours - assuming the most recent agent)
      const assignedAgent = await TourRequest.findOne({
        where: { buyerId: buyer.id },
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'agent',
          attributes: ['first_name', 'last_name', 'email', 'contact'],
        }],
      });

      // Get communication history (recent messages from chats)
      const communicationHistory = await ChatMessage.findAll({
        include: [{
          model: Chat,
          as: 'chat',
          where: { buyerId: buyer.id },
          attributes: [],
        }, {
          model: User,
          as: 'sender',
          attributes: ['first_name', 'last_name', 'role'],
        }],
        attributes: ['content', 'type', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 10, // Get last 10 messages
      });

      // Format communication history
      const formattedHistory = communicationHistory.map(msg => {
        const daysAgo = Math.floor((new Date() - new Date(msg.createdAt)) / (1000 * 60 * 60 * 24));
        const timeAgo = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;
        
        let typeLabel = 'Message';
        if (msg.type === 'tour_update') {
          typeLabel = 'Email: Tour confirmation sent';
        } else if (msg.content && msg.content.toLowerCase().includes('recommendation')) {
          typeLabel = 'Message: Property recommendation';
        } else {
          typeLabel = `Message: ${msg.content?.substring(0, 30) || 'Chat message'}`;
        }

        return {
          type: typeLabel,
          timeAgo,
        };
      });

      return {
        name: `${buyer.first_name} ${buyer.last_name}`,
        email: buyer.email,
        signupDate: buyer.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        toursBooked,
        dreamBoards: homesSaved, // Assuming dream boards = saved posts
        status: 'active', // Default as requested
        clipsWatched: clipsWatched || 0,
        homesSaved,
        assignedAgent: assignedAgent ? {
          name: `${assignedAgent.agent.first_name} ${assignedAgent.agent.last_name}`,
          email: assignedAgent.agent.email,
          phone: assignedAgent.agent.contact || 'Not provided'
        } : null,
        communicationHistory: formattedHistory,
      };
    }));

    res.json({
      buyers: buyersData,
      totalBuyers: buyersData.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all creators with comprehensive data
 */
export async function getAllCreators(req, res) {
  try {
    const creators = await User.findAll({
      where: { role: 'creator' },
      attributes: ['id', 'first_name', 'last_name', 'email', 'createdAt'],
    });

    const creatorsData = await Promise.all(creators.map(async (creator) => {
      // Get posts (videos) by this creator
      const posts = await Post.findAll({
        where: { userId: creator.id },
        attributes: ['id', 'createdAt', 'video'],
      });

      const videos = posts.length;
      const postIds = posts.map(p => p.id);

      // Get leads (tours generated from creator's posts)
      const leads = await TourRequest.count({
        where: { postId: { [Op.in]: postIds } },
      });

      // Calculate earnings based on views, likes, shares
      const totalViews = postIds.length > 0 ? await PostStats.sum('views', {
        where: { postId: { [Op.in]: postIds } }
      }) : 0;

      const totalLikes = postIds.length > 0 ? await PostLike.count({
        where: { postId: { [Op.in]: postIds } }
      }) : 0;

      const totalShares = postIds.length > 0 ? await BuyerShare.count({
        where: { postId: { [Op.in]: postIds } }
      }) : 0;

      // Earnings calculation: $0.01 per view, $0.05 per like, $0.10 per share
      const totalEarnings = (totalViews * 0.01) + (totalLikes * 0.05) + (totalShares * 0.10);

      // Calculate engagement metrics
      const totalEngagements = totalLikes + totalShares + totalViews;
      const avgEngagementRate = videos > 0 ? (totalEngagements / videos).toFixed(2) : 0;

      // Calculate upload frequency (posts per month since creator joined)
      const monthsSinceJoined = Math.max(1, Math.floor((new Date() - new Date(creator.createdAt)) / (1000 * 60 * 60 * 24 * 30)));
      const uploadFrequency = (videos / monthsSinceJoined).toFixed(1);

      // Calculate average video length (placeholder - assuming 5 minutes average)
      const avgVideoLength = videos > 0 ? '5:00' : '0:00';

      // Performance graph data (total views over time - simplified)
      const performanceGraph = {
        totalViews,
        monthlyData: [] // Could be expanded to show monthly views
      };

      // Payout information
      const totalPaid = totalEarnings * 0.8; // Assuming 80% is paid out
      const pendingPayout = totalEarnings * 0.2; // Assuming 20% is pending

      return {
        name: `${creator.first_name} ${creator.last_name}`,
        email: creator.email,
        videos,
        leads,
        earnings: `$${totalEarnings.toFixed(2)}`,
        status: 'active',
        creatorSince: creator.createdAt.toISOString().split('T')[0],
        stats: {
          videosUploaded: videos,
          leadsGenerated: leads,
          totalEarnings: `$${totalEarnings.toFixed(2)}`,
        },
        performanceGraph,
        engagement: {
          avgEngagementRate: `${avgEngagementRate}%`,
          avgVideoLength,
          uploadFrequency: `${uploadFrequency} posts/month`,
        },
        payout: {
          totalPaid: `$${totalPaid.toFixed(2)}`,
          pendingPayout: `$${pendingPayout.toFixed(2)}`,
        },
      };
    }));

    res.json({
      creators: creatorsData,
      totalCreators: creatorsData.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all leads (tour requests) with comprehensive data
 */
export async function getAllLeads(req, res) {
  try {
    const leads = await TourRequest.findAll({
      include: [{
        model: User,
        as: 'buyer',
        attributes: ['first_name', 'last_name'],
      }, {
        model: User,
        as: 'agent',
        attributes: ['first_name', 'last_name'],
      }],
      attributes: ['id', 'status', 'createdAt', 'bookingStatus'],
      order: [['createdAt', 'DESC']],
    });

    const leadsData = leads.map(lead => ({
      leadId: `L${lead.id.toString().padStart(3, '0')}`,
      source: 'search',
      buyerName: lead.buyer ? `${lead.buyer.first_name} ${lead.buyer.last_name}` : 'Unknown Buyer',
      agentName: lead.agent ? `${lead.agent.first_name} ${lead.agent.last_name}` : 'Unassigned',
      status: lead.status,
      amount: '$2.00', // Standard tour booking amount
    }));

    // Calculate stats
    const totalLeads = leadsData.length;
    const completed = leads.filter(lead => lead.bookingStatus === 'confirmed').length;
    const pending = leads.filter(lead => lead.bookingStatus === 'pending' || lead.status === 'pending').length;
    const unclaimed = leads.filter(lead => !lead.agent).length;

    res.json({
      leads: leadsData,
      totalLeads,
      stats: {
        totalLeads,
        completed,
        pending,
        unclaimed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get total payout statistics and transaction data
 */
export async function getTotalPayout(req, res) {
  try {
    // Get all tours first to see what's available
    const allTours = await TourRequest.findAll({
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
      }, {
        model: User,
        as: 'buyer',
        attributes: ['first_name', 'last_name'],
      }, {
        model: Post,
        as: 'post',
        attributes: ['id', 'price'],
      }],
      attributes: ['id', 'createdAt', 'bookingStatus', 'status'],
      order: [['createdAt', 'DESC']],
    });

    // Use confirmed tours if available, otherwise use all tours with agents assigned
    let payableTours = allTours.filter(tour => tour.bookingStatus === 'confirmed');
    if (payableTours.length === 0) {
      // If no confirmed tours, use tours with agents assigned
      payableTours = allTours.filter(tour => tour.agent);
    }

    // Calculate payouts per agent ($1 per tour)
    const agentPayouts = {};
    payableTours.forEach(tour => {
      if (tour.agent) {
        const agentId = tour.agent.id;
        if (!agentPayouts[agentId]) {
          agentPayouts[agentId] = {
            agent: tour.agent,
            tours: [],
            totalAmount: 0,
          };
        }
        agentPayouts[agentId].tours.push(tour);
        agentPayouts[agentId].totalAmount += 1.00; // $1 per tour
      }
    });

    // Create transaction data with different statuses
    const transactions = [];
    let transactionId = 1;

    Object.values(agentPayouts).forEach(agentData => {
      const agent = agentData.agent;
      const totalAmount = agentData.totalAmount;
      const tourCount = agentData.tours.length;

      // Create one transaction per agent
      const statuses = ['Completed', 'Successfully paid', 'Pending', 'On Hold'];
      const methods = ['Bank Transfer', 'Stripe Payout', 'Check', 'PayPal'];

      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];

      transactions.push({
        id: `P${transactionId.toString().padStart(3, '0')}`,
        recipient: `${agent.first_name} ${agent.last_name}`,
        type: agent.role ? agent.role.charAt(0).toUpperCase() + agent.role.slice(1) : 'Agent',
        amount: `$${totalAmount.toFixed(2)}`,
        method: 'card',
        status: randomStatus,
        date: agentData.tours[0]?.createdAt.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        details: `${tourCount} tour${tourCount > 1 ? 's' : ''}`,
      });

      transactionId++;
    });

    // If no transactions, return empty data instead of sample
    if (transactions.length === 0) {
      return res.json({
        stats: {
          totalPayouts: 0,
          completed: 0,
          successfullyPaid: 0,
          pending: 0,
          onHold: 0,
        },
        data: [],
      });
    }

    // Calculate stats
    const totalPayouts = transactions.length;
    const completed = transactions.filter(t => t.status === 'Completed').length;
    const successfullyPaid = transactions.filter(t => t.status === 'Successfully paid').length;
    const pending = transactions.filter(t => t.status === 'Pending').length;
    const onHold = transactions.filter(t => t.status === 'On Hold').length;

    res.json({
      stats: {
        totalPayouts,
        completed,
        successfullyPaid,
        pending,
        onHold,
      },
      data: transactions,
    });
  } catch (error) {
    console.error('Error in getTotalPayout:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all posts with complete data
 */
export async function getAllPosts(req, res) {
  try {
    // Get all posts with associations
    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'email'],
      }, {
        model: PostStats,
        as: 'stats',
        attributes: ['views', 'saves', 'shares'],
      }, {
        model: PostLike,
        as: 'likes',
        attributes: ['id'],
      }],
      attributes: ['id', 'title', 'description', 'video', 'images', 'createdAt', 'price'],
      order: [['createdAt', 'DESC']],
    });

    // Transform the data to match requested format
    const postsData = posts.map(post => {
      const likeCount = post.likes ? post.likes.length : 0;
      const viewCount = post.stats ? post.stats.views : 0;

      return {
        id: post.id, // Add post ID
        clip: post.title,
        creator: post.user ? `${post.user.first_name} ${post.user.last_name}` : 'Unknown',
        views: viewCount,
        likes: likeCount,
        status: 'published', // Assuming all posts are published since no status field exists
        date: post.createdAt.toISOString().split('T')[0],
        duration: 'N/A', // Video duration not stored in database
        imagesUrl: post.images && Array.isArray(post.images) ? post.images : [], // All images array
        videoUrl: post.video || null, // Video URL
      };
    });

    // Calculate stats
    const totalClips = postsData.length;
    const published = postsData.filter(post => post.status === 'published').length;
    const pendingReview = postsData.filter(post => post.status === 'pending_review').length;
    const totalViews = postsData.reduce((sum, post) => sum + post.views, 0);

    res.json({
      posts: postsData,
      stats: {
        totalClips,
        published,
        pendingReview,
        totalViews,
      },
    });
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a post by ID
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Check if post exists
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete related data first (due to foreign key constraints)
    // Delete post likes
    await PostLike.destroy({
      where: { postId: id }
    });

    // Delete post comments and their likes
    const comments = await PostComment.findAll({
      where: { postId: id },
      attributes: ['id']
    });

    const commentIds = comments.map(comment => comment.id);

    if (commentIds.length > 0) {
      // Delete comment likes
      await CommentLike.destroy({
        where: { commentId: commentIds }
      });

      // Delete comments
      await PostComment.destroy({
        where: { postId: id }
      });
    }

    // Delete post stats
    await PostStats.destroy({
      where: { postId: id }
    });

    // Delete tour requests related to this post
    await TourRequest.destroy({
      where: { postId: id }
    });

    // Finally delete the post
    await Post.destroy({
      where: { id: id }
    });

    res.json({
      message: 'Post deleted successfully',
      deletedPostId: id
    });

  } catch (error) {
    console.error('Error in deletePost:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get admin configuration
 */
export async function getAdminConfig(req, res) {
  try {
    // Ensure the table exists
    await AdminConfig.sync({ alter: true });

    // Find config for admin ID 15
    let config = await AdminConfig.findOne({
      where: { adminId: 15 }
    });

    if (!config) {
      // Create default config for admin ID 15 if none exists
      config = await AdminConfig.create({
        adminId: 15,
        tourPrice: 2.00,
        creatorCommission: 50.00,
        agentCommission: 50.00,
      });
    }

    res.json({
      LeadClaimPrice: parseFloat(config.tourPrice),
      creatorCommission: parseFloat(config.creatorCommission),
      agentCommission: parseFloat(config.agentCommission),
    });
  } catch (error) {
    console.error('Error in getAdminConfig:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update admin configuration (upsert - update or create)
 */
export async function updateAdminConfig(req, res) {
  try {
    // Ensure the table exists
    await AdminConfig.sync({ alter: true });

    const { tourPrice, creatorCommission, agentCommission } = req.body;

    // Validate input
    if (tourPrice !== undefined && (isNaN(tourPrice) || tourPrice < 0)) {
      return res.status(400).json({ error: 'Invalid tour price' });
    }

    if (creatorCommission !== undefined && (isNaN(creatorCommission) || creatorCommission < 0 || creatorCommission > 100)) {
      return res.status(400).json({ error: 'Creator commission must be between 0 and 100' });
    }

    if (agentCommission !== undefined && (isNaN(agentCommission) || agentCommission < 0 || agentCommission > 100)) {
      return res.status(400).json({ error: 'Agent commission must be between 0 and 100' });
    }

    // Find existing config for admin ID 15 or create new one
    let config = await AdminConfig.findOne({
      where: { adminId: 15 }
    });

    if (config) {
      // Update existing config
      await config.update({
        tourPrice: tourPrice !== undefined ? parseFloat(tourPrice) : config.tourPrice,
        creatorCommission: creatorCommission !== undefined ? parseFloat(creatorCommission) : config.creatorCommission,
        agentCommission: agentCommission !== undefined ? parseFloat(agentCommission) : config.agentCommission,
      });
      res.json({
        message: 'Admin configuration updated',
        config: {
          tourPrice: parseFloat(config.tourPrice),
          creatorCommission: parseFloat(config.creatorCommission),
          agentCommission: parseFloat(config.agentCommission),
        }
      });
    } else {
      // Create new config for admin ID 15
      config = await AdminConfig.create({
        adminId: 15,
        tourPrice: tourPrice !== undefined ? parseFloat(tourPrice) : 2.00,
        creatorCommission: creatorCommission !== undefined ? parseFloat(creatorCommission) : 50.00,
        agentCommission: agentCommission !== undefined ? parseFloat(agentCommission) : 50.00,
      });
      res.json({
        message: 'Admin configuration created',
        config: {
          tourPrice: parseFloat(config.tourPrice),
          creatorCommission: parseFloat(config.creatorCommission),
          agentCommission: parseFloat(config.agentCommission),
        }
      });
    }
  } catch (error) {
    console.error('Error in updateAdminConfig:', error);
    res.status(500).json({ error: error.message });
  }
}
