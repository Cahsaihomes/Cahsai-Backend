import { Router } from 'express';
import { getAdminStats } from '../controllers/adminDashboard.controller.mjs';
import { getAgentActivityWeekly } from '../controllers/agentActivity.controller.mjs';
import { getUserDistribution } from '../controllers/userDistribution.controller.mjs';
import { getTopPerformersThisMonth, getAllAgents, getAllBuyers, getAllCreators, getAllLeads, getTotalPayout, getAllPosts, deletePost, getAdminConfig, updateAdminConfig } from '../controllers/topPerformers.controller.mjs';

const router = Router();

// GET /admin-dashboard/stats
router.get('/stats', getAdminStats);
// GET /admin-dashboard/agent-activity-weekly
router.get('/agent-activity-weekly', getAgentActivityWeekly);
// GET /admin-dashboard/user-distribution
router.get('/user-distribution', getUserDistribution);
// GET /admin-dashboard/top-performers-this-month
router.get('/top-performers-this-month', getTopPerformersThisMonth);
// GET /admin-dashboard/agents
router.get('/agents', getAllAgents);
// GET /admin-dashboard/buyers
router.get('/buyers', getAllBuyers);
// GET /admin-dashboard/creators
router.get('/creators', getAllCreators);
// GET /admin-dashboard/leads
router.get('/leads', getAllLeads);
// GET /admin-dashboard/total-payout
router.get('/total-payout', getTotalPayout);
// GET /admin-dashboard/posts
router.get('/posts', getAllPosts);
// DELETE /admin-dashboard/posts/:id
router.delete('/posts/:id', deletePost);
// GET /admin-dashboard/config
router.get('/config', getAdminConfig);
// PUT /admin-dashboard/config
router.put('/config', updateAdminConfig);

export default router;
