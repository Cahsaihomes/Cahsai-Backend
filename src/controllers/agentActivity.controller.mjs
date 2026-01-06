import { Post } from '../models/postModel/index.mjs';
import { User } from '../models/userModel/index.mjs';

/**
 * Get agent activity stats for the week: leads, tours, conversions
 */
export async function getAgentActivityWeekly(req, res) {
  try {
    // Calculate start and end of current week (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    // Leads: count of posts created by agents this week
    const leads = await Post.count({
      where: {
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
      include: [{
        model: User,
        as: 'user',
        where: { role: 'agent' },
      }],
    });
    // Total leads
    const totalLeads = await Post.count({
      include: [{
        model: User,
        as: 'user',
        where: { role: 'agent' },
      }],
    });

    // Tours: count of tours created by agents this week
    // TODO: Replace with actual Tour model if available
    const tours = 0;
    const totalTours = 0;

    // Conversions: count of posts marked as converted by agents this week
    // TODO: Replace with actual conversion logic/field
    const conversions = 0;
    const totalConversions = 0;

    res.json({
      weekly: {
        leads,
        tours,
        conversions,
      },
      total: {
        leads: totalLeads,
        tours: totalTours,
        conversions: totalConversions,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
