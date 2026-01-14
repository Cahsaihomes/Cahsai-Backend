import sequelize from "./src/config/database.mjs";
import { User } from "./src/models/userModel/index.mjs";
import bcrypt from "bcryptjs";

async function updateAdminPassword() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const email = "admin@mail.com";
    
    // Find the admin user
    const adminUser = await User.findOne({ where: { email } });
    if (!adminUser) {
      console.log("❌ Admin user not found");
      await sequelize.close();
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash("Admin@1234", 10);

    // Update password
    await adminUser.update({ password: hashedPassword });

    console.log("✅ Admin password updated successfully!");
    console.log({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      name: `${adminUser.first_name} ${adminUser.last_name}`,
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error updating admin password:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

updateAdminPassword();
