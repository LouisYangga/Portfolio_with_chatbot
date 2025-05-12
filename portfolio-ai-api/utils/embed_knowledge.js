import dotenv from "dotenv";
import fs from "fs/promises";
import connectionManager from "./connections.js";

dotenv.config();

// Load knowledge base
async function loadKnowledgeBase() {
  const data = await fs.readFile("./data/knowledge.json", "utf-8");
  return JSON.parse(data);
}

// Get embedding from OpenAI
export async function getEmbedding(text) {
  const openai = connectionManager.getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
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
// and save to a new file, "embedded_knowledge.json" local file
// async function generateEmbeddings() {
//   const knowledgeBase = await loadKnowledgeBase();
//   const embeddedData = [];

//   for (const item of knowledgeBase) {
//     try {
//       console.log(`Embedding: ${item.id}`);
//       const embedding = await getEmbedding(item.content);

//       // Validate the embedding
//       if (!Array.isArray(embedding) || embedding.some(e => typeof e !== 'number')) {
//         throw new Error(`Invalid embedding format for ${item.id}`);
//       }

//       embeddedData.push({
//         id: item.id,
//         content: item.content,
//         embedding: embedding,
//       });
//     } catch (err) {
//       console.error(`Failed to process ${item.id}:`, err);
//     }
//   }

//   await fs.writeFile(
//     "./data/embedded_knowledge.json",
//     JSON.stringify(embeddedData, null, 2),
//     "utf-8"
//   );
//   console.log("All embeddings saved to embedded_knowledge.json");
// }

// generateEmbeddings();
//add knowledge to Pinecone - cloud database
// This function reads the knowledge base from a local file, generates embeddings for each item, and upserts them to Pinecone.
import { initPineconeIndex } from "../pineconeClient.js";
async function addKnowledgeToPinecone() {
  const knowledgeBase = await loadKnowledgeBase();
  const index = await initPineconeIndex();
  for (const item of knowledgeBase) {
    try {
      console.log(`Processing: ${item.id}`);
      const embedding = await getEmbedding(item.content);

      // Validate the embedding
      if (!Array.isArray(embedding) || embedding.some(e => typeof e !== 'number')) {
        throw new Error(`Invalid embedding format for ${item.id}`);
      }

      // Upsert to Pinecone
      await index.upsert([
        {
          id: item.id,
          values: embedding,
          metadata: { content: item.content },
        },
      ]);

      console.log(`Successfully added ${item.id} to Pinecone`);
    } catch (err) {
      console.error(`Failed to process ${item.id}:`, err);
    }
  }

  console.log("All knowledge base items have been added to Pinecone.");
}
// addKnowledgeToPinecone();