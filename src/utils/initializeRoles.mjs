import { Role } from "../models/roleModel/index.mjs";

export async function initializeDefaultRoles() {
  try {
    const defaultRoles = [
      {
        name: "Super Admin",
        description: "Full administrative access to all system features",
        permissions: [
          "manage_admins",
          "manage_users",
          "manage_payouts",
          "review_content",
          "manage_reports",
          "view_analytics",
          "system_settings",
          "manage_roles",
        ],
        isActive: true,
      },
      {
        name: "Finance Admin",
        description: "Manage financial transactions and payouts",
        permissions: [
          "manage_payouts",
          "view_transactions",
          "generate_reports",
          "approve_payments",
          "view_analytics",
        ],
        isActive: true,
      },
      {
        name: "Content Moderator",
        description: "Review and moderate user-generated content",
        permissions: [
          "review_content",
          "remove_content",
          "flag_users",
          "view_reports",
          "manage_appeals",
        ],
        isActive: true,
      },
    ];

    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ where: { name: role.name } });
      
      if (!existingRole) {
        await Role.create(role);
        // console.log(`✅ Created role: ${role.name}`);
      } else {
        // console.log(`✅ Role already exists: ${role.name}`);
      }
    }

    // console.log("✅ Default roles initialized");
    return true;
  } catch (error) {
    console.error("❌ Error initializing roles:", error.message);
    return false;
  }
}
