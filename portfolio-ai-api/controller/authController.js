import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/authenticate.js";
import { SECTORS } from "../config/sectors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const tokenFor = (user) =>
    generateToken({ userId: user._id.toString(), role: user.role, username: user.username || user.email });

// This function seeds an admin user if it doesn't already exist
export const seedAdminUser = async () => {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
        if (existingAdmin.role !== "admin") {
            await User.updateOne({ _id: existingAdmin._id }, { $set: { role: "admin" } });
            console.log("Admin user role set.");
        }
        return;
    }

    const hashedPassword = await bcrypt.hash("put your password here", 10); // Replace with your desired password

    await User.create({ firstName: "Louis", lastName: "Yangga", username: "admin", password: hashedPassword, role: "admin" });
    console.log("Admin user created.");
};

// Admin login (username + password) — used by the hidden admin panel.
export async function loginHandler(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password || "", user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Existing admin documents may predate the `role` field.
        if (user.username === "admin" && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }
        if (user.role !== "admin") {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.json({ message: "Login successful", token: tokenFor(user) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Public sign-up for the stocks dashboard.
export async function signupHandler(req, res) {
    const { firstName, lastName = "", email, password } = req.body || {};
    const normEmail = String(email || "").trim().toLowerCase();

    if (!firstName || !String(firstName).trim()) return res.status(400).json({ error: "First name is required" });
    if (!EMAIL_RE.test(normEmail)) return res.status(400).json({ error: "A valid email is required" });
    if (typeof password !== "string" || password.length < MIN_PASSWORD) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    try {
        if (await User.exists({ email: normEmail })) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }
        const user = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: normEmail,
            password: await bcrypt.hash(password, 10),
            role: "user",
        });
        return res.status(201).json({ token: tokenFor(user), user: user.toPublic() });
    } catch (error) {
        if (error?.code === 11000 && error?.keyPattern?.email) return res.status(409).json({ error: "An account with this email already exists" });
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Email + password login for dashboard users.
export async function userLoginHandler(req, res) {
    const { email, password } = req.body || {};
    try {
        const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password || "", user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        return res.json({ token: tokenFor(user), user: user.toPublic() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function meHandler(req, res) {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({ user: user.toPublic() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updatePreferencesHandler(req, res) {
    const { sectors } = req.body || {};
    if (!Array.isArray(sectors) || sectors.some((s) => !SECTORS.includes(s))) {
        return res.status(400).json({ error: "sectors must be an array of valid sector names", validSectors: SECTORS });
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { "preferences.sectors": [...new Set(sectors)], "preferences.onboarded": true } },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({ user: user.toPublic() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
