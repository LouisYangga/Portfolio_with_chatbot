import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/routes.js";
import cors from "cors";
import connectionManager from "./utils/connections.js";

dotenv.config();
const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"]
}));

// Initialize all connections
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // Initialize OpenAI and Pinecone connections
    await connectionManager.initialize();
    console.log("OpenAI and Pinecone connections initialized successfully");

  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

// Mount routes
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

// Start server after initializing all services
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
