import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  
export const initPineconeIndex = async () => {
const index = pinecone.Index(
    process.env.PINECONE_INDEX_NAME, 
    process.env.PINECONE_INDEX_HOST);
return index;
};

