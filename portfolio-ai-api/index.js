// app.js or index.js
import express from "express";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Mount routes
app.use("/api", routes); // All routes start with /api

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
