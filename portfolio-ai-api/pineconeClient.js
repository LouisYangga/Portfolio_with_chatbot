import "./config/env.js";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  
export const initPineconeIndex = async () => {
const index = pinecone.Index(
    process.env.PINECONE_INDEX_NAME, 
    process.env.PINECONE_INDEX_HOST);
return index;
};

