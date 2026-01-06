import { User } from '../models/userModel/index.mjs';

/**
 * Get user distribution: total buyers, creators, agents
 */
export async function getUserDistribution(req, res) {
  try {
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalCreators = await User.count({ where: { role: 'creator' } });
    const totalAgents = await User.count({ where: { role: 'agent' } });

    res.json({
      totalBuyers,
      totalCreators,
      totalAgents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
