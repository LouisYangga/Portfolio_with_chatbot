import "./config/env.js";
import express from "express";
import connectDB from "./config/db.js";
import routes from "./routes/routes.js";
import cors from "cors";
import connectionManager from "./utils/connections.js";
import User from "./models/userModel.js";

const app = express();
app.set("trust proxy", 1); // behind Render's proxy — needed for per-IP rate limiting
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: [
    "https://portfolio-with-chatbot-five.vercel.app",  // Vercel-provided domain
    "https://louisyangga.com", 
    "https://www.louisyangga.com",
    "http://localhost:5173"  // For local development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"]
}));

// Initialize all connections
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // The users collection predates email sign-up: rebuild indexes so `username`
    // and `email` are unique-but-sparse (otherwise a 2nd user without a username collides).
    await User.syncIndexes();

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
