import * as fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { getEmbedding } from "./embed_knowledge.js";
import connectionManager from "./connections.js";

dotenv.config();

export async function addKnowledge(id, content, category) {
  try {
    const index = connectionManager.getPineconeIndex();
    // Check if the ID already exists in Pinecone
    if ((await checkIdExists(id))) {
      throw new Error(`Knowledge item with ID ${id} already exists in Pinecone.`);
    }
    // Generate embedding for the new content
    const embedding = await getEmbedding(content);

    // Add the new entry to Pinecone
    await index.upsert([
      {
        id: id,
        values: embedding,
        metadata: { content: content, category: category },	
      },
    ]);

    console.log(`New knowledge item with ID ${id} added successfully to Pinecone.`);
  } catch (error) {
    console.error(`Failed to add knowledge item with ID ${id}:`, error.message);
    throw error;
  }
}

export async function updateKnowledge(id, newContent, category) {
  try {
    const index = connectionManager.getPineconeIndex();
    // Check if the ID exists in Pinecone
    if (!(await checkIdExists(id))) {
      throw new Error(`Knowledge item with ID ${id} not found in Pinecone.`);
    }
    const existingEntry = await index.fetch([id]);
    const existingMetadata = existingEntry.records[id].metadata;
    const finalCategory = category || existingMetadata.category;
    // Generate updated embedding for the new content
    const updatedEmbedding = await getEmbedding(newContent);
    
    await index.upsert([
      {
        id: id,
        values: updatedEmbedding,
        metadata: { content: newContent, category: finalCategory},
      },
    ]);

    console.log(`Knowledge item with ID ${id} updated successfully in Pinecone.`);
  } catch (error) {
    console.error(`Failed to update knowledge item with ID ${id}:`, error.message);
    throw error;
  }
}

export async function deleteKnowledge(id) {
  const index = connectionManager.getPineconeIndex();
  if (!(await checkIdExists(id))) {
    throw new Error(`Knowledge item with ID ${id} not found.`);
  }

  await index.deleteOne([id]);
  console.log(`Knowledge item with ID ${id} deleted successfully.`);
}

export async function searchKnowledgeBase(userEmbedding, topN = 5) {	
  const index = connectionManager.getPineconeIndex();
  const result = await index.query({
    vector: userEmbedding,
    topK: topN,
    includeMetadata: true,
  });
  const matches = result.matches.map(match => ({
    id: match.id,
    content: match.metadata?.content || "",
    similarity: match.score,
  }));
  return matches;
}

const THRESHOLD = 0.2;
export async function getRelevantContext(question) {
  const index = connectionManager.getPineconeIndex();
  const questionLower = question.toLowerCase();

  const categories = [
    "experience",
    "skills",
    "location",
    "languages",
    "contact",
    "food",
    "hobbies"
  ];
  
  for (const category of categories) {
    if (questionLower.includes(category)) {
      const query = await index.query({
        vector: await getEmbedding(question),
        topK: 10,
        includeMetadata: true,
        filter: { category }
      });

      const categoryMatches = query.matches
        .map((match) => match.metadata.content);
      
      if (categoryMatches.length) {
        console.log(`Category: ${category}, Matches: ${categoryMatches.length}`);
        return categoryMatches.join("\n");
      }
    }
  }

  const userEmbedding = await getEmbedding(question);
  const results = await searchKnowledgeBase(userEmbedding); 
  console.log("fallback being called");

  const relevantEntries = results.filter((item) => item.similarity >= THRESHOLD);
  if (relevantEntries.length === 0) {return null;}
  return relevantEntries.map((item) => item.content).join("\n");
}

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

async function checkIdExists(id) {
  const index = connectionManager.getPineconeIndex();
  const existingEntry = await index.fetch([id]);
  return existingEntry?.records && Object.keys(existingEntry.records).includes(id);
}