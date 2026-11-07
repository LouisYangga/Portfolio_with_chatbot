import "../config/env.js";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";


class ConnectionManager {
    constructor() {
        this.openaiClient = null;
        this.pineconeIndex = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize OpenAI
            this.openaiClient = new OpenAI({ 
                apiKey: process.env.OPENAI_API_KEY
            });

            // Initialize Pinecone
            const pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });

            this.pineconeIndex = pinecone.Index(
                process.env.PINECONE_INDEX_NAME,
                process.env.PINECONE_INDEX_HOST
            );

            this.isInitialized = true;
            console.log('All connections initialized successfully');
        } catch (error) {
            console.error('Failed to initialize connections:', error);
            throw error;
        }
    }

    getOpenAIClient() {
        if (!this.isInitialized) {
            throw new Error('Connections not initialized');
        }
        return this.openaiClient;
    }

    getPineconeIndex() {
        if (!this.isInitialized) {
            throw new Error('Connections not initialized');
        }
        return this.pineconeIndex;
    }
}

// Create a singleton instance
const connectionManager = new ConnectionManager();

export default connectionManager;