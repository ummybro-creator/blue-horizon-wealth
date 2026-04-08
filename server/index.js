import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool, types } = pg;

// Parse DECIMAL/NUMERIC columns as JS numbers (pg returns them as strings by default)
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));
// Parse INT8/BIGINT as JS numbers
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.SESSION_SECRET || 'veltrix-jwt-secret-2024';

// ─── DATABASE ───────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch { req.user = null; }
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.role?.includes('admin')) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ─── SCHEMA INIT ─────────────────────────────────────────────────────────────
async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        phone_number TEXT UNIQUE NOT NULL,
        full_name TEXT,
        is_blocked BOOLEAN DEFAULT false,
        referral_code TEXT UNIQUE,
        referred_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_balance DECIMAL(12,2) DEFAULT 0,
        recharge_balance DECIMAL(12,2) DEFAULT 0,
        bonus_balance DECIMAL(12,2) DEFAULT 0,
        total_income DECIMAL(12,2) DEFAULT 0,
        withdrawable_balance DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'user',
        UNIQUE (user_id, role)
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        image_url TEXT,
        price DECIMAL(12,2) NOT NULL,
        daily_income DECIMAL(12,2) NOT NULL,
        total_income DECIMAL(12,2) NOT NULL,
        duration_days INTEGER NOT NULL,
        category TEXT DEFAULT 'daily',
        is_enabled BOOLEAN DEFAULT true,
        is_special_offer BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        invested_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        invested_at TIMESTAMPTZ DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL,
        total_earned DECIMAL(12,2) DEFAULT 0,
        status TEXT DEFAULT 'active',
        last_credited_at DATE
      );

      CREATE TABLE IF NOT EXISTS recharges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        utr_number TEXT,
        status TEXT DEFAULT 'pending',
        timer_started_at TIMESTAMPTZ,
        requested_at TIMESTAMPTZ DEFAULT now(),
        processed_at TIMESTAMPTZ,
        processed_by UUID REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        requested_at TIMESTAMPTZ DEFAULT now(),
        processed_at TIMESTAMPTZ,
        processed_by UUID REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS bank_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_holder_name TEXT,
        bank_name TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        upi_id TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS daily_checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        checked_in_at DATE DEFAULT CURRENT_DATE,
        bonus_amount DECIMAL(12,2) NOT NULL,
        UNIQUE (user_id, checked_in_at)
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        app_name TEXT DEFAULT 'Veltrix',
        app_logo_url TEXT,
        payment_upi_id TEXT DEFAULT 'veltrix@upi',
        payment_qr_code_url TEXT,
        support_whatsapp TEXT,
        support_email TEXT,
        support_phone TEXT,
        telegram_group_link TEXT,
        checkin_bonus_amount DECIMAL(12,2) DEFAULT 12,
        minimum_withdrawal DECIMAL(12,2) DEFAULT 500,
        minimum_recharge DECIMAL(12,2) DEFAULT 100,
        maximum_withdrawal DECIMAL(12,2) DEFAULT 10000,
        withdraw_charge_percent DECIMAL(5,2) DEFAULT 0,
        withdraw_delay_hours INTEGER DEFAULT 0,
        signup_bonus DECIMAL(12,2) DEFAULT 0,
        deposit_bonus_percent DECIMAL(5,2) DEFAULT 0,
        referral_enabled BOOLEAN DEFAULT true,
        level1_commission DECIMAL(5,2) DEFAULT 13,
        level2_commission DECIMAL(5,2) DEFAULT 5,
        level3_commission DECIMAL(5,2) DEFAULT 2,
        withdraw_enabled BOOLEAN DEFAULT true,
        recharge_enabled BOOLEAN DEFAULT true,
        earnings_paused BOOLEAN DEFAULT false,
        roi_multiplier DECIMAL(5,2) DEFAULT 1,
        global_earning_cap DECIMAL(12,2) DEFAULT 0,
        per_user_earning_limit DECIMAL(12,2) DEFAULT 0,
        referral_deposit_bonus_enabled BOOLEAN DEFAULT true,
        withdrawal_deposit_multiplier INTEGER DEFAULT 3,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS sliders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        title TEXT,
        link_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        admin_reply TEXT,
        replied_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id UUID,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS transaction_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        balance_after DECIMAL(12,2) DEFAULT 0,
        reference_id UUID,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        last_login_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS referral_deposit_bonuses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        deposit_number INTEGER NOT NULL,
        bonus_amount DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (referrer_id, referred_id, deposit_number)
      );
    `);
    console.log('✅ Database schema ready');
  } catch (err) {
    console.error('Schema init error:', err.message);
  } finally {
    client.release();
  }
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
async function seedData() {
  const client = await pool.connect();
  try {
    const { rows: settings } = await client.query('SELECT id FROM app_settings LIMIT 1');
    if (settings.length === 0) {
      await client.query(`INSERT INTO app_settings (app_name, payment_upi_id, support_whatsapp, support_email, support_phone, telegram_group_link)
        VALUES ('Veltrix', 'veltrix@upi', '+91 9876543210', 'support@veltrix.com', '+91 9876543210', 'https://t.me/veltrix')`);
    }

    const { rows: products } = await client.query('SELECT id FROM products LIMIT 1');
    if (products.length === 0) {
      await client.query(`INSERT INTO products (name, image_url, price, daily_income, total_income, duration_days, category, is_special_offer, description) VALUES
        ('Ashirvaad Atta 10kg', '/placeholder.svg', 500, 20, 400, 20, 'daily', false, 'Premium quality wheat flour'),
        ('Fortune Rice Bran Oil 5L', '/placeholder.svg', 1000, 40, 1200, 30, 'daily', true, 'Heart-healthy cooking oil'),
        ('Tata Salt 1kg', '/placeholder.svg', 2000, 80, 2400, 30, 'daily', false, 'Iodized salt for daily use'),
        ('Aashirvaad Multigrain Atta 5kg', '/placeholder.svg', 5000, 200, 6000, 30, 'vip', true, 'Healthy multigrain flour'),
        ('Fortune Sunflower Oil 15L', '/placeholder.svg', 10000, 400, 16000, 40, 'vip', false, 'Bulk cooking oil for commercial use'),
        ('Daawat Basmati Rice 25kg', '/placeholder.svg', 25000, 1000, 40000, 40, 'vip', true, 'Premium basmati rice')`);
    }

    // Create admin user
    const adminEmail = 'ummybro@gmail.com';
    const { rows: adminRows } = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (adminRows.length === 0) {
      const hash = await bcrypt.hash('mamuda@2023', 12);
      const { rows: [admin] } = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', [adminEmail, hash]);
      const refCode = 'ADMIN0001';
      await client.query('INSERT INTO profiles (id, phone_number, full_name, referral_code) VALUES ($1, $2, $3, $4)',
        [admin.id, 'admin@veltrix', 'Super Admin', refCode]);
      await client.query('INSERT INTO wallets (user_id) VALUES ($1)', [admin.id]);
      await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1,'user'),($1,'admin')", [admin.id]);
      console.log('✅ Admin created: ummybro@gmail.com / mamuda@2023');
    }
    console.log('✅ Seed data ready');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    client.release();
  }
}

// ─── FILTER PARSER ───────────────────────────────────────────────────────────
function parseFilters(filterArr, orStr) {
  const conditions = [];
  const values = [];
  let idx = 1;

  for (const f of (filterArr || [])) {
    if (!f) continue;
    const firstColon = f.indexOf(':');
    if (firstColon === -1) continue;
    const op = f.substring(0, firstColon);
    const rest = f.substring(firstColon + 1);
    const secondColon = rest.indexOf(':');
    if (secondColon === -1) continue;
    const field = rest.substring(0, secondColon).replace(/[^a-zA-Z0-9_.]/g, '');
    const value = rest.substring(secondColon + 1);

    switch (op) {
      case 'eq':
        if (value === 'null') { conditions.push(`"${field}" IS NULL`); }
        else { conditions.push(`"${field}" = $${idx++}`); values.push(value); }
        break;
      case 'neq':
        conditions.push(`"${field}" != $${idx++}`); values.push(value); break;
      case 'in': {
        let arr; try { arr = JSON.parse(value); } catch { arr = [value]; }
        if (arr.length === 0) { conditions.push('false'); break; }
        const ph = arr.map(() => `$${idx++}`).join(', ');
        conditions.push(`"${field}" IN (${ph})`); values.push(...arr); break;
      }
      case 'gte': conditions.push(`"${field}" >= $${idx++}`); values.push(value); break;
      case 'lte': conditions.push(`"${field}" <= $${idx++}`); values.push(value); break;
      case 'gt': conditions.push(`"${field}" > $${idx++}`); values.push(value); break;
      case 'lt': conditions.push(`"${field}" < $${idx++}`); values.push(value); break;
      case 'ilike': conditions.push(`"${field}" ILIKE $${idx++}`); values.push(value); break;
      case 'is':
        if (value === 'null') conditions.push(`"${field}" IS NULL`);
        else conditions.push(`"${field}" IS NOT NULL`);
        break;
    }
  }

  // Parse Supabase OR syntax: "field.op.value,field.op.value"
  if (orStr) {
    const orParts = [];
    for (const cond of orStr.split(',')) {
      const dotParts = cond.trim().split('.');
      if (dotParts.length < 2) continue;
      const field = dotParts[0].replace(/[^a-zA-Z0-9_]/g, '');
      const op = dotParts[1];
      const val = dotParts.slice(2).join('.');
      if (op === 'is' && val === 'null') { orParts.push(`"${field}" IS NULL`); }
      else if (op === 'eq') { values.push(val); orParts.push(`"${field}" = $${idx++}`); }
      else if (op === 'neq') { values.push(val); orParts.push(`"${field}" != $${idx++}`); }
    }
    if (orParts.length > 0) conditions.push(`(${orParts.join(' OR ')})`);
  }

  return { conditions, values };
}

// ─── ALLOWED TABLES & PERMISSIONS ────────────────────────────────────────────
const ALLOWED_TABLES = new Set([
  'profiles', 'wallets', 'user_roles', 'products', 'investments', 'recharges',
  'withdrawals', 'bank_details', 'daily_checkins', 'referrals', 'app_settings',
  'sliders', 'notifications', 'support_tickets', 'admin_logs', 'transaction_ledger',
  'user_devices', 'referral_deposit_bonuses',
]);
const PUBLIC_READ = new Set(['products', 'app_settings', 'sliders']);
const USER_SCOPED = { profiles: 'id', wallets: 'user_id', investments: 'user_id',
  recharges: 'user_id', withdrawals: 'user_id', bank_details: 'user_id',
  daily_checkins: 'user_id', transaction_ledger: 'user_id', support_tickets: 'user_id',
  user_devices: 'user_id' };

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, options } = req.body;
  const meta = options?.data || {};
  const phoneNumber = email.replace('@app.local', '');
  const client = await pool.connect();
  try {
    const { rows: ex } = await client.query('SELECT id FROM users WHERE email=$1', [email]);
    if (ex.length > 0) return res.status(400).json({ error: 'User already registered' });

    const { rows: exPhone } = await client.query('SELECT id FROM profiles WHERE phone_number=$1', [phoneNumber]);
    if (exPhone.length > 0) return res.status(400).json({ error: 'Phone number already registered' });

    const hash = await bcrypt.hash(password, 12);
    const refCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    let referrerId = null;
    if (meta.referral_code) {
      const { rows: ref } = await client.query('SELECT id FROM profiles WHERE referral_code=$1', [meta.referral_code]);
      if (ref.length > 0) referrerId = ref[0].id;
    }

    const { rows: [user] } = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id,email,created_at', [email, hash]);
    await client.query('INSERT INTO profiles (id, phone_number, full_name, referral_code, referred_by) VALUES ($1,$2,$3,$4,$5)',
      [user.id, phoneNumber, meta.full_name || '', refCode, referrerId]);
    await client.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);
    await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1,'user')", [user.id]);

    if (referrerId) {
      await client.query('INSERT INTO referrals (referrer_id, referred_id, level) VALUES ($1,$2,1) ON CONFLICT DO NOTHING',
        [referrerId, user.id]);
      const { rows: l2 } = await client.query('SELECT referred_by FROM profiles WHERE id=$1 AND referred_by IS NOT NULL', [referrerId]);
      if (l2[0]?.referred_by) {
        await client.query('INSERT INTO referrals (referrer_id, referred_id, level) VALUES ($1,$2,2) ON CONFLICT DO NOTHING',
          [l2[0].referred_by, user.id]);
        const { rows: l3 } = await client.query('SELECT referred_by FROM profiles WHERE id=$1 AND referred_by IS NOT NULL', [l2[0].referred_by]);
        if (l3[0]?.referred_by) {
          await client.query('INSERT INTO referrals (referrer_id, referred_id, level) VALUES ($1,$2,3) ON CONFLICT DO NOTHING',
            [l3[0].referred_by, user.id]);
        }
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
    const userObj = { id: user.id, email: user.email, created_at: user.created_at, user_metadata: meta };
    res.json({ data: { user: userObj, session: { access_token: token, user: userObj } }, error: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id,email,password_hash,created_at FROM users WHERE email=$1', [email]);
    if (!rows[0]) return res.status(400).json({ error: 'Invalid login credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid login credentials' });

    const { rows: prof } = await client.query('SELECT is_blocked, full_name FROM profiles WHERE id=$1', [user.id]);
    if (prof[0]?.is_blocked) return res.status(403).json({ error: 'Account is blocked' });

    const { rows: roles } = await client.query('SELECT role FROM user_roles WHERE user_id=$1', [user.id]);
    const role = roles.map(r => r.role).join(',');
    const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: '30d' });
    const userObj = { id: user.id, email: user.email, created_at: user.created_at, user_metadata: { full_name: prof[0]?.full_name || '' } };
    res.json({ data: { user: userObj, session: { access_token: token, user: userObj } }, error: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.post('/api/auth/signout', (req, res) => res.json({ error: null }));

app.get('/api/auth/session', auth, async (req, res) => {
  if (!req.user) return res.json({ data: { session: null }, error: null });
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id,email,created_at FROM users WHERE id=$1', [req.user.id]);
    if (!rows[0]) return res.json({ data: { session: null }, error: null });
    const user = rows[0];
    const { rows: prof } = await client.query('SELECT full_name FROM profiles WHERE id=$1', [user.id]);
    const { rows: roles } = await client.query('SELECT role FROM user_roles WHERE user_id=$1', [user.id]);
    const role = roles.map(r => r.role).join(',');
    const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: '30d' });
    const userObj = { id: user.id, email: user.email, created_at: user.created_at, user_metadata: { full_name: prof[0]?.full_name || '' } };
    res.json({ data: { session: { access_token: token, user: userObj } }, error: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.get('/api/auth/user', auth, async (req, res) => {
  if (!req.user) return res.json({ data: { user: null }, error: null });
  const { rows } = await pool.query('SELECT id,email,created_at FROM users WHERE id=$1', [req.user.id]);
  if (!rows[0]) return res.json({ data: { user: null }, error: null });
  res.json({ data: { user: { id: rows[0].id, email: rows[0].email, created_at: rows[0].created_at } }, error: null });
});

// ─── GENERIC TABLE CRUD ───────────────────────────────────────────────────────
app.get('/api/data/:table', auth, async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(404).json({ error: 'Not found' });
  if (!PUBLIC_READ.has(table) && !req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { select = '*', filter, or, order, limit, single, maybeSingle } = req.query;
  const isAdmin = req.user?.role?.includes('admin');
  const client = await pool.connect();
  try {
    const filterArr = Array.isArray(filter) ? filter : (filter ? [filter] : []);
    let { conditions, values } = parseFilters(filterArr, or);

    // Enforce user scoping for non-admins
    if (!isAdmin && req.user && USER_SCOPED[table]) {
      const scopeField = USER_SCOPED[table];
      const alreadyScoped = filterArr.some(f => f.includes(`:${scopeField}:`));
      if (!alreadyScoped) { conditions.push(`"${scopeField}" = $${values.length + 1}`); values.push(req.user.id); }
    }

    // Public visibility rules
    if (table === 'products' && !isAdmin) conditions.push('is_enabled = true');
    if (table === 'sliders' && !isAdmin) conditions.push('is_active = true');
    if (table === 'admin_logs' && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    let sql = `SELECT * FROM ${table}`;
    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;

    if (order) {
      const [f, d] = order.split(':');
      const sf = f.replace(/[^a-zA-Z0-9_]/g, '');
      sql += ` ORDER BY "${sf}" ${d === 'desc' ? 'DESC' : 'ASC'}`;
    }
    if (limit) sql += ` LIMIT ${Math.min(parseInt(limit), 1000)}`;

    const result = await client.query(sql, values);
    if (single === 'true') {
      if (!result.rows[0]) return res.status(404).json({ error: 'Row not found' });
      return res.json({ data: result.rows[0] });
    }
    if (maybeSingle === 'true') return res.json({ data: result.rows[0] || null });
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.post('/api/data/:table', auth, requireAuth, async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(404).json({ error: 'Not found' });
  const { data, type, onConflict, returning, columns, single, filter } = req.body;
  const isAdmin = req.user?.role?.includes('admin');
  const client = await pool.connect();

  try {
    if (type === 'upsert') {
      const keys = Object.keys(data);
      const vals = keys.map((k, i) => `$${i + 1}`);
      const updates = keys.map(k => `"${k}" = EXCLUDED."${k}"`);
      const sql = `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (${onConflict || 'id'}) DO UPDATE SET ${updates.join(',')} RETURNING *`;
      const result = await client.query(sql, keys.map(k => data[k]));
      return res.json({ data: single ? result.rows[0] : result.rows });
    }

    const keys = Object.keys(data);
    const vals = keys.map((k, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
    const result = await client.query(sql, keys.map(k => data[k]));
    res.json({ data: single ? result.rows[0] : result.rows });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: err.message, code: '23505' });
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

app.patch('/api/data/:table', auth, requireAuth, async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(404).json({ error: 'Not found' });
  const { data, filters, single } = req.body;
  const { filter } = req.query;
  const client = await pool.connect();
  try {
    const filterArr = filters || (Array.isArray(filter) ? filter : (filter ? [filter] : []));
    const { conditions, values } = parseFilters(filterArr, null);

    const keys = Object.keys(data);
    const idx = values.length;
    const setClauses = keys.map((k, i) => `"${k}" = $${idx + i + 1}`);
    const allValues = [...values, ...keys.map(k => data[k])];

    let sql = `UPDATE ${table} SET ${setClauses.join(',')}`;
    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ' RETURNING *';

    const result = await client.query(sql, allValues);
    res.json({ data: single ? result.rows[0] : result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/data/:table', auth, requireAuth, async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(404).json({ error: 'Not found' });
  const { filter } = req.query;
  const filterArr = Array.isArray(filter) ? filter : (filter ? [filter] : []);
  const { conditions, values } = parseFilters(filterArr, null);
  let sql = `DELETE FROM ${table}`;
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' RETURNING *';
  try {
    const result = await pool.query(sql, values);
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── RPC HANDLERS ─────────────────────────────────────────────────────────────
app.post('/api/rpc/:fn', auth, requireAuth, async (req, res) => {
  const { fn } = req.params;
  const params = req.body || {};
  const isAdmin = req.user?.role?.includes('admin');
  const client = await pool.connect();

  try {
    switch (fn) {

      case 'get_dashboard_stats': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const [users, active, deposits, withdraws, pendingR, pendingW, investments, bonus, income] = await Promise.all([
          client.query('SELECT COUNT(*) FROM profiles'),
          client.query("SELECT COUNT(DISTINCT user_id) FROM investments WHERE status='active'"),
          client.query("SELECT COALESCE(SUM(amount),0) FROM recharges WHERE status='approved'"),
          client.query("SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status='approved'"),
          client.query("SELECT COUNT(*) FROM recharges WHERE status='pending'"),
          client.query("SELECT COUNT(*) FROM withdrawals WHERE status='pending'"),
          client.query("SELECT COUNT(*) FROM investments WHERE status='active'"),
          client.query('SELECT COALESCE(SUM(bonus_balance),0) FROM wallets'),
          client.query('SELECT COALESCE(SUM(total_income),0) FROM wallets'),
        ]);
        return res.json({
          total_users: parseInt(users.rows[0].count),
          active_users: parseInt(active.rows[0].count),
          total_deposits: parseFloat(deposits.rows[0].coalesce),
          total_withdrawals: parseFloat(withdraws.rows[0].coalesce),
          pending_recharges: parseInt(pendingR.rows[0].count),
          pending_withdrawals: parseInt(pendingW.rows[0].count),
          active_investments: parseInt(investments.rows[0].count),
          total_bonus_given: parseFloat(bonus.rows[0].coalesce),
          total_commission_given: parseFloat(income.rows[0].coalesce),
          profit: parseFloat(deposits.rows[0].coalesce) - parseFloat(withdraws.rows[0].coalesce),
        });
      }

      case 'get_revenue_chart': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const days = params.p_days || 30;
        const result = await client.query(`
          SELECT d::date as log_date,
            COALESCE(r.total, 0) as recharge_amount,
            COALESCE(w.total, 0) as withdraw_amount,
            COALESCE(r.total, 0) - COALESCE(w.total, 0) as profit_amount
          FROM generate_series(CURRENT_DATE - ($1 || ' days')::interval, CURRENT_DATE, '1 day') d
          LEFT JOIN (SELECT requested_at::date dt, SUM(amount) total FROM recharges WHERE status='approved' GROUP BY dt) r ON r.dt = d::date
          LEFT JOIN (SELECT requested_at::date dt, SUM(amount) total FROM withdrawals WHERE status='approved' GROUP BY dt) w ON w.dt = d::date
          ORDER BY d`, [days]);
        return res.json(result.rows);
      }

      case 'approve_recharge': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_recharge_id, p_admin_id } = params;
        const { rows: rc } = await client.query("SELECT * FROM recharges WHERE id=$1 AND status='pending'", [p_recharge_id]);
        if (!rc[0]) return res.status(400).json({ error: 'Recharge not found or already processed' });
        const { user_id, amount } = rc[0];
        const { rows: stRow } = await client.query('SELECT * FROM app_settings LIMIT 1');
        const st = stRow[0] || {};

        await client.query("UPDATE recharges SET status='approved', processed_at=now(), processed_by=$1 WHERE id=$2", [p_admin_id, p_recharge_id]);
        await client.query(`UPDATE wallets SET recharge_balance=recharge_balance+$1, total_balance=total_balance+$1, withdrawable_balance=withdrawable_balance+$1, updated_at=now() WHERE user_id=$2`, [amount, user_id]);

        // Referral commissions
        if (st.referral_enabled !== false) {
          const { rows: refs } = await client.query('SELECT referrer_id, level FROM referrals WHERE referred_id=$1', [user_id]);
          for (const ref of refs) {
            const rates = [0, st.level1_commission || 13, st.level2_commission || 5, st.level3_commission || 2];
            const commission = (amount * (rates[ref.level] || 0)) / 100;
            if (commission > 0) {
              await client.query(`UPDATE wallets SET total_income=total_income+$1, total_balance=total_balance+$1, withdrawable_balance=withdrawable_balance+$1, updated_at=now() WHERE user_id=$2`, [commission, ref.referrer_id]);
            }
          }
        }
        await client.query('INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
          [p_admin_id, 'approve_recharge', 'recharge', p_recharge_id, JSON.stringify({ amount, user_id })]);
        return res.json({ success: true });
      }

      case 'reject_recharge': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_recharge_id, p_admin_id } = params;
        await client.query("UPDATE recharges SET status='rejected', processed_at=now(), processed_by=$1 WHERE id=$2 AND status='pending'", [p_admin_id, p_recharge_id]);
        return res.json({ success: true });
      }

      case 'approve_withdrawal': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_withdrawal_id, p_admin_id } = params;
        await client.query("UPDATE withdrawals SET status='approved', processed_at=now(), processed_by=$1 WHERE id=$2 AND status='pending'", [p_admin_id, p_withdrawal_id]);
        await client.query('INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES ($1,$2,$3,$4)',
          [p_admin_id, 'approve_withdrawal', 'withdrawal', p_withdrawal_id]);
        return res.json({ success: true });
      }

      case 'reject_withdrawal': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_withdrawal_id, p_admin_id } = params;
        const { rows: wd } = await client.query("SELECT * FROM withdrawals WHERE id=$1 AND status='pending'", [p_withdrawal_id]);
        if (!wd[0]) return res.status(400).json({ error: 'Not found' });
        await client.query("UPDATE withdrawals SET status='rejected', processed_at=now(), processed_by=$1 WHERE id=$2", [p_admin_id, p_withdrawal_id]);
        await client.query(`UPDATE wallets SET total_balance=total_balance+$1, withdrawable_balance=withdrawable_balance+$1, updated_at=now() WHERE user_id=$2`, [wd[0].amount, wd[0].user_id]);
        return res.json({ success: true });
      }

      case 'adjust_wallet': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_admin_id, p_user_id, p_amount, p_reason } = params;
        await client.query(`UPDATE wallets SET total_balance=GREATEST(0,total_balance+$1), withdrawable_balance=GREATEST(0,withdrawable_balance+$1), updated_at=now() WHERE user_id=$2`, [p_amount, p_user_id]);
        await client.query('INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
          [p_admin_id, 'wallet_adjustment', 'user', p_user_id, JSON.stringify({ amount: p_amount, reason: p_reason })]);
        return res.json({ success: true });
      }

      case 'add_bonus': {
        const { p_user_id, p_amount } = params;
        await client.query(`UPDATE wallets SET bonus_balance=bonus_balance+$1, total_balance=total_balance+$1, updated_at=now() WHERE user_id=$2`, [p_amount, p_user_id]);
        return res.json(true);
      }

      case 'create_investment': {
        const { p_user_id, p_product_id } = params;
        const { rows: prod } = await client.query('SELECT * FROM products WHERE id=$1 AND is_enabled=true', [p_product_id]);
        if (!prod[0]) return res.status(400).json({ error: 'Product not found or disabled' });
        const { rows: wal } = await client.query('SELECT total_balance FROM wallets WHERE user_id=$1', [p_user_id]);
        if (!wal[0] || wal[0].total_balance < prod[0].price) return res.status(400).json({ error: 'Insufficient balance' });

        await client.query(`UPDATE wallets SET total_balance=total_balance-$1, recharge_balance=GREATEST(0,recharge_balance-$1), withdrawable_balance=GREATEST(0,withdrawable_balance-$1), updated_at=now() WHERE user_id=$2`, [prod[0].price, p_user_id]);
        const expiresAt = new Date(Date.now() + prod[0].duration_days * 86400000).toISOString();
        const { rows: [inv] } = await client.query(
          'INSERT INTO investments (user_id,product_id,invested_amount,expires_at,status,total_earned) VALUES ($1,$2,$3,$4,$5,0) RETURNING id',
          [p_user_id, p_product_id, prod[0].price, expiresAt, 'active']);
        return res.json(inv.id);
      }

      case 'credit_daily_income':
      case 'credit_all_daily_income': {
        const userId = params.p_user_id;
        const today = new Date().toISOString().split('T')[0];
        const { rows: invs } = await client.query(
          `SELECT i.*, p.daily_income FROM investments i JOIN products p ON i.product_id=p.id WHERE i.user_id=$1 AND i.status='active' AND i.expires_at>now() AND (i.last_credited_at IS NULL OR i.last_credited_at<$2)`,
          [userId, today]);
        let count = 0;
        for (const inv of invs) {
          await client.query(`UPDATE wallets SET total_income=total_income+$1, total_balance=total_balance+$1, withdrawable_balance=withdrawable_balance+$1, updated_at=now() WHERE user_id=$2`, [inv.daily_income, userId]);
          await client.query('UPDATE investments SET total_earned=total_earned+$1, last_credited_at=$2 WHERE id=$3', [inv.daily_income, today, inv.id]);
          count++;
        }
        return res.json(count);
      }

      case 'create_withdrawal_with_deduction': {
        const { p_user_id, p_amount } = params;
        const { rows: wal } = await client.query('SELECT total_balance FROM wallets WHERE user_id=$1', [p_user_id]);
        if (!wal[0] || wal[0].total_balance < p_amount) return res.status(400).json({ error: 'Insufficient balance' });
        const { rows: [wd] } = await client.query('INSERT INTO withdrawals (user_id,amount,status) VALUES ($1,$2,$3) RETURNING id', [p_user_id, p_amount, 'pending']);
        await client.query(`UPDATE wallets SET total_balance=total_balance-$1, withdrawable_balance=GREATEST(0,withdrawable_balance-$1), updated_at=now() WHERE user_id=$2`, [p_amount, p_user_id]);
        return res.json(wd.id);
      }

      case 'log_admin_action': {
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        const { p_admin_id, p_action, p_details } = params;
        await client.query('INSERT INTO admin_logs (admin_id, action, details) VALUES ($1,$2,$3)', [p_admin_id, p_action, JSON.stringify(p_details || {})]);
        return res.json(null);
      }

      default:
        return res.status(400).json({ error: `Unknown RPC function: ${fn}` });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── START ────────────────────────────────────────────────────────────────────
async function start() {
  await initSchema();
  await seedData();
  app.listen(PORT, () => console.log(`🚀 API server running on port ${PORT}`));
}

start().catch(err => { console.error('Fatal:', err); process.exit(1); });
