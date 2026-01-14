import { User } from "../models/userModel/index.mjs";
import { Role, UserRole } from "../models/roleModel/index.mjs";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import sequelize from "../config/database.mjs";
import sendEmail from "../utils/sendEmail.mjs";
import { adminAccountCreatedTemplate, adminAccountDeletedTemplate } from "../utils/emailTemplates.mjs";

// List all admins
export const listAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        is_admin: true,
        isDeleted: false,
      },
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: admins,
      total: admins.length,
    });
  } catch (error) {
    console.error("Error listing admins:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password, shouldSendEmail } = req.body;
    console.log("Create Admin Request Body:", req.body);

    // Validation
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, lastName, email, role",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Check if role exists (case-insensitive)
    // Normalize role name from frontend (e.g., 'Finance Admin' -> 'finance', 'Content Moderator' -> 'content_moderator')
    const roleNameMapping = {
      'finance admin': 'finance',
      'creator admin': 'creator',
      'content moderator': 'content_moderator',
      'super admin': 'super_admin',
      'finance': 'finance',
      'creator': 'creator',
      'content_moderator': 'content_moderator',
      'super_admin': 'super_admin'
    };
    
    // Clean and normalize the role name
    const cleanedRole = role.toLowerCase().trim();
    const normalizedRoleName = roleNameMapping[cleanedRole] || cleanedRole;
    
    const roleRecord = await Role.findOne({ 
      where: {
        name: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          Op.like,
          `${normalizedRoleName}%`
        )
      }
    });
    if (!roleRecord) {
      console.log(`[DEBUG] Available roles in DB:`);
      const allRoles = await Role.findAll({ attributes: ['id', 'name'] });
      allRoles.forEach(r => console.log(`  - ${r.name}`));
      
      return res.status(400).json({
        success: false,
        message: `Role '${role}' not found. Available roles: super_admin, finance, creator, content_moderator`,
      });
    }

    // Map role to user table role value
    // Keys should match the normalized roleRecord.name (with underscores)
    const roleMapping = {
      'super_admin': 'admin',
      'finance_admin': 'finance_admin',
      'creator_admin': 'creator_admin',
      'content_moderator': 'moderator_admin'
    };
    
    // Normalize roleRecord.name to match roleMapping keys (e.g., 'Finance Admin' -> 'finance_admin')
    const normalizedRecordName = roleRecord.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');
    
    const userTableRole = roleMapping[normalizedRecordName] || 'admin';

    // Generate password if not provided
    let adminPassword = password;
    if (!adminPassword) {
      adminPassword = Math.random().toString(36).slice(-12);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const newAdmin = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      contact: email, // Use email as unique contact value
      role: userTableRole, // Store mapped role value
      is_admin: true,
      admin_status: "active",
      emailVerified: true,
      acceptedTerms: true,
    });
console.log("New Admin Created:", newAdmin.toJSON());
    // Assign role to admin
    await UserRole.create({
      userId: newAdmin.id,
      roleId: roleRecord.id,
    });

    // Fetch created admin with roles
    const createdAdmin = await User.findByPk(newAdmin.id, {
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
    });

    // Send email with credentials if requested
    if (shouldSendEmail !== false) {
      const emailContent = adminAccountCreatedTemplate(firstName, lastName, email, adminPassword, role);
      
      try {
        await sendEmail(email, emailContent, "Welcome to CAHSAI Admin Panel 🎉");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue even if email fails - don't block admin creation
      }
    }

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: createdAdmin,
      tempPassword: adminPassword,
      emailSent: shouldSendEmail !== false,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update admin details
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;

    const admin = await User.findByPk(id);
    if (!admin || !admin.is_admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if new email is already in use (if being updated)
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Update basic fields
    if (firstName) admin.first_name = firstName;
    if (lastName) admin.last_name = lastName;
    if (email) admin.email = email;

    await admin.save();

    // Update role if provided
    if (role) {
      // Normalize role name from frontend
      const roleNameMapping = {
        'finance admin': 'finance',
        'creator admin': 'creator',
        'content moderator': 'content_moderator',
        'super admin': 'super_admin',
        'finance': 'finance',
        'creator': 'creator',
        'content_moderator': 'content_moderator',
        'super_admin': 'super_admin'
      };
      
      const cleanedRole = role.toLowerCase().trim();
      const normalizedRoleName = roleNameMapping[cleanedRole] || cleanedRole;
      
      const roleRecord = await Role.findOne({ 
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            Op.like,
            `${normalizedRoleName}%`
          )
        }
      });
      if (!roleRecord) {
        return res.status(400).json({
          success: false,
          message: `Role '${role}' not found. Available roles: super_admin, finance, creator, content_moderator`,
        });
      }

      // Remove existing roles and assign new one
      await UserRole.destroy({ where: { userId: admin.id } });
      await UserRole.create({
        userId: admin.id,
        roleId: roleRecord.id,
      });
    }

    // Fetch updated admin with roles
    const updatedAdmin = await User.findByPk(admin.id, {
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete admin (hard delete - completely removes from database)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id);
    if (!admin || !admin.is_admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Store admin details before deletion for email
    const adminEmail = admin.email;
    const adminName = `${admin.first_name} ${admin.last_name}`;

    // Delete associated user roles first
    await UserRole.destroy({ where: { userId: id } });

    // Hard delete - completely remove from database
    await admin.destroy();

    // Send email notification about admin removal
    const emailContent = adminAccountDeletedTemplate(admin.first_name, admin.last_name);
    
    try {
      await sendEmail(adminEmail, emailContent, "Account Status Update - Account Deleted");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      emailNotificationSent: true,
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Assign role to admin
export const assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "roleId is required",
      });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.is_admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Remove existing roles
    await UserRole.destroy({ where: { userId } });

    // Assign new role
    await UserRole.create({
      userId,
      roleId,
    });

    // Fetch updated admin with roles
    const updatedAdmin = await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all available roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { isActive: true },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          attributes: ["userId", "createdAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
      total: roles.length,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get specific admin
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id, {
      where: { is_admin: true, isDeleted: false },
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Fetch all other admins with their roles
    const otherAdmins = await User.findAll({
      where: {
        is_admin: true,
        isDeleted: false,
        id: { [Op.ne]: id }, // Exclude current admin
      },
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Fetch finance and creator users with their roles
    const financeAndCreators = await User.findAll({
      where: {
        isDeleted: false,
      },
      attributes: {
        exclude: ["password", "otp", "AccessToken"],
      },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
              where: {
                name: { [Op.in]: ["finance", "creator", "content_moderator"] },
              },
            },
          ],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: {
        currentAdmin: {
          ...admin.toJSON(),
          role: admin.userRoles?.[0]?.role || null,
        },
        allOtherAdmins: otherAdmins.map(adm => ({
          ...adm.toJSON(),
          role: adm.userRoles?.[0]?.role || null,
        })),
        financeAndCreators: financeAndCreators.map(user => ({
          ...user.toJSON(),
          role: user.userRoles?.[0]?.role || null,
        })),
        totalAdminsCount: otherAdmins.length + 1,
        totalFinanceAndCreators: financeAndCreators.length,
      },
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change admin status
export const changeAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: active, inactive, suspended",
      });
    }

    const admin = await User.findByPk(id);
    if (!admin || !admin.is_admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.admin_status = status;
    if (status === "inactive") {
      admin.isDeleted = true;
    }
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `Admin status changed to ${status}`,
      data: { id: admin.id, status: admin.admin_status },
    });
  } catch (error) {
    console.error("Error changing admin status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
