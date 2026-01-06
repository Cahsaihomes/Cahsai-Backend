import { User } from '../models/userModel/index.mjs';
import { Post } from '../models/postModel/index.mjs';

/**
 * Get admin dashboard stats: total buyer, agent, creator, earning, and monthly percentage changes
 */
export async function getAdminStats(req, res) {
  try {
    // Get total users by role
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalAgents = await User.count({ where: { role: 'agent' } });
    const totalCreators = await User.count({ where: { role: 'creator' } });

    // Get total earnings (sum of all post prices)
    const totalEarningResult = await Post.findAll({ attributes: ['price'] });
    const totalEarningValue = totalEarningResult.reduce((sum, post) => sum + parseFloat(post.price), 0);

    // Calculate monthly stats and percentage changes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Buyers
    const buyersThisMonth = await User.count({ where: { role: 'buyer', createdAt: { $gte: startOfMonth } } });
    const buyersLastMonth = await User.count({ where: { role: 'buyer', createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } } });
    const buyersPercentChange = buyersLastMonth === 0 ? 0 : ((buyersThisMonth - buyersLastMonth) / buyersLastMonth) * 100;

    // Agents
    const agentsThisMonth = await User.count({ where: { role: 'agent', createdAt: { $gte: startOfMonth } } });
    const agentsLastMonth = await User.count({ where: { role: 'agent', createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } } });
    const agentsPercentChange = agentsLastMonth === 0 ? 0 : ((agentsThisMonth - agentsLastMonth) / agentsLastMonth) * 100;

    // Creators
    const creatorsThisMonth = await User.count({ where: { role: 'creator', createdAt: { $gte: startOfMonth } } });
    const creatorsLastMonth = await User.count({ where: { role: 'creator', createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } } });
    const creatorsPercentChange = creatorsLastMonth === 0 ? 0 : ((creatorsThisMonth - creatorsLastMonth) / creatorsLastMonth) * 100;

    // Earnings monthly change
    const earningThisMonthResult = await Post.findAll({ attributes: ['price'], where: { createdAt: { $gte: startOfMonth } } });
    const earningLastMonthResult = await Post.findAll({ attributes: ['price'], where: { createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } } });
    const earningThisMonth = earningThisMonthResult.reduce((sum, post) => sum + parseFloat(post.price), 0);
    const earningLastMonth = earningLastMonthResult.reduce((sum, post) => sum + parseFloat(post.price), 0);
    const earningPercentChange = earningLastMonth === 0 ? 0 : ((earningThisMonth - earningLastMonth) / earningLastMonth) * 100;

    res.json({
      totalBuyers,
      totalAgents,
      totalCreators,
      totalEarning: totalEarningValue,
      monthlyChange: {
        buyers: `${buyersPercentChange >= 0 ? '+' : ''}${buyersPercentChange.toFixed(1)}% from last month`,
        agents: `${agentsPercentChange >= 0 ? '+' : ''}${agentsPercentChange.toFixed(1)}% from last month`,
        creators: `${creatorsPercentChange >= 0 ? '+' : ''}${creatorsPercentChange.toFixed(1)}% from last month`,
        earning: `${earningPercentChange >= 0 ? '+' : ''}${earningPercentChange.toFixed(1)}% from last month`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
