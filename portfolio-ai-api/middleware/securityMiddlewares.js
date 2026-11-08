import rateLimit from "express-rate-limit";
import { verifyToken } from "./authenticate.js";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied: no token provided" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = decoded; // Attach user info to request object
    next();
}

// Must run after authenticateToken. Blocks regular dashboard users from admin routes.
export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: admin only" });
    }
    console.log(` Admin API accessed by: ${req.user.username}`);
    next();
}

// Must run after authenticateToken. Dashboard routes need a real user id in the token.
export function requireUser(req, res, next) {
    if (!req.user?.userId) {
        return res.status(401).json({ error: "Please log in again" });
    }
    next();
}

export function checkApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
}

// Throttle login/sign-up attempts per IP.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" },
});
