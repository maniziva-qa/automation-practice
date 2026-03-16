const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

function readUsers() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// GET /api/users - simulate optional network delay
const getUsers = (req, res) => {
  const delay = parseInt(req.query.delay) || 0;
  setTimeout(() => {
    const users = readUsers();
    const { role, status, search } = req.query;
    let result = [...users];
    if (role) result = result.filter(u => u.role === role);
    if (status) result = result.filter(u => u.status === status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, count: result.length, data: result });
  }, delay);
};

// GET /api/users/:id
const getUserById = (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

// POST /api/users
const createUser = (req, res) => {
  const { name, email, role, age, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'name and email are required' });
  }
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'Email already exists' });
  }
  const newUser = {
    id: uuidv4().split('-')[0],
    name,
    email,
    role: role || 'User',
    status: 'active',
    age: age || null,
    department: department || 'General'
  };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ success: true, data: newUser });
};

// PUT /api/users/:id
const updateUser = (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
  writeUsers(users);
  res.json({ success: true, data: users[idx] });
};

// DELETE /api/users/:id
const deleteUser = (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  const deleted = users.splice(idx, 1)[0];
  writeUsers(users);
  res.json({ success: true, message: 'User deleted', data: deleted });
};

// POST /api/auth/login
const login = (req, res) => {
  const { username, password } = req.body;
  const accounts = {
    'admin':    { password: 'admin123',   role: 'admin',   status: 'active' },
    'user':     { password: 'user123',    role: 'user',    status: 'active' },
    'locked':   { password: 'locked123',  role: 'user',    status: 'locked' },
    'testuser': { password: 'Test@1234',  role: 'user',    status: 'active' }
  };
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  const account = accounts[username.toLowerCase()];
  if (!account) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (account.status === 'locked') {
    return res.status(403).json({ success: false, message: 'Account is locked. Contact support.' });
  }
  if (account.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token-' + uuidv4().split('-')[0],
    user: { username, role: account.role }
  });
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, login };
