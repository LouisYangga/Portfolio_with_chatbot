import { verifyToken } from "./auth.js";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied: no token provided" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = decoded; // Attach user info to request object
     // Log the user info
    console.log(` API accessed by: ${req.user.username}`);
    next();
}
export function checkApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
  }
  