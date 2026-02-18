import db from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const USER_ID = uuid();
const now = new Date();
const d = (daysAgo, h = 10) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(h, Math.floor(Math.random() * 60), 0, 0);
  return dt.toISOString().replace('T', ' ').slice(0, 19);
};
const today = now.toISOString().slice(0, 10);
const dateOffset = (days) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
};

console.log('🌱 Seeding QuoteCraft demo data...');

// Clear existing
db.exec(`DELETE FROM followups; DELETE FROM jobs; DELETE FROM client_timeline; DELETE FROM quote_items; DELETE FROM quote_events; DELETE FROM quote_attachments; DELETE FROM quotes; DELETE FROM clients; DELETE FROM business_profiles; DELETE FROM chat_messages; DELETE FROM users;`);

// 1. Demo user
const hash = bcrypt.hashSync('demo1234', 10);
db.prepare('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)').run(USER_ID, 'demo@quotecraft.com', hash, d(30));
db.prepare('INSERT INTO business_profiles (id, user_id, business_name, abn, licence_number, phone, email, address, trade_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
  uuid(), USER_ID, 'Spark Electric', '12 345 678 901', 'EC12345', '0412 345 678', 'demo@quotecraft.com', '42 Smith St, Melbourne VIC 3000', 'electrician'
);

// 2. Clients
const clients = [
  { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '0412 111 222', address: '15 Bourke St, Richmond VIC 3121', company: '', tags: 'residential' },
  { name: 'David Chen', email: 'david.chen@chengroup.com.au', phone: '0413 222 333', address: '88 Collins St, Melbourne VIC 3000', company: 'Chen Property Group', tags: 'commercial' },
  { name: 'Emma Williams', email: 'emma.w@gmail.com', phone: '0414 333 444', address: '7 Oak Ave, Camberwell VIC 3124', company: '', tags: 'residential' },
  { name: 'Mark Thompson', email: 'mark@thompsondev.com.au', phone: '0415 444 555', address: '200 Lonsdale St, Melbourne VIC 3000', company: 'Thompson Developments', tags: 'commercial' },
  { name: 'Lisa Brown', email: 'lisa.brown@outlook.com', phone: '0416 555 666', address: '32 Chapel St, Prahran VIC 3181', company: '', tags: 'residential' },
  { name: 'James Wilson', email: 'james@wilsonfit.com.au', phone: '0417 666 777', address: '55 High St, Armadale VIC 3143', company: 'Wilson Fitness', tags: 'commercial' },
  { name: 'Rachel Kim', email: 'rachel.kim@email.com', phone: '0418 777 888', address: '12 Bay Rd, Sandringham VIC 3191', company: '', tags: 'residential' },
  { name: "Tom O'Brien", email: 'tom@obriencafe.com.au', phone: '0419 888 999', address: '99 Brunswick St, Fitzroy VIC 3065', company: "O'Brien's Café", tags: 'commercial' },
  { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '0420 999 000', address: '28 Station Rd, Box Hill VIC 3128', company: '', tags: 'residential' },
  { name: 'Chris Anderson', email: 'chris@andersonbuild.com.au', phone: '0421 000 111', address: '5 River Rd, Abbotsford VIC 3067', company: 'Anderson Constructions', tags: 'commercial' },
];

const clientIds = clients.map(c => {
  const id = uuid();
  db.prepare('INSERT INTO clients (id, user_id, name, email, phone, address, company, tags, created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(
    id, USER_ID, c.name, c.email, c.phone, c.address, c.company, c.tags, d(28)
  );
  return id;
});

