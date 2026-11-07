// Loads portfolio-ai-api/.env no matter which folder the process is started
// from. dotenv.config() on its own only looks in process.cwd(), so running a
// script from the repo root or from utils/ silently skipped the .env file.
// On Render there is no .env file; variables come from the dashboard and
// dotenv leaves them alone.
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
