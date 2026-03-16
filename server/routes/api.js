const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const ctrl = require('../controllers/userController');

// ─── User CRUD ─────────────────────────────────────────────────────────────
router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUserById);
router.post('/users', ctrl.createUser);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

// ─── Auth ──────────────────────────────────────────────────────────────────
router.post('/auth/login', ctrl.login);

// ─── File upload ───────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// ─── Delay / Wait simulation ───────────────────────────────────────────────
router.get('/delayed', (req, res) => {
  const ms = Math.min(parseInt(req.query.ms) || 2000, 15000);
  setTimeout(() => {
    res.json({ success: true, message: `Response after ${ms}ms delay`, timestamp: new Date().toISOString() });
  }, ms);
});

// ─── Random error simulation ───────────────────────────────────────────────
router.get('/flaky', (req, res) => {
  if (Math.random() < 0.5) {
    return res.status(500).json({ success: false, message: 'Flaky endpoint — random server error' });
  }
  res.json({ success: true, message: 'Flaky endpoint succeeded this time!', timestamp: Date.now() });
});

// ─── Echo endpoint ─────────────────────────────────────────────────────────
router.post('/echo', (req, res) => {
  res.json({ success: true, echo: req.body, headers: req.headers });
});

module.exports = router;
