import { User } from "../models/userModel/index.mjs";
import { UserRole } from "../models/roleModel/index.mjs";

// Check if user is admin or super admin
export const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Allow if is_admin is true OR role is "admin"
    if (!user.is_admin && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin privileges required",
      });
    }

    if (user.admin_status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin account is suspended",
      });
    }

    next();
  } catch (error) {
    console.error("Error in isAdminOrSuperAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user has specific permission
export const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin privileges required",
        });
      }

      // Get user's roles and their permissions
      const userRoles = await UserRole.findAll({
        where: { userId: user.id },
        include: [
          {
            association: "role",
            attributes: ["permissions"],
          },
        ],
      });

      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: No roles assigned",
        });
      }

      // Check if any of the user's roles has the required permission
      const hasRequiredPermission = userRoles.some((userRole) => {
        const permissions = userRole.role.permissions || [];
        return Array.isArray(permissions) && permissions.includes(requiredPermission);
      });

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Permission '${requiredPermission}' required`,
        });
      }

      next();
    } catch (error) {
      console.error("Error in hasPermission middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Check if user is Super Admin
export const isSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.is_admin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin privileges required",
      });
    }

    const userRole = await UserRole.findOne({
      where: { userId: user.id },
      include: [
        {
          association: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!userRole || userRole.role.name !== "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Super Admin privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("Error in isSuperAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin privileges required",
        });
      }

      const userRole = await UserRole.findOne({
        where: { userId: user.id },
        include: [
          {
            association: "role",
            attributes: ["name"],
          },
        ],
      });

      if (!userRole || userRole.role.name !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: ${requiredRole} role required`,
        });
      }

      next();
    } catch (error) {
      console.error("Error in hasRole middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
