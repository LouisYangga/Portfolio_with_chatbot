import {openai, addKnowledge, updateKnowledge, getRelevantContext, deleteKnowledge, logAction } from "../utils/utils.js";

export async function askQuestionHandler (req, res) {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: "Question is required" });

  try {

    const context = await getRelevantContext(question);
    console.log("Context:", context );
    if (!context) return res.status(404).json(
      { answer: "Sorry, there's no relevant information available. Please check Louis' portfolio for more details or reach out to him via email at louis.yangga@gmail.com" }
    );

    const systemPrompt = `
    You are an AI assistant representing Louis Yangga, a passionate Graduate Software Engineer specializing in backend systems, AI, and software development.
    NEVER use "I", "me", or "my" — always refer to "Louis", "he", or "his".
    If the question is unrelated to Louis' work, education, skills, location, interests, or hobbies, politely suggest the user check out his portfolio for more information.
    Respond as if Louis is directly answering the user, using a friendly, confident, and professional tone. Avoid generic or robotic responses.
    Answer questions using the context provided below. Do not copy context verbatim—rephrase it naturally. Do not include any disclaimers or unnecessary information.
    Only include contact details (LinkedIn or email: louis.yangga@gmail.com) if:
    - The user asks how to contact Louis
    - The answer is incomplete or not directly found in the context
    - The question relates to job opportunities, collaboration, or requests for more information
    Do NOT include contact information if the context fully answers the question.
    Louis is from Indonesia, but only mention this if the user asks directly about his nationality.
    NEVER say "based on the context" or "from the provided information."
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
  const { id, content, category } = req.body;

  if (!content || !id || !category) return res.status(400).json({ error: "Content, Category and id are required" });

  try {
    await addKnowledge(id, content, category);
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
    res.status(500).json({ error: err.message });
  }
}

export async function updateKnowledgeHandler(req, res) {
  const { id } = req.params;
  const { newContent,category } = req.body;

  if (!newContent) return res.status(400).json({ error: "Content is required" });

  try {
    await updateKnowledge(id, newContent,category);
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
}
