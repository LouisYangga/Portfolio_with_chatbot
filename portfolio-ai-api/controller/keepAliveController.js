import mongoose from "mongoose";
import connectionManager from "../utils/connections.js";

export const keepAlive = async (req, res) => {
  try {
    // Check if MongoDB connection is active
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    // Initialize connections safely (with free operations)
    try {
      // Get OpenAI client and list models (this operation is free)
      const openai = connectionManager.getOpenAIClient();
      await openai.models.list();
      
      // Get Pinecone index and use a free operation to warm up the connection
      const pineconeIndex = connectionManager.getPineconeIndex();
      await pineconeIndex.describeIndexStats(); // This is free and keeps the connection active
      
    } catch (connError) {
      console.log("Connection warm-up had issues:", connError.message);
      // We don't throw the error to avoid failing the entire endpoint
    }
    
    // Log the ping
    console.log(`Keep-alive check at ${new Date().toISOString()}`);
    
    res.status(200).json({
      status: "success",
      message: "Server is running",
      timestamp: new Date(),
      services: {
        server: "active",
        mongodb: dbStatus
      }
    });
  } catch (error) {
    console.error("Keep-alive check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Server check failed",
      error: error.message
    });
  }
};