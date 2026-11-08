import express from 'express';
const router = express.Router();
import { authenticateToken, checkApiKey, requireAdmin, requireUser, authLimiter } from '../middleware/securityMiddlewares.js';
import {upload} from '../middleware/uploadMiddleware.js';
import { askQuestionHandler, addKnowledgeHandler, updateKnowledgeHandler, deleteKnowledgeHandler } from '../controller/controller.js';
import { loginHandler, signupHandler, userLoginHandler, meHandler, updatePreferencesHandler } from '../controller/authController.js';
import { uploadResume, downloadResume } from '../controller/resumeController.js';
import { sendContactEmail } from '../controller/emailController.js';
import { keepAlive } from '../controller/keepAliveController.js';
import { listSectors, searchStocks, getRankings, getStock } from '../controller/stocksController.js';
import { listHoldings, addHolding, updateHolding, deleteHolding } from '../controller/portfolioController.js';

// Keep-alive endpoint for UptimeRobot (no API key required)
router.get('/keep-alive', keepAlive);

router.get('/resume/view', checkApiKey, downloadResume); //for viewing the resume in the browser (inline)

router.get('/resume/download', checkApiKey, downloadResume);

router.post('/resume', upload.single("file"), checkApiKey, authenticateToken, requireAdmin, uploadResume);

router.post('/login', authLimiter, checkApiKey, loginHandler);

router.post('/ask', checkApiKey, askQuestionHandler);

router.post('/knowledge', checkApiKey, authenticateToken, requireAdmin, addKnowledgeHandler);

router.put('/knowledge/:id', checkApiKey, authenticateToken, requireAdmin, updateKnowledgeHandler);

router.delete('/knowledge', checkApiKey, authenticateToken, requireAdmin, deleteKnowledgeHandler);

router.post('/contact', checkApiKey, sendContactEmail);

// ---- Stocks dashboard: user accounts ----
const userAuth = [checkApiKey, authenticateToken, requireUser];

router.post('/auth/signup', authLimiter, checkApiKey, signupHandler);
router.post('/auth/login', authLimiter, checkApiKey, userLoginHandler);
router.get('/auth/me', ...userAuth, meHandler);
router.put('/auth/preferences', ...userAuth, updatePreferencesHandler);

// ---- Stocks dashboard: market data ----
router.get('/stocks/sectors', checkApiKey, listSectors);
router.get('/stocks/search', checkApiKey, searchStocks);
router.get('/stocks/rankings', ...userAuth, getRankings);
router.get('/stocks/:ticker', ...userAuth, getStock);

// ---- Stocks dashboard: portfolio tracking (scoped to the logged-in user) ----
router.get('/portfolio', ...userAuth, listHoldings);
router.post('/portfolio', ...userAuth, addHolding);
router.put('/portfolio/:id', ...userAuth, updateHolding);
router.delete('/portfolio/:id', ...userAuth, deleteHolding);

export default router;



