// ============================================================
// SK IP Solution — Backend Server
// Stack: Node.js + Express + SQLite (better-sqlite3)
// ============================================================

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Database Setup ───────────────────────────────────────────
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'skipsolution.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ── Create Tables ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    dob         TEXT,
    phone       TEXT,
    email       TEXT,
    address     TEXT,
    policy      TEXT,
    policy_no   TEXT UNIQUE,
    sum_assured TEXT,
    premium     TEXT,
    start_date  TEXT,
    maturity    TEXT,
    frequency   TEXT DEFAULT 'Yearly',
    nominee     TEXT,
    relation    TEXT,
    status      TEXT DEFAULT 'Active',
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime')),
    updated_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT,
    age         INTEGER,
    interest    TEXT,
    stage       TEXT DEFAULT 'new',
    source      TEXT,
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime')),
    updated_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS call_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    call_type   TEXT,
    purpose     TEXT,
    duration    TEXT,
    notes       TEXT,
    followup    TEXT,
    logged_at   TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    client_name TEXT,
    appt_date   TEXT,
    appt_time   TEXT,
    appt_type   TEXT DEFAULT 'meet',
    notes       TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS premiums (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    due_date    TEXT,
    amount      TEXT,
    status      TEXT DEFAULT 'Upcoming',
    paid_on     TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// ── Seed sample data if empty ────────────────────────────────
const count = db.prepare('SELECT COUNT(*) as c FROM clients').get();
if (count.c === 0) {
  const insertClient = db.prepare(`
    INSERT INTO clients (name,dob,phone,email,address,policy,policy_no,sum_assured,premium,start_date,maturity,frequency,nominee,relation,status,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const seedClients = [
    ['Priya Sharma','1985-04-12','9876543210','priya@gmail.com','12 Rose St, Chennai','Jeevan Anand','LIC-4482001','5,00,000','12,000','2017-04-12','2040-04-12','Yearly','Rahul Sharma','Spouse','Active','Long-standing client.'],
    ['Mohan Reddy','1978-09-20','9845123456','mohan.r@yahoo.com','45 MG Road, Hyderabad','New Jeevan Labh','LIC-4490312','10,00,000','18,500','2019-09-20','2038-09-20','Yearly','Lakshmi Reddy','Spouse','Due Soon','Needs reminder before due date.'],
    ['Sunita Patel','1990-01-15','9765432100','sunita.p@gmail.com','7 Gandhi Nagar, Ahmedabad','Jeevan Umang','LIC-4501234','3,00,000','9,600','2020-01-15','2050-01-15','Half-yearly','Rakesh Patel','Spouse','Active',''],
    ['Arjun Singh','1982-07-30','9712345678','arjun.singh@hotmail.com','23 Patel Nagar, Delhi','Tech Term Plan','LIC-4515678','25,00,000','6,200','2021-07-30','2047-07-30','Yearly','Ritu Singh','Spouse','Lapsed','Follow up urgently.'],
    ['Kavitha Nair','1975-12-05','9988776655','kavitha.n@gmail.com','8 Lake View, Kochi','Bima Ratna','LIC-4522890','15,00,000','22,000','2020-12-05','2035-12-05','Quarterly','Suresh Nair','Spouse','Active',''],
    ['Deepak Mehta','1988-03-22','9654321098','deepak.m@gmail.com','101 SV Road, Mumbai','Jeevan Amar','LIC-4534567','50,00,000','14,200','2021-03-22','N/A','Half-yearly','Pooja Mehta','Spouse','Active','High-value client.'],
    ['Anitha Kumar','1993-06-18','9432156789','anitha.k@gmail.com','34 Anna Nagar, Chennai','Jeevan Labh','LIC-4545890','4,00,000','8,800','2022-06-18','2043-06-18','Yearly','Suresh Kumar','Parent','Active',''],
    ['Raj Malhotra','1970-11-08','9310987654','raj.m@gmail.com','55 Sector 17, Chandigarh','Jeevan Tarang','LIC-4556123','20,00,000','31,000','2018-11-08','2030-11-08','Yearly','Meena Malhotra','Spouse','Active','Senior policyholder.'],
  ];
  seedClients.forEach(c => insertClient.run(...c));

  const insertLead = db.prepare(`INSERT INTO leads (name,phone,interest,stage,source,notes) VALUES (?,?,?,?,?,?)`);
  [
    ['Vinay Kapoor','9811223344','Term Plan','new','Referral','Interested in 1 crore cover'],
    ['Meera Joshi','9900112233','Endowment Plan','new','Walk-in',''],
    ['Suresh Babu','9822334455','Child Plan','contact','Referral','2 kids, 7 and 10 yrs'],
    ['Pooja Verma','9733445566','ULIP','contact','Social Media',''],
    ['Ajay Sharma','9644556677','Pension Plan','proposal','Camp','Sent Jeevan Akshay proposal'],
    ['Rekha Menon','9555667788','Money-Back','converted','Referral','Converted to new policy'],
  ].forEach(l => insertLead.run(...l));
}

// ════════════════════════════════════════════════════════════
// CLIENTS API
// ════════════════════════════════════════════════════════════

// GET all clients (with optional search & status filter)
app.get('/api/clients', (req, res) => {
  try {
    const { q, status } = req.query;
    let sql = 'SELECT * FROM clients WHERE 1=1';
    const params = [];
    if (q) { sql += ' AND (name LIKE ? OR phone LIKE ? OR policy_no LIKE ?)'; const w = `%${q}%`; params.push(w,w,w); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC';
    res.json(db.prepare(sql).all(...params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single client
app.get('/api/clients/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  client ? res.json(client) : res.status(404).json({ error: 'Not found' });
});

// POST create client
app.post('/api/clients', (req, res) => {
  try {
    const { name,dob,phone,email,address,policy,sum_assured,premium,start_date,maturity,frequency,nominee,relation,status,notes } = req.body;
    const policyNo = 'LIC-' + Date.now().toString().slice(-7);
    const result = db.prepare(`
      INSERT INTO clients (name,dob,phone,email,address,policy,policy_no,sum_assured,premium,start_date,maturity,frequency,nominee,relation,status,notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(name,dob,phone,email,address,policy,policyNo,sum_assured,premium,start_date,maturity,frequency||'Yearly',nominee,relation,status||'Active',notes);
    res.json({ id: result.lastInsertRowid, policy_no: policyNo, message: 'Client created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update client
app.put('/api/clients/:id', (req, res) => {
  try {
    const { name,dob,phone,email,address,policy,sum_assured,premium,start_date,maturity,frequency,nominee,relation,status,notes } = req.body;
    db.prepare(`
      UPDATE clients SET name=?,dob=?,phone=?,email=?,address=?,policy=?,sum_assured=?,premium=?,
      start_date=?,maturity=?,frequency=?,nominee=?,relation=?,status=?,notes=?,updated_at=datetime('now','localtime')
      WHERE id=?
    `).run(name,dob,phone,email,address,policy,sum_assured,premium,start_date,maturity,frequency,nominee,relation,status,notes,req.params.id);
    res.json({ message: 'Client updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE client
app.delete('/api/clients/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
// LEADS API
// ════════════════════════════════════════════════════════════

app.get('/api/leads', (req, res) => {
  res.json(db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all());
});

app.post('/api/leads', (req, res) => {
  try {
    const { name,phone,age,interest,stage,source,notes } = req.body;
    const result = db.prepare('INSERT INTO leads (name,phone,age,interest,stage,source,notes) VALUES (?,?,?,?,?,?,?)').run(name,phone,age||null,interest,stage||'new',source,notes);
    res.json({ id: result.lastInsertRowid, message: 'Lead created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/leads/:id', (req, res) => {
  try {
    const { name,phone,age,interest,stage,source,notes } = req.body;
    db.prepare(`UPDATE leads SET name=?,phone=?,age=?,interest=?,stage=?,source=?,notes=?,updated_at=datetime('now','localtime') WHERE id=?`)
      .run(name,phone,age||null,interest,stage,source,notes,req.params.id);
    res.json({ message: 'Lead updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/leads/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
// CALL LOGS API
// ════════════════════════════════════════════════════════════

app.get('/api/calls', (req, res) => {
  res.json(db.prepare('SELECT * FROM call_logs ORDER BY logged_at DESC').all());
});

app.post('/api/calls', (req, res) => {
  try {
    const { client_name,call_type,purpose,duration,notes,followup } = req.body;
    const result = db.prepare('INSERT INTO call_logs (client_name,call_type,purpose,duration,notes,followup) VALUES (?,?,?,?,?,?)').run(client_name,call_type,purpose,duration,notes,followup);
    res.json({ id: result.lastInsertRowid, message: 'Call logged' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/calls/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM call_logs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Call log deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
// APPOINTMENTS API
// ════════════════════════════════════════════════════════════

app.get('/api/appointments', (req, res) => {
  res.json(db.prepare('SELECT * FROM appointments ORDER BY appt_date ASC').all());
});

app.post('/api/appointments', (req, res) => {
  try {
    const { title,client_name,appt_date,appt_time,appt_type,notes } = req.body;
    const result = db.prepare('INSERT INTO appointments (title,client_name,appt_date,appt_time,appt_type,notes) VALUES (?,?,?,?,?,?)').run(title,client_name,appt_date,appt_time,appt_type||'meet',notes);
    res.json({ id: result.lastInsertRowid, message: 'Appointment saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
// DASHBOARD STATS API
// ════════════════════════════════════════════════════════════

app.get('/api/stats', (req, res) => {
  try {
    const total_clients     = db.prepare("SELECT COUNT(*) as c FROM clients").get().c;
    const active_policies   = db.prepare("SELECT COUNT(*) as c FROM clients WHERE status='Active'").get().c;
    const due_premiums      = db.prepare("SELECT COUNT(*) as c FROM clients WHERE status='Due Soon'").get().c;
    const lapsed            = db.prepare("SELECT COUNT(*) as c FROM clients WHERE status='Lapsed'").get().c;
    const total_leads       = db.prepare("SELECT COUNT(*) as c FROM leads").get().c;
    const converted_leads   = db.prepare("SELECT COUNT(*) as c FROM leads WHERE stage='converted'").get().c;
    const upcoming_bdays    = db.prepare(`
      SELECT name, dob, phone FROM clients
      WHERE dob IS NOT NULL AND dob != ''
      ORDER BY strftime('%m-%d', dob) ASC LIMIT 5
    `).all();
    res.json({ total_clients, active_policies, due_premiums, lapsed, total_leads, converted_leads, upcoming_bdays });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Serve frontend for all other routes ──────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SK IP Solution running at http://localhost:${PORT}`);
  console.log(`📦 Database: ${path.join(__dirname, 'db', 'skipsolution.db')}`);
  console.log(`🌐 Press Ctrl+C to stop\n`);
});
