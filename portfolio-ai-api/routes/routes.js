import express from 'express';
const router = express.Router();
import { authenticateToken, checkApiKey } from '../middleware/securityMiddlewares.js';
import {upload} from '../middleware/uploadMiddleware.js';
import { askQuestionHandler, addKnowledgeHandler, updateKnowledgeHandler, deleteKnowledgeHandler } from '../controller/controller.js';
import { loginHandler } from '../controller/authController.js';
import { uploadResume, downloadResume } from '../controller/resumeController.js';
import { sendContactEmail } from '../controller/emailController.js';
import { keepAlive } from '../controller/keepAliveController.js';

// Keep-alive endpoint for UptimeRobot (no API key required)
router.get('/keep-alive', keepAlive);

router.get('/resume/view', checkApiKey, downloadResume); //for viewing the resume in the browser (inline)

router.get('/resume/download', checkApiKey, downloadResume);

router.post('/resume', upload.single("file"), checkApiKey, authenticateToken, uploadResume);

router.post('/login', checkApiKey, loginHandler);

router.post('/ask', checkApiKey, askQuestionHandler);

router.post('/knowledge', checkApiKey, authenticateToken, addKnowledgeHandler);

router.put('/knowledge/:id', checkApiKey, authenticateToken, updateKnowledgeHandler);

router.delete('/knowledge', checkApiKey, authenticateToken, deleteKnowledgeHandler);

router.post('/contact', checkApiKey, sendContactEmail);

export default router;



