const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET } = require('./authMiddleware');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      [email, password_hash, role],
      function (err) {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: 'Registration failed (email may already exist)' });
        }
        res.json({ message: 'Registration successful', userId: this.lastID });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Login failed' });
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: 'Wrong password' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '3h' }
      );

      res.json({
        message: 'Login successful',
        token,
        role: user.role,
        email: user.email,
        userId: user.id,
      });
    }
  );
});

module.exports = router;