// 3. Quotes
const templates = ['clean-modern', 'bold-trade', 'minimal', 'corporate'];
const quoteData = [
  { ci: 0, desc: 'Install 12x LED downlights in living & kitchen', status: 'accepted', items: [
    { d: 'LED downlight supply (12x Clipsal)', q: 12, u: 'each', p: 45, cat: 'materials' },
    { d: 'Installation labour', q: 4, u: 'hours', p: 95, cat: 'labour' },
    { d: 'Electrical testing & certification', q: 1, u: 'each', p: 150, cat: 'labour' },
  ], daysAgo: 25 },
  { ci: 1, desc: 'Full switchboard upgrade – 3-phase commercial', status: 'accepted', items: [
    { d: 'Switchboard (Clipsal Resi MAX 3-phase)', q: 1, u: 'each', p: 850, cat: 'materials' },
    { d: 'Circuit breakers & RCDs', q: 1, u: 'lot', p: 420, cat: 'materials' },
    { d: 'Installation & wiring labour', q: 8, u: 'hours', p: 110, cat: 'labour' },
    { d: 'Testing, tagging & compliance cert', q: 1, u: 'each', p: 280, cat: 'labour' },
  ], daysAgo: 22 },
  { ci: 2, desc: 'Complete house rewire – 3BR weatherboard', status: 'sent', items: [
    { d: 'Electrical cable (TPS 2.5mm & 1.5mm)', q: 1, u: 'lot', p: 680, cat: 'materials' },
    { d: 'Switches, GPOs & accessories', q: 1, u: 'lot', p: 450, cat: 'materials' },
    { d: 'New switchboard', q: 1, u: 'each', p: 650, cat: 'materials' },
    { d: 'Rewiring labour (2 electricians)', q: 24, u: 'hours', p: 95, cat: 'labour' },
    { d: 'Plaster patching allowance', q: 1, u: 'each', p: 400, cat: 'materials' },
    { d: 'Testing & certification', q: 1, u: 'each', p: 350, cat: 'labour' },
  ], daysAgo: 18 },
  { ci: 3, desc: 'Office fit-out – 20x power points & data', status: 'viewed', items: [
    { d: 'Double GPO supply (20x Clipsal)', q: 20, u: 'each', p: 28, cat: 'materials' },
    { d: 'Data points (Cat6)', q: 20, u: 'each', p: 35, cat: 'materials' },
    { d: 'Cable & conduit', q: 1, u: 'lot', p: 380, cat: 'materials' },
    { d: 'Installation labour', q: 12, u: 'hours', p: 105, cat: 'labour' },
  ], daysAgo: 15 },
  { ci: 4, desc: 'Smoke alarm upgrade to interconnected', status: 'accepted', items: [
    { d: 'Interconnected smoke alarms (6x)', q: 6, u: 'each', p: 65, cat: 'materials' },
    { d: 'Installation & wiring', q: 3, u: 'hours', p: 95, cat: 'labour' },
    { d: 'Compliance certificate', q: 1, u: 'each', p: 80, cat: 'labour' },
  ], daysAgo: 20 },
  { ci: 5, desc: 'Gym lighting upgrade – commercial LED', status: 'draft', items: [
    { d: 'LED panel lights 600x600 (24x)', q: 24, u: 'each', p: 85, cat: 'materials' },
    { d: 'Emergency exit lights (4x)', q: 4, u: 'each', p: 120, cat: 'materials' },
    { d: 'Installation labour', q: 10, u: 'hours', p: 105, cat: 'labour' },
    { d: 'Disposal of old fittings', q: 1, u: 'each', p: 150, cat: 'labour' },
  ], daysAgo: 10 },
  { ci: 6, desc: 'Install 4x ceiling fans with lights', status: 'sent', items: [
    { d: 'Ceiling fan with light kit (4x)', q: 4, u: 'each', p: 189, cat: 'materials' },
    { d: 'Installation labour', q: 4, u: 'hours', p: 95, cat: 'labour' },
    { d: 'Wall controller supply & install', q: 4, u: 'each', p: 45, cat: 'materials' },
  ], daysAgo: 12 },
  { ci: 7, desc: 'Café – new power for commercial kitchen', status: 'accepted', items: [
    { d: '3-phase power run to kitchen', q: 1, u: 'each', p: 650, cat: 'materials' },
    { d: 'Dedicated circuits (oven, dishwasher, coffee machine)', q: 3, u: 'each', p: 280, cat: 'labour' },
    { d: '15A & 20A outlets', q: 6, u: 'each', p: 55, cat: 'materials' },
    { d: 'Electrical labour', q: 8, u: 'hours', p: 110, cat: 'labour' },
    { d: 'Compliance testing', q: 1, u: 'each', p: 250, cat: 'labour' },
  ], daysAgo: 8 },
  { ci: 8, desc: 'EV charger installation – Tesla Wall Connector', status: 'viewed', items: [
    { d: 'Tesla Wall Connector Gen 3', q: 1, u: 'each', p: 850, cat: 'materials' },
    { d: 'Dedicated 32A circuit from switchboard', q: 1, u: 'each', p: 420, cat: 'materials' },
    { d: 'Installation & commissioning', q: 4, u: 'hours', p: 105, cat: 'labour' },
    { d: 'Electrical certification', q: 1, u: 'each', p: 150, cat: 'labour' },
  ], daysAgo: 5 },
  { ci: 9, desc: 'Security lighting – 8x motion sensor floods', status: 'draft', items: [
    { d: 'LED floodlight with sensor (8x)', q: 8, u: 'each', p: 75, cat: 'materials' },
    { d: 'Exterior cable & conduit', q: 1, u: 'lot', p: 220, cat: 'materials' },
    { d: 'Installation labour', q: 6, u: 'hours', p: 95, cat: 'labour' },
  ], daysAgo: 3 },
  { ci: 0, desc: 'Additional power points in garage workshop', status: 'draft', items: [
    { d: 'Double GPO (4x)', q: 4, u: 'each', p: 28, cat: 'materials' },
    { d: '15A outlet for welder', q: 1, u: 'each', p: 45, cat: 'materials' },
    { d: 'Cable & installation', q: 3, u: 'hours', p: 95, cat: 'labour' },
  ], daysAgo: 2 },
  { ci: 2, desc: 'Outdoor entertaining area – lights & GPOs', status: 'sent', items: [
    { d: 'Outdoor festoon lighting circuit', q: 1, u: 'each', p: 180, cat: 'materials' },
    { d: 'Weatherproof GPOs (3x)', q: 3, u: 'each', p: 55, cat: 'materials' },
    { d: 'Garden lighting (6 LED spike lights)', q: 6, u: 'each', p: 45, cat: 'materials' },
    { d: 'Installation labour', q: 5, u: 'hours', p: 95, cat: 'labour' },
  ], daysAgo: 7 },
  { ci: 3, desc: 'Emergency lighting compliance upgrade', status: 'declined', items: [
    { d: 'Emergency exit lights (8x)', q: 8, u: 'each', p: 135, cat: 'materials' },
    { d: 'Emergency testing system', q: 1, u: 'each', p: 450, cat: 'materials' },
    { d: 'Installation labour', q: 8, u: 'hours', p: 110, cat: 'labour' },
    { d: 'Compliance documentation', q: 1, u: 'each', p: 350, cat: 'labour' },
  ], daysAgo: 20 },
  { ci: 5, desc: 'Install 3-phase power for gym equipment', status: 'sent', items: [
    { d: '3-phase cable run (25m)', q: 1, u: 'each', p: 520, cat: 'materials' },
    { d: '3-phase outlets (3x)', q: 3, u: 'each', p: 85, cat: 'materials' },
    { d: 'Switchboard modifications', q: 1, u: 'each', p: 380, cat: 'labour' },
    { d: 'Installation labour', q: 6, u: 'hours', p: 110, cat: 'labour' },
  ], daysAgo: 14 },
  { ci: 8, desc: 'Solar pre-wire for future panels', status: 'viewed', items: [
    { d: 'DC isolator & AC isolator', q: 1, u: 'lot', p: 180, cat: 'materials' },
    { d: 'Cable run roof to switchboard', q: 1, u: 'each', p: 350, cat: 'materials' },
    { d: 'Switchboard space & breaker', q: 1, u: 'each', p: 120, cat: 'materials' },
    { d: 'Installation labour', q: 4, u: 'hours', p: 95, cat: 'labour' },
  ], daysAgo: 6 },
  { ci: 9, desc: 'Site shed temporary power setup', status: 'accepted', items: [
    { d: 'Temporary power board', q: 1, u: 'each', p: 320, cat: 'materials' },
    { d: 'Cable & connections', q: 1, u: 'lot', p: 180, cat: 'materials' },
    { d: 'Installation & testing', q: 3, u: 'hours', p: 105, cat: 'labour' },
  ], daysAgo: 16 },
  { ci: 4, desc: 'Bathroom heat-light-fan units (2x)', status: 'declined', items: [
    { d: '3-in-1 bathroom unit (2x IXL Tastic)', q: 2, u: 'each', p: 289, cat: 'materials' },
    { d: 'Installation labour', q: 3, u: 'hours', p: 95, cat: 'labour' },
    { d: 'Ducting & venting', q: 1, u: 'lot', p: 120, cat: 'materials' },
  ], daysAgo: 23 },
];

