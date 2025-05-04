import db from "../config/db.js";

const resumes = db.collection("resume");

export async function getResume(req, res) {
  const resume = await resumes.findOne({}, { sort: { lastUpdated: -1 } });
  if (!resume) return res.status(404).json({ error: "Resume not found" });

  res.json({ content: resume.content });
}
