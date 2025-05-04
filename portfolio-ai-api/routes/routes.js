import express from 'express';
const router = express.Router();
import { authenticateToken, checkApiKey } from '../middleware/middlewares.js';
import { askQuestionHandler, addKnowledgeHandler, updateKnowledgeHandler, deleteKnowledgeHandler } from '../controller/controller.js';
import { loginHandler } from '../controller/authController.js';

router.post('/login', checkApiKey, loginHandler);

router.post('/ask', checkApiKey, askQuestionHandler);

router.post('/knowledge', checkApiKey, authenticateToken, addKnowledgeHandler);

router.put('/knowledge/:id', checkApiKey, authenticateToken, updateKnowledgeHandler);

router.delete('/knowledge', checkApiKey, authenticateToken, deleteKnowledgeHandler);

export default router;



