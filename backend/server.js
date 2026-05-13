const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ─── DB CONFIG ───────────────────────────────────────────────────────────────
// Update these credentials to match your MySQL setup
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1205',
  database: 'student_hub_demo',
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

async function initDB() {
  try {
    // Connect without database first to create it if needed
    const tempConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });

    await tempConn.execute(`CREATE DATABASE IF NOT EXISTS student_hub_demo`);
    await tempConn.end();

    pool = mysql.createPool(DB_CONFIG);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL,
        skills TEXT DEFAULT ''
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(50) DEFAULT 'General',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed sample data if empty
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      await pool.execute(`
        INSERT INTO users (name, username, password, role, skills) VALUES
        ('Arun Kumar', 'student1', '1234', 'student', 'Python, Machine Learning, React'),
        ('Priya Sharma', 'student2', '1234', 'student', 'Java, Spring Boot, MySQL'),
        ('Karthik Raj', 'student3', '1234', 'student', 'Node.js, MongoDB, Docker'),
        ('Admin', 'admin1', '1234', 'admin', ''),
        ('HR Recruiter', 'hr1', '1234', 'recruiter', '')
      `);

      const [users] = await pool.execute("SELECT id FROM users WHERE role='student'");
      const studentIds = users.map(u => u.id);

      const sampleAchievements = [
        [studentIds[0], 'Won Hackathon 2024', 'First place at State Level Hackathon', 'Competition', 'verified'],
        [studentIds[0], 'Published Research Paper', 'ML paper published in IEEE journal', 'Academic', 'verified'],
        [studentIds[0], 'AWS Certified Developer', 'Passed AWS Developer Associate exam', 'Certification', 'pending'],
        [studentIds[1], 'Google Summer of Code', 'Selected for GSoC 2024 with Apache', 'Open Source', 'verified'],
        [studentIds[1], 'Built College App', 'Developed attendance tracking app used by 500+ students', 'Project', 'pending'],
        [studentIds[2], 'Internship at Infosys', 'Completed 6-month internship', 'Internship', 'verified'],
        [studentIds[2], 'Top 100 LeetCode India', 'Ranked in top 100 on LeetCode India leaderboard', 'Competition', 'pending'],
      ];

      for (const ach of sampleAchievements) {
        await pool.execute(
          'INSERT INTO achievements (user_id, title, description, category, status) VALUES (?, ?, ?, ?, ?)',
          ach
        );
      }
    }

    console.log('✅ Database ready: student_hub_demo');
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
    console.log('⚠️  Running in DEMO mode (in-memory data)');
    pool = null;
  }
}

