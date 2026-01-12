import sequelize from "./src/config/database.mjs";
import { User } from "./src/models/userModel/index.mjs";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const email = "admin@mail.com";
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("⚠️  User already exists with this email");
      await sequelize.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // Create admin user
    const adminUser = await User.create({
      first_name: "Admin",
      last_name: "User",
      user_name: "admin",
      email: "admin@mail.com",
      contact: "+1234567890",
      password: hashedPassword,
      role: "admin",
      acceptedTerms: true,
      avatarUrl: null,
      performancePoints: 0,
      emailVerified: true,  // Set to true so admin can login immediately
    });

    console.log("✅ Admin user created successfully!");
    console.log({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      name: `${adminUser.first_name} ${adminUser.last_name}`,
    });

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

createAdminUser();
