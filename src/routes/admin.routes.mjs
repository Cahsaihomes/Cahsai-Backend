import express from "express";
import * as adminController from "../controllers/admin.controller.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import { isAdminOrSuperAdmin } from "../middlewares/roleMiddleware.mjs";

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(isAuthenticated);
router.use(isAdminOrSuperAdmin);

// Admin Management Endpoints
// GET /admin/admins - List all admins
router.get("/admins", adminController.listAdmins);

// POST /admin/create-admin - Create new admin
router.post("/create-admin", adminController.createAdmin);

// GET /admin/:id - Get specific admin
router.get("/:id", adminController.getAdminById);

// PUT /admin/:id - Update admin details
router.put("/:id", adminController.updateAdmin);

// DELETE /admin/:id - Delete admin (soft delete)
router.delete("/:id", adminController.deleteAdmin);

// Role Management Endpoints
// GET /admin/roles - Get all available roles
router.get("/roles/all", adminController.getAllRoles);

// POST /admin/:userId/assign-role - Assign role to admin
router.post("/:userId/assign-role", adminController.assignRole);

// PUT /admin/:id/status - Change admin status
router.put("/:id/status", adminController.changeAdminStatus);

export default router;
