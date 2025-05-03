import { OpenAI } from "openai";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to get embedding of a text
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Main search function
async function searchKnowledgeBase(question) {
  // 1. Load your embedded knowledge
  const rawData = await fs.readFile("./embedded_knowledge.json", "utf-8");
  const knowledgeBase = JSON.parse(rawData);

  // 2. Embed the user question
  const questionEmbedding = await getEmbedding(question);

  // 3. Compare with all saved embeddings
  const results = knowledgeBase.map((item) => {
    const similarity = cosineSimilarity(questionEmbedding, item.embedding);
    return { id: item.id, content: item.content, similarity };
  });

  // 4. Sort results by highest similarity
  results.sort((a, b) => b.similarity - a.similarity);

  // 5. Return the best match (you can return top 3 if you want)
  return results[0];
}

// Example usage:
async function main() {
  const userQuestion = "What skills do you have?";
  const bestMatch = await searchKnowledgeBase(userQuestion);
  console.log("Best match:", bestMatch);
}

main();
