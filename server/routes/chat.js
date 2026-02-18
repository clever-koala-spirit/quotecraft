import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are QuoteCraft AI — an experienced Australian trade estimator. You help tradies create professional quotes quickly.

When a user describes a job:
1. Identify the trade type and scope
2. Ask 1-2 clarifying questions if key details are missing (don't over-ask)
3. When you have enough info, generate the quote data

Keep responses SHORT and practical — tradies are busy. Use plain language, not corporate speak.

If photos are uploaded, analyze them and factor into your estimate.

When ready to generate a quote, include this exact JSON block in your response (the frontend will detect it):
\`\`\`json
{"quoteReady": true, "title": "Short job title", "description": "Job description", "tradeType": "electrical|plumbing|carpentry|painting|general|etc", "lineItems": [{"description": "Item desc", "quantity": 1, "unit": "each", "unitPrice": 100, "category": "labour|materials"}], "notes": "Any notes for the quote"}
\`\`\`

Use realistic Australian pricing. Include both labour and materials as separate line items where appropriate. GST is handled separately by the system — quote prices ex-GST.`;

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, conversationId, images } = req.body;
    const userId = req.user.id;
    const convId = conversationId || uuid();

    // Store user message
    db.prepare('INSERT INTO chat_messages (id, conversation_id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))').run(uuid(), convId, userId, 'user', message);

    // Get conversation history
    const history = db.prepare('SELECT role, content FROM chat_messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at ASC').all(convId, userId);

    // Build messages for OpenAI
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    for (const msg of history) {
      messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    }

    // If images provided, add them to the last user message
    if (images && images.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const content = [{ type: 'text', text: lastMsg.content || 'Analyze these photos for the quote.' }];
      for (const img of images.slice(0, 4)) {
        content.push({ type: 'image_url', image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` } });
      }
      lastMsg.content = content;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Store assistant reply
    db.prepare('INSERT INTO chat_messages (id, conversation_id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))').run(uuid(), convId, userId, 'assistant', reply);

    res.json({ reply, conversationId: convId });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat failed: ' + err.message });
  }
});

// GET /api/chat/conversations
router.get('/conversations', async (req, res) => {
  const userId = req.user.id;
  const convs = db.prepare(`
    SELECT conversation_id, MAX(created_at) as last_message, MIN(content) as first_message
    FROM chat_messages WHERE user_id = ? AND role = 'user'
    GROUP BY conversation_id ORDER BY last_message DESC LIMIT 20
  `).all(userId);
  res.json(convs);
});

// GET /api/chat/:conversationId
router.get('/:conversationId', async (req, res) => {
  const userId = req.user.id;
  const messages = db.prepare('SELECT role, content, created_at FROM chat_messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at ASC').all(req.params.conversationId, userId);
  res.json(messages);
});

export default router;
