'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'rsvp.db');

// --- Database setup ---
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS rsvp_responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT,
    attending   INTEGER NOT NULL,
    num_guests  INTEGER NOT NULL DEFAULT 1,
    message     TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Prepared statements
const insertRsvp = db.prepare(
  `INSERT INTO rsvp_responses (name, phone, attending, num_guests, message)
   VALUES (@name, @phone, @attending, @num_guests, @message)`
);

const getAllRsvp = db.prepare(
  `SELECT id, name, phone,
          CASE WHEN attending = 1 THEN 'Attending' ELSE 'Not Attending' END AS status,
          num_guests, message, created_at
   FROM rsvp_responses
   ORDER BY created_at DESC`
);

// --- Middleware ---
app.use(express.json());

// Rate limiter: max 100 requests per 15 minutes per IP for general routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for RSVP submissions: max 10 per 15 minutes per IP
const rsvpSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many RSVP submissions. Please try again later.' },
});

app.use(generalLimiter);
app.use(express.static(path.join(__dirname)));

// --- Routes ---

// POST /api/rsvp – submit an RSVP response
app.post('/api/rsvp', rsvpSubmitLimiter, (req, res) => {
  const { name, phone, attending, num_guests, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (attending === undefined || attending === null) {
    return res.status(400).json({ error: 'Attending status is required.' });
  }

  const guests = attending
    ? (Number.isInteger(Number(num_guests)) ? Math.max(1, Number(num_guests)) : 1)
    : 0;

  try {
    const info = insertRsvp.run({
      name: name.trim().slice(0, 200),
      phone: phone ? String(phone).trim().slice(0, 30) : null,
      attending: attending ? 1 : 0,
      num_guests: guests,
      message: message ? String(message).trim().slice(0, 500) : null,
    });

    return res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('DB insert error:', err.message);
    return res.status(500).json({ error: 'Could not save your response. Please try again.' });
  }
});

// GET /api/rsvp – list all RSVP responses (admin view, requires ADMIN_TOKEN)
app.get('/api/rsvp', (req, res) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.query.token;
    if (token !== adminToken) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
  }
  try {
    const rows = getAllRsvp.all();
    return res.json(rows);
  } catch (err) {
    console.error('DB read error:', err.message);
    return res.status(500).json({ error: 'Could not fetch responses.' });
  }
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RSVP server running at http://localhost:${PORT}`);
  console.log(`Database stored at: ${DB_PATH}`);
});
