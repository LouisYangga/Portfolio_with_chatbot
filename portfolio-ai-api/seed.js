import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedAdminUser } from "./controller/authController.js";

dotenv.config();

(async () => {
  try {
    await connectDB();
    await seedAdminUser();
    console.log("Admin user seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
})();
