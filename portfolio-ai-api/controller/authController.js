import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/authenticate.js";

// This function seeds an admin user if it doesn't already exist
export const seedAdminUser = async () => {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) return;
  
    const hashedPassword = await bcrypt.hash("put your password here", 10); // Replace with your desired password
  
    await User.create({ firstName: "Louis", lastName: "Yangga", username: "admin", password: hashedPassword });
    console.log("Admin user created.");
  };

export async function loginHandler(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({ username: user.username });
        return res.json({ message: "Login successful",token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}