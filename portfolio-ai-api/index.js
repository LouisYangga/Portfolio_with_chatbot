// app.js or index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import the database connection
import routes from "./routes/routes.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"]
}));

await connectDB(); // Connect to the database
// Mount routes
app.use("/api", routes); // All routes start with /api

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
