import sequelize from "./src/config/database.mjs";
import { Role } from "./src/models/roleModel/index.mjs";

async function createDefaultRoles() {
  try {
    console.log("🔄 Creating default roles...");

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
      try {
        const existingRole = await Role.findOne({ where: { name: role.name } });
        
        if (existingRole) {
          console.log(`✅ Role '${role.name}' already exists`);
          // Update permissions if they've changed
          await existingRole.update({
            description: role.description,
            permissions: role.permissions,
            isActive: role.isActive,
          });
          console.log(`   Updated permissions for '${role.name}'`);
        } else {
          await Role.create(role);
          console.log(`✅ Created role: ${role.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating role '${role.name}':`, error.message);
      }
    }

    console.log("✅ Default roles setup completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up roles:", error.message);
    process.exit(1);
  }
}

createDefaultRoles();