// ─── IN-MEMORY FALLBACK DATA ─────────────────────────────────────────────────
const demoUsers = [
  { id: 1, name: 'Arun Kumar', username: 'student1', password: '1234', role: 'student', skills: 'Python, Machine Learning, React' },
  { id: 2, name: 'Priya Sharma', username: 'student2', password: '1234', role: 'student', skills: 'Java, Spring Boot, MySQL' },
  { id: 3, name: 'Karthik Raj', username: 'student3', password: '1234', role: 'student', skills: 'Node.js, MongoDB, Docker' },
  { id: 4, name: 'Admin', username: 'admin1', password: '1234', role: 'admin', skills: '' },
  { id: 5, name: 'HR Recruiter', username: 'hr1', password: '1234', role: 'recruiter', skills: '' },
];
let demoAchievements = [
  { id: 1, user_id: 1, title: 'Won Hackathon 2024', description: 'First place at State Level Hackathon', category: 'Competition', status: 'verified', created_at: new Date().toISOString(), name: 'Arun Kumar', skills: 'Python, Machine Learning, React' },
  { id: 2, user_id: 1, title: 'Published Research Paper', description: 'ML paper published in IEEE journal', category: 'Academic', status: 'verified', created_at: new Date().toISOString(), name: 'Arun Kumar', skills: 'Python, Machine Learning, React' },
  { id: 3, user_id: 1, title: 'AWS Certified Developer', description: 'Passed AWS Developer Associate exam', category: 'Certification', status: 'pending', created_at: new Date().toISOString(), name: 'Arun Kumar', skills: 'Python, Machine Learning, React' },
  { id: 4, user_id: 2, title: 'Google Summer of Code', description: 'Selected for GSoC 2024 with Apache', category: 'Open Source', status: 'verified', created_at: new Date().toISOString(), name: 'Priya Sharma', skills: 'Java, Spring Boot, MySQL' },
  { id: 5, user_id: 2, title: 'Built College App', description: 'Developed attendance tracking app used by 500+ students', category: 'Project', status: 'pending', created_at: new Date().toISOString(), name: 'Priya Sharma', skills: 'Java, Spring Boot, MySQL' },
  { id: 6, user_id: 3, title: 'Internship at Infosys', description: 'Completed 6-month internship', category: 'Internship', status: 'verified', created_at: new Date().toISOString(), name: 'Karthik Raj', skills: 'Node.js, MongoDB, Docker' },
  { id: 7, user_id: 3, title: 'Top 100 LeetCode India', description: 'Ranked in top 100 on LeetCode India leaderboard', category: 'Competition', status: 'pending', created_at: new Date().toISOString(), name: 'Karthik Raj', skills: 'Node.js, MongoDB, Docker' },
];
let demoIdCounter = 8;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const isDB = () => pool !== null && pool !== undefined;

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (isDB()) {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const { password: _, ...user } = rows[0];
      return res.json({ success: true, user });
    } else {
      const user = demoUsers.find(u => u.username === username && u.password === password);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /achievements?user_id=X
app.get('/achievements', async (req, res) => {
  const { user_id } = req.query;
  try {
    if (isDB()) {
      let query = `SELECT a.*, u.name, u.skills FROM achievements a JOIN users u ON a.user_id = u.id`;
      const params = [];
      if (user_id) { query += ' WHERE a.user_id = ?'; params.push(user_id); }
      query += ' ORDER BY a.created_at DESC';
      const [rows] = await pool.execute(query, params);
      return res.json(rows);
    } else {
      let data = [...demoAchievements];
      if (user_id) data = data.filter(a => a.user_id == user_id);
      return res.json(data.reverse());
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /add-achievement
app.post('/add-achievement', async (req, res) => {
  const { user_id, title, description, category } = req.body;
  try {
    if (isDB()) {
      const [result] = await pool.execute(
        'INSERT INTO achievements (user_id, title, description, category, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, title, description || '', category || 'General', 'pending']
      );
      const [rows] = await pool.execute('SELECT * FROM achievements WHERE id = ?', [result.insertId]);
      return res.json({ success: true, achievement: rows[0] });
    } else {
      const user = demoUsers.find(u => u.id == user_id);
      const newAch = {
        id: demoIdCounter++, user_id: parseInt(user_id), title, description: description || '',
        category: category || 'General', status: 'pending', created_at: new Date().toISOString(),
        name: user?.name || 'Unknown', skills: user?.skills || ''
      };
      demoAchievements.push(newAch);
      return res.json({ success: true, achievement: newAch });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /verify/:id
app.put('/verify/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDB()) {
      await pool.execute('UPDATE achievements SET status = ? WHERE id = ?', ['verified', id]);
      const [rows] = await pool.execute('SELECT * FROM achievements WHERE id = ?', [id]);
      return res.json({ success: true, achievement: rows[0] });
    } else {
      const ach = demoAchievements.find(a => a.id == id);
      if (!ach) return res.status(404).json({ error: 'Not found' });
      ach.status = 'verified';
      return res.json({ success: true, achievement: ach });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /verified-students?skill=X
app.get('/verified-students', async (req, res) => {
  const { skill } = req.query;
  try {
    if (isDB()) {
      let query = `
        SELECT DISTINCT u.id, u.name, u.skills,
          COUNT(a.id) as achievement_count,
          GROUP_CONCAT(DISTINCT a.title ORDER BY a.id SEPARATOR '||') as achievement_titles,
          GROUP_CONCAT(DISTINCT a.category ORDER BY a.id SEPARATOR '||') as achievement_categories
        FROM users u
        JOIN achievements a ON u.id = a.user_id AND a.status = 'verified'
        WHERE u.role = 'student'
      `;
      const params = [];
      if (skill) { query += ' AND u.skills LIKE ?'; params.push(`%${skill}%`); }
      query += ' GROUP BY u.id, u.name, u.skills';
      const [rows] = await pool.execute(query, params);
      return res.json(rows);
    } else {
      const verifiedAchs = demoAchievements.filter(a => a.status === 'verified');
      const studentMap = {};
      for (const a of verifiedAchs) {
        const user = demoUsers.find(u => u.id === a.user_id);
        if (!user || user.role !== 'student') continue;
        if (skill && !user.skills.toLowerCase().includes(skill.toLowerCase())) continue;
        if (!studentMap[user.id]) {
          studentMap[user.id] = { id: user.id, name: user.name, skills: user.skills, achievement_count: 0, achievement_titles: [], achievement_categories: [] };
        }
        studentMap[user.id].achievement_count++;
        studentMap[user.id].achievement_titles.push(a.title);
        studentMap[user.id].achievement_categories.push(a.category);
      }
      const result = Object.values(studentMap).map(s => ({
        ...s,
        achievement_titles: s.achievement_titles.join('||'),
        achievement_categories: s.achievement_categories.join('||'),
      }));
      return res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /db-status
app.get('/db-status', (req, res) => {
  res.json({ connected: isDB(), mode: isDB() ? 'MySQL' : 'Demo (In-Memory)' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Student Achievement Hub running at http://localhost:${PORT}`);
    console.log(`   Mode: ${isDB() ? 'MySQL Connected' : 'Demo (In-Memory)'}`);
  });
});
