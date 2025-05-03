import { OpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load knowledge base
async function loadKnowledgeBase() {
  const data = await fs.readFile("./knowledge.json", "utf-8");
  return JSON.parse(data);
}

// Get embedding from OpenAI
export async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  });

  return response.data[0].embedding;
}
export function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}
// Main: generate embeddings for all knowledge base items
// and save to a new file
async function generateEmbeddings() {
  const knowledgeBase = await loadKnowledgeBase();
  const embeddedData = [];

  for (const item of knowledgeBase) {
    try {
      console.log(`Embedding: ${item.id}`);
      const embedding = await getEmbedding(item.content);

      // Validate the embedding
      if (!Array.isArray(embedding) || embedding.some(e => typeof e !== 'number')) {
        throw new Error(`Invalid embedding format for ${item.id}`);
      }

      embeddedData.push({
        id: item.id,
        content: item.content,
        embedding: embedding,
      });
    } catch (err) {
      console.error(`Failed to process ${item.id}:`, err);
    }
  }

  await fs.writeFile(
    "./embedded_knowledge.json",
    JSON.stringify(embeddedData, null, 2),
    "utf-8"
  );
  console.log("All embeddings saved to embedded_knowledge.json");
}

// generateEmbeddings();