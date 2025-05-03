import {openai, addKnowledge, updateKnowledge, getRelevantContext, deleteKnowledge, logAction } from "../utils/utils.js";
import { generateToken } from "../middleware/auth.js";

//temporary admin user 
const adminUser = {
  username: "admin", 
  password: "admin123" // Change this to a secure password in production
};

export function loginHandler (req, res) {
  const { username, password } = req.body;

  if (username === adminUser.username && password === adminUser.password) {
    const token = generateToken({ username: "admin"});
    return res.json({ token });
  } 
  return res.status(401).json({ error: "Invalid credentials" });
};

export async function askQuestionHandler (req, res) {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: "Question is required" });

  try {

    const context = await getRelevantContext(question);
    console.log("Context:", context);
    if (!context) return res.status(404).json(
      { answer: "Sorry, there's no relevant information available. Please check Louis' portfolio for more details." }
    );

    const systemPrompt = `
    You are an AI assistant representing Louis Yangga, a passionate Graduate Software Engineer specialized in backend systems, AI, and Software developments.
    When answering, pretend you are the developer speaking directly to the user.
    Answer user questions based on the context provided below. 
    If the question is unrelated to Louis' work, skills, projects, hobbies, favorite food, or interests, politely suggest checking out Louis' portfolio for more details.
    Louis is from Indonesia and only provides information of his nationality when asked.
    Use the context to provide a relevant answer, but do not copy it verbatim.
    Always sound friendly, confident, and professional.
    DO NOT mention "based on the context" or "based on the provided information."
    NEVER use "I", "me", or "my" — instead, use "Louis", "he", or "his".
    If the context does not contain enough information, answer honestly and suggest visiting the portfolio for more details.
    `;
    
    const userPrompt = `
    Context:
    ${context}
    
    Question:
    ${question}
    `;
    
    const gptRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500, // limit for the response length
    });
    
    const answer = gptRes.choices[0].message.content;
    res.json({ answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
  };

export async function addKnowledgeHandler(req, res) {
  const { id, content } = req.body;

  if (!content || !id) return res.status(400).json({ error: "Content and id are required" });

  try {
    await addKnowledge(id, content);
    logAction({
      username: req.user.username,
      action: "add",
      id,
      content,
      ip: req.ip
    });
    res.status(201).json({ message: `Knowledge added successfully by user: ${req.user.username}` });
  } catch (err) {
    logAction({
      username: req.user.username,
      action: "add",
      id,
      content,
      ip: req.ip,
      error: err.message
    });
    console.error(err);
    res.status(500).json({ error: "Failed to add knowledge", err: err.message });
  }
}

export async function updateKnowledgeHandler(req, res) {
  const { id } = req.params;
  const { newContent } = req.body;

  if (!newContent) return res.status(400).json({ error: "Content is required" });

  try {
    await updateKnowledge(id, newContent);
    logAction({
      username: req.user.username,
      action: "update",
      id,
      content: newContent,
      ip: req.ip
    });
    res.status(200).json({ message: `Knowledge updated successfully by user: ${req.user.username}` });
  } catch (err) {
    console.error(err);
    logAction({
      username: req.user.username,
      action: "update",
      id,
      content: newContent,
      ip: req.ip,
      error: err.message
    });
    res.status(500).json({ error: "Failed to update knowledge" });
  }
}

export async function deleteKnowledgeHandler(req, res) {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "ID is required" });

  try {
    await deleteKnowledge(id);
    logAction({
      username: req.user.username,
      action: "delete",
      id,
      ip: req.ip
    });
    res.status(200).json({ message: `Knowledge deleted successfully by user: ${req.user.username}` });
  } catch (err) {
    console.error(err);
    logAction({
      username: req.user.username,
      action: "delete",
      id,
      ip: req.ip,
      error: err.message
    });
    res.status(500).json({ error: "Failed to delete knowledge", message: err.message });
  }
}