const quoteIds = [];
const insertQuote = db.prepare('INSERT INTO quotes (id, user_id, client_name, client_email, client_phone, client_address, trade_type, job_description, status, subtotal, gst, total, validity_days, notes, template, created_at, updated_at, sent_at, viewed_at, accepted_at, declined_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
const insertItem = db.prepare('INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, category, sort_order) VALUES (?,?,?,?,?,?,?,?,?)');
const insertEvent = db.prepare('INSERT INTO quote_events (id, quote_id, event_type, metadata, created_at) VALUES (?,?,?,?,?)');

for (const q of quoteData) {
  const c = clients[q.ci];
  const qid = uuid();
  quoteIds.push({ id: qid, ci: q.ci, status: q.status });
  
  let subtotal = 0;
  q.items.forEach(item => { subtotal += item.q * item.p; });
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + gst;
  const created = d(q.daysAgo);
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  
  let sent_at = null, viewed_at = null, accepted_at = null, declined_at = null;
  if (['sent','viewed','accepted','declined'].includes(q.status)) sent_at = d(q.daysAgo - 1, 14);
  if (['viewed','accepted','declined'].includes(q.status)) viewed_at = d(q.daysAgo - 1, 16);
  if (q.status === 'accepted') accepted_at = d(q.daysAgo - 2, 9);
  if (q.status === 'declined') declined_at = d(q.daysAgo - 2, 11);

  insertQuote.run(qid, USER_ID, c.name, c.email, c.phone, c.address, 'electrician', q.desc, q.status, subtotal, gst, total, 30, '', tmpl, created, created, sent_at, viewed_at, accepted_at, declined_at);

  q.items.forEach((item, idx) => {
    insertItem.run(uuid(), qid, item.d, item.q, item.u, item.p, item.q * item.p, item.cat, idx);
  });

  // Events
  insertEvent.run(uuid(), qid, 'created', null, created);
  if (sent_at) insertEvent.run(uuid(), qid, 'sent', JSON.stringify({ email: c.email }), sent_at);
  if (viewed_at) insertEvent.run(uuid(), qid, 'viewed', null, viewed_at);
  if (accepted_at) insertEvent.run(uuid(), qid, 'accepted', null, accepted_at);
  if (declined_at) insertEvent.run(uuid(), qid, 'declined', null, declined_at);
}

// 4. Jobs
const jobData = [
  { ci: 6, title: 'Ceiling fan install – Rachel Kim', stage: 'lead', value: 1316 },
  { ci: 8, title: 'EV charger – Priya Patel', stage: 'lead', value: 1840 },
  { ci: 3, title: 'Office power points – Mark Thompson', stage: 'quoted', value: 2900 },
  { ci: 5, title: '3-phase gym power – James Wilson', stage: 'quoted', value: 2195 },
  { ci: 0, title: 'LED downlights – Sarah Johnson', stage: 'accepted', value: 920 },
  { ci: 7, title: 'Café kitchen power – Tom O\'Brien', stage: 'accepted', value: 2920 },
  { ci: 1, title: 'Switchboard upgrade – David Chen', stage: 'in_progress', value: 2430 },
  { ci: 4, title: 'Smoke alarms – Lisa Brown', stage: 'in_progress', value: 745 },
  { ci: 9, title: 'Site shed power – Chris Anderson', stage: 'completed', value: 815 },
  { ci: 2, title: 'House rewire – Emma Williams', stage: 'paid', value: 4810 },
];

const jobIds = [];
const insertJob = db.prepare('INSERT INTO jobs (id, user_id, client_id, title, description, stage, value, scheduled_date, created_at) VALUES (?,?,?,?,?,?,?,?,?)');
for (const j of jobData) {
  const jid = uuid();
  jobIds.push(jid);
  const sched = j.stage === 'completed' || j.stage === 'paid' ? dateOffset(-5) : dateOffset(Math.floor(Math.random() * 14));
  insertJob.run(jid, USER_ID, clientIds[j.ci], j.title, '', j.stage, j.value, sched, d(20));
}

// 5. Follow-ups
const insertFollowup = db.prepare('INSERT INTO followups (id, user_id, client_id, title, due_date, completed, notes, created_at) VALUES (?,?,?,?,?,?,?,?)');
// 2 overdue
insertFollowup.run(uuid(), USER_ID, clientIds[2], 'Chase Emma re: rewire quote', dateOffset(-3), 0, 'Sent quote last week, no response', d(10));
insertFollowup.run(uuid(), USER_ID, clientIds[3], 'Follow up Mark on office fit-out', dateOffset(-1), 0, 'He viewed the quote but hasn\'t responded', d(8));
// 3 today
insertFollowup.run(uuid(), USER_ID, clientIds[5], 'Call James about gym lighting quote', today, 0, 'Wants to start next month', d(5));
insertFollowup.run(uuid(), USER_ID, clientIds[8], 'Send Priya EV charger info pack', today, 0, '', d(3));
insertFollowup.run(uuid(), USER_ID, clientIds[6], 'Confirm Rachel\'s ceiling fan models', today, 0, 'She wanted to pick the style', d(4));
// 3 upcoming
insertFollowup.run(uuid(), USER_ID, clientIds[1], 'David Chen – schedule switchboard inspection', dateOffset(2), 0, '', d(6));
insertFollowup.run(uuid(), USER_ID, clientIds[7], 'Tom – confirm café install date', dateOffset(4), 0, 'Needs to be after health inspection', d(3));
insertFollowup.run(uuid(), USER_ID, clientIds[9], 'Chris – quote for phase 2 security lighting', dateOffset(7), 0, '', d(2));

// 6. Timeline entries
const insertTimeline = db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata, created_at) VALUES (?,?,?,?,?,?,?)');
clients.forEach((c, i) => {
  insertTimeline.run(uuid(), clientIds[i], USER_ID, 'note', `Initial contact – ${c.tags === 'commercial' ? 'commercial enquiry' : 'residential job enquiry'}`, null, d(28));
  insertTimeline.run(uuid(), clientIds[i], USER_ID, 'quote', 'Quote created', null, d(20));
  if (i < 5) {
    insertTimeline.run(uuid(), clientIds[i], USER_ID, 'call', 'Discussed job scope and timing', null, d(15));
    insertTimeline.run(uuid(), clientIds[i], USER_ID, 'email', 'Sent quote via email', null, d(14));
  }
});

console.log(`✅ Seed complete!`);
console.log(`   👤 1 demo user (demo@quotecraft.com / demo1234)`);
console.log(`   👥 ${clients.length} clients`);
console.log(`   📄 ${quoteData.length} quotes`);
console.log(`   🔧 ${jobData.length} jobs`);
console.log(`   🔔 8 follow-ups`);
console.log(`   📝 Timeline entries for all clients`);
