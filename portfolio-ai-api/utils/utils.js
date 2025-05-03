import { OpenAI } from "openai";
import * as fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { getEmbedding, cosineSimilarity } from "./embed_knowledge.js";
dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function addKnowledge(id, content) {
    const data = await fs.readFile("./data/embedded_knowledge.json", "utf-8");
    const knowledgeBase = JSON.parse(data);

    const existingEntry = knowledgeBase.find((item) => item.id === id);
    if (existingEntry) {
        throw new Error(`Knowledge item with ID ${id} already exists.`);
    }
    const embedding = await getEmbedding(content);
    const newEntry = { id: id, content: content, embedding };

    knowledgeBase.push(newEntry);

    await fs.writeFile("./data/embedded_knowledge.json", JSON.stringify(knowledgeBase, null, 2), "utf-8");
    console.log(`New knowledge item with ID ${id} added successfully.`);
}
export async function updateKnowledge(id, newContent) {
    const data = await fs.readFile("./data/embedded_knowledge.json", "utf-8");
    const knowledgeBase = JSON.parse(data);

    const itemIndex = knowledgeBase.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
        throw new Error(`Knowledge item with ID ${id} not found.`);
    }

    const updatedEmbedding = await getEmbedding(newContent);
    knowledgeBase[itemIndex].content = newContent;
    knowledgeBase[itemIndex].embedding = updatedEmbedding;

    await fs.writeFile("./data/embedded_knowledge.json", JSON.stringify(knowledgeBase, null, 2), "utf-8");
    console.log(`Knowledge item with ID ${id} updated successfully.`);
}
export async function deleteKnowledge(id) {
    const data = await fs.readFile("./data/embedded_knowledge.json", "utf-8");
    const knowledgeBase = JSON.parse(data);

    const itemIndex = knowledgeBase.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
        throw new Error(`Knowledge item with ID ${id} not found.`);
    }

    knowledgeBase.splice(itemIndex, 1);

    await fs.writeFile("./data/embedded_knowledge.json", JSON.stringify(knowledgeBase, null, 2), "utf-8");
    console.log(`Knowledge item with ID ${id} deleted successfully.`);
}
// Function to search the knowledge base using cosine similarity
export async function searchKnowledgeBase(userEmbedding, topN = 5) {	
  const data = await fs.readFile("./data/embedded_knowledge.json", "utf-8");
  const knowledgeBase = JSON.parse(data);

  const results = knowledgeBase.map((item) => {
  const similarity = cosineSimilarity(userEmbedding, item.embedding);
    return { ...item, similarity };
  });
 
//  Log all similarity scores
//  results.forEach((r) =>
//     console.log(`[${r.id}] Similarity: ${r.similarity.toFixed(4)}`)
//   );
  
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topN); // top N matches
}

const THRESHOLD = 0.15; // Adjustable threshold for similarity
// Function to get relevant context based on the question
export async function getRelevantContext(question) {
    const data = await fs.readFile("./data/embedded_knowledge.json", "utf-8");
    const knowledgeBase = JSON.parse(data);
    const questionLower = question.toLowerCase();

    //define category based shortcut
    const categories ={
        experience: (id) => id.startsWith("experience"),
        skills: (id) => id.startsWith("skills"),
        food: (id) => id.startsWith("food"),
    }

    for(const [category ,check] of Object.entries(categories)){
        if(questionLower.includes(category)){
            const matches = knowledgeBase.filter(item => check(item.id));
            return matches.map(item => item.content).join("\n");
        }
    }

    // Fallback to embedding similarity
    const userEmbedding = await getEmbedding(question);
    const results = await searchKnowledgeBase(userEmbedding); 
    
    //debugging for tuning the threshold
    // results.forEach((item) => {
    //   console.log(`Context: ${item.content}, Similarity: ${item.similarity.toFixed(4)}`);
    // });
    // console.log(`////////////////////////////////////////////`);

    const relevantEntries = results.filter((item) => item.similarity >= THRESHOLD);

    if (relevantEntries.length === 0) {return null;}

    return relevantEntries.map((item) => item.content).join("\n");
}
// Function to log user actions
export function logAction({ username, action, id, content, ip }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      username,
      action,
      id,
      content,
      ip
    };
    const logFilePath = path.join("logs", "activity.log");
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n", (err) => {
      if (err) console.error("Failed to write log:", err);
    });
  }