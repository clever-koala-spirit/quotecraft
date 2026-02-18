import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are QuoteCraft AI — an experienced Australian trade estimator and CRM assistant. You help tradies create professional quotes and manage their clients/jobs.

## Quote Generation
When a user describes a job:
1. Identify the trade type and scope
2. Ask 1-2 clarifying questions if key details are missing
3. When ready, generate quote data as JSON block

When ready to generate a quote:
\`\`\`json
{"quoteReady": true, "title": "Short job title", "description": "Job description", "tradeType": "electrical|plumbing|carpentry|painting|general|etc", "lineItems": [{"description": "Item desc", "quantity": 1, "unit": "each", "unitPrice": 100, "category": "labour|materials"}], "notes": "Any notes for the quote"}
\`\`\`

## CRM Actions
You can also manage clients, jobs, and follow-ups. When the user asks you to do CRM actions, include this JSON:

To add a note to a client:
\`\`\`json
{"crmAction": "add_note", "clientName": "name", "content": "note text"}
\`\`\`

To create a follow-up reminder:
\`\`\`json
{"crmAction": "create_followup", "clientName": "name (optional)", "title": "reminder text", "dueDate": "YYYY-MM-DD"}
\`\`\`

To search/query CRM data, use the context provided below to answer questions about clients, quotes, jobs, and follow-ups.

Keep responses SHORT and practical — tradies are busy. Use plain language. Use realistic Australian pricing ex-GST.`;

function getCrmContext(userId) {
  const clientCount = db.prepare('SELECT COUNT(*) as c FROM clients WHERE user_id = ?').get(userId).c;
  const recentClients = db.prepare('SELECT name, email, phone FROM clients WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10').all(userId);
  const today = new Date().toISOString().split('T')[0];
  const overdueFollowups = db.prepare('SELECT f.title, f.due_date, c.name as client_name FROM followups f LEFT JOIN clients c ON f.client_id = c.id WHERE f.user_id = ? AND f.completed = 0 AND f.due_date < ? LIMIT 5').all(userId, today);
  const todayFollowups = db.prepare('SELECT f.title, f.due_date, c.name as client_name FROM followups f LEFT JOIN clients c ON f.client_id = c.id WHERE f.user_id = ? AND f.completed = 0 AND f.due_date = ? LIMIT 5').all(userId, today);
  const activeJobs = db.prepare("SELECT j.title, j.stage, j.value, c.name as client_name FROM jobs j LEFT JOIN clients c ON j.client_id = c.id WHERE j.user_id = ? AND j.stage NOT IN ('completed','paid') ORDER BY j.updated_at DESC LIMIT 10").all(userId);
  const recentQuotes = db.prepare('SELECT client_name, total, status, created_at FROM quotes WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(userId);
  const unansweredQuotes = db.prepare("SELECT client_name, total, sent_at FROM quotes WHERE user_id = ? AND status = 'sent' AND sent_at < datetime('now', '-3 days') ORDER BY sent_at ASC LIMIT 5").all(userId);

  let ctx = `\n\n## CRM Context (${clientCount} total clients)\n`;
  if (recentClients.length) ctx += `Recent clients: ${recentClients.map(c => c.name).join(', ')}\n`;
  if (overdueFollowups.length) ctx += `OVERDUE follow-ups: ${overdueFollowups.map(f => `${f.title} (${f.client_name || 'no client'}, due ${f.due_date})`).join('; ')}\n`;
  if (todayFollowups.length) ctx += `Today's follow-ups: ${todayFollowups.map(f => `${f.title} (${f.client_name || 'no client'})`).join('; ')}\n`;
  if (activeJobs.length) ctx += `Active jobs: ${activeJobs.map(j => `${j.title} [${j.stage}] ${j.client_name || ''} $${j.value || 0}`).join('; ')}\n`;
  if (recentQuotes.length) ctx += `Recent quotes: ${recentQuotes.map(q => `${q.client_name} $${q.total} (${q.status})`).join('; ')}\n`;
  if (unansweredQuotes.length) ctx += `⚠️ Unanswered quotes (sent >3 days ago): ${unansweredQuotes.map(q => `${q.client_name} $${q.total} sent ${q.sent_at}`).join('; ')}\n`;
  return ctx;
}

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

    // Build messages for OpenAI with CRM context
    const crmContext = getCrmContext(userId);

    // If user asks about a specific client, inject their details
    let specificClientCtx = '';
    const clientNameMatch = message.match(/(?:for|about|to|with|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (clientNameMatch) {
      const searchName = clientNameMatch[1];
      const matchedClients = db.prepare('SELECT * FROM clients WHERE user_id = ? AND name LIKE ?').all(userId, `%${searchName}%`);
      if (matchedClients.length) {
        for (const mc of matchedClients) {
          const timeline = db.prepare('SELECT type, content, created_at FROM client_timeline WHERE client_id = ? ORDER BY created_at DESC LIMIT 5').all(mc.id);
          const quotes = db.prepare('SELECT client_name, total, status, created_at FROM quotes WHERE client_email = ? AND user_id = ? ORDER BY created_at DESC LIMIT 5').all(mc.email, userId);
          specificClientCtx += `\nClient "${mc.name}": email=${mc.email}, phone=${mc.phone}, company=${mc.company || 'n/a'}, tags=${mc.tags}`;
          if (timeline.length) specificClientCtx += `\nTimeline: ${timeline.map(t => `${t.type}: ${t.content} (${t.created_at})`).join('; ')}`;
          if (quotes.length) specificClientCtx += `\nQuotes: ${quotes.map(q => `$${q.total} ${q.status} (${q.created_at})`).join('; ')}`;
        }
      }
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT + crmContext + specificClientCtx }];
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

    // Process CRM actions from AI response
    const crmMatch = reply.match(/```json\s*([\s\S]*?)```/g);
    if (crmMatch) {
      for (const block of crmMatch) {
        try {
          const json = JSON.parse(block.replace(/```json\s*/, '').replace(/```/, ''));
          if (json.crmAction === 'add_note' && json.clientName) {
            const client = db.prepare('SELECT id FROM clients WHERE user_id = ? AND name LIKE ?').get(userId, `%${json.clientName}%`);
            if (client) {
              db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata) VALUES (?, ?, ?, ?, ?, ?)').run(
                uuid(), client.id, userId, 'note', json.content, '{}'
              );
            }
          } else if (json.crmAction === 'create_followup') {
            let clientId = null;
            if (json.clientName) {
              const client = db.prepare('SELECT id FROM clients WHERE user_id = ? AND name LIKE ?').get(userId, `%${json.clientName}%`);
              if (client) clientId = client.id;
            }
            db.prepare('INSERT INTO followups (id, user_id, client_id, title, due_date) VALUES (?, ?, ?, ?, ?)').run(
              uuid(), userId, clientId, json.title, json.dueDate
            );
          }
        } catch (e) { /* not a CRM action */ }
      }
    }

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
