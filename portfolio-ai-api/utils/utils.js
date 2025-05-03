import { OpenAI } from "openai";
import * as fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { getEmbedding } from "./embed_knowledge.js";
import { initPineconeIndex } from "../pineconeClient.js";
const index = await initPineconeIndex();
dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function addKnowledge(id, content) {
  try {
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
        metadata: { content: content },
      },
    ]);

    console.log(`New knowledge item with ID ${id} added successfully to Pinecone.`);
  } catch (error) {
    console.error(`Failed to add knowledge item with ID ${id}:`, error.message);
    throw error;
  }
}
export async function updateKnowledge(id, newContent) {
  try {
    // Check if the ID exists in Pinecone
    if (!(await checkIdExists(id))) {
      throw new Error(`Knowledge item with ID ${id} not found in Pinecone.`);
    }

    // Generate updated embedding for the new content
    const updatedEmbedding = await getEmbedding(newContent);

    // Update the entry in Pinecone
    await index.upsert([
      {
        id: id,
        values: updatedEmbedding,
        metadata: { content: newContent },
      },
    ]);

    console.log(`Knowledge item with ID ${id} updated successfully in Pinecone.`);
  } catch (error) {
    console.error(`Failed to update knowledge item with ID ${id}:`, error.message);
    throw error;
  }
}
export async function deleteKnowledge(id) {

    if (!(await checkIdExists(id))) {
        throw new Error(`Knowledge item with ID ${id} not found.`);
    }

    await index.deleteOne([id]);
    console.log(`Knowledge item with ID ${id} deleted successfully.`);
}
// Function to search the knowledge base using Pinecone
export async function searchKnowledgeBase(userEmbedding, topN = 5) {	
  const result = await index.query({
    vector: userEmbedding,
    topK: topN,
    includeMetadata: true,
  });
  const matches = result.matches.map(match => ({
    id: match.id,
    content: match.metadata?.content || "",
    similarity: match.score, // Pinecone score
  }));
  return matches;
}

const THRESHOLD = 0.2; // Adjustable threshold for similarity
// Function to get relevant context based on the question
export async function getRelevantContext(question) {
    const questionLower = question.toLowerCase();

    //define category based shortcut
    const categories ={
        experience: (id) => id.startsWith("experience"),
        skills: (id) => id.startsWith("skills"),
        location: (id) => id.startsWith("location"),
        languages: (id) => id.startsWith("languages"),
        contact: (id) => id.startsWith("contact"),
        food: (id) => id.startsWith("food"),
        hobbies: (id) => id.startsWith("hobbies")
    }

    for(const [category ,check] of Object.entries(categories)){
        if(questionLower.includes(category)){
          const query = await index.query({
            vector: await getEmbedding(question),
            topK: 10,
            includeMetadata: true,
          });
          
          const categoryMatches = query.matches
          .filter((match) => check(match.id))
          .map((match) => match.metadata.content);  
          
          if (categoryMatches.length) {
              return categoryMatches.join("\n");
          }
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

  async function checkIdExists(id) {
    const existingEntry = await index.fetch([id]);
    return existingEntry?.records && Object.keys(existingEntry.records).includes(id);
  }