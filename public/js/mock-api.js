/* =========================================================
   Mock API — used automatically on GitHub Pages (static hosting)
   When running locally with npm start, the real Express server
   handles all /api/* requests instead.
   ========================================================= */

const MOCK_USERS = [
  { id:'1', name:'Alice Johnson', email:'alice@example.com', role:'Admin',   status:'active',   age:32, department:'Engineering' },
  { id:'2', name:'Bob Smith',     email:'bob@example.com',   role:'User',    status:'active',   age:28, department:'Marketing' },
  { id:'3', name:'Carol White',   email:'carol@example.com', role:'Manager', status:'inactive', age:45, department:'HR' },
  { id:'4', name:'David Lee',     email:'david@example.com', role:'User',    status:'active',   age:35, department:'Finance' },
  { id:'5', name:'Eva Martinez',  email:'eva@example.com',   role:'User',    status:'locked',   age:29, department:'Engineering' }
];

let mockUsers = JSON.parse(JSON.stringify(MOCK_USERS));
let mockIdCounter = 6;

const MOCK_ACCOUNTS = {
  admin:    { password:'admin123',  role:'admin', status:'active' },
  user:     { password:'user123',   role:'user',  status:'active' },
  locked:   { password:'locked123', role:'user',  status:'locked' },
  testuser: { password:'Test@1234', role:'user',  status:'active' }
};

function mockResponse(status, data) {
  return Promise.resolve({
    status, ok: status >= 200 && status < 300,
    json: () => Promise.resolve(data)
  });
}

function handleMockRequest(method, url, body) {
  const path  = url.replace(/^.*\/api/, '/api').split('?')[0];
  const query = url.includes('?') ? new URLSearchParams(url.split('?')[1]) : new URLSearchParams();
  const delay = parseInt(query.get('delay') || '0');

  return new Promise(resolve => setTimeout(() => {
    // GET /api/users
    if (method === 'GET' && path === '/api/users') {
      let result = [...mockUsers];
      if (query.get('search')) {
        const q = query.get('search').toLowerCase();
        result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      if (query.get('role'))   result = result.filter(u => u.role   === query.get('role'));
      if (query.get('status')) result = result.filter(u => u.status === query.get('status'));
      resolve(mockResponse(200, { success:true, count:result.length, data:result }));
    }
    // GET /api/users/:id
    else if (method === 'GET' && path.match(/^\/api\/users\/\w+$/)) {
      const id   = path.split('/').pop();
      const user = mockUsers.find(u => u.id === id);
      resolve(user
        ? mockResponse(200, { success:true, data:user })
        : mockResponse(404, { success:false, message:'User not found' }));
    }
    // POST /api/users
    else if (method === 'POST' && path === '/api/users') {
      const { name, email, role, age, department } = body || {};
      if (!name || !email) return resolve(mockResponse(400, { success:false, message:'name and email are required' }));
      if (mockUsers.find(u => u.email === email)) return resolve(mockResponse(409, { success:false, message:'Email already exists' }));
      const newUser = { id: String(mockIdCounter++), name, email, role:role||'User', status:'active', age:age||null, department:department||'General' };
      mockUsers.push(newUser);
      resolve(mockResponse(201, { success:true, data:newUser }));
    }
    // PUT /api/users/:id
    else if (method === 'PUT' && path.match(/^\/api\/users\/\w+$/)) {
      const id  = path.split('/').pop();
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return resolve(mockResponse(404, { success:false, message:'User not found' }));
      mockUsers[idx] = { ...mockUsers[idx], ...(body||{}), id:mockUsers[idx].id };
      resolve(mockResponse(200, { success:true, data:mockUsers[idx] }));
    }
    // DELETE /api/users/:id
    else if (method === 'DELETE' && path.match(/^\/api\/users\/\w+$/)) {
      const id  = path.split('/').pop();
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return resolve(mockResponse(404, { success:false, message:'User not found' }));
      const deleted = mockUsers.splice(idx, 1)[0];
      resolve(mockResponse(200, { success:true, message:'User deleted', data:deleted }));
    }
    // POST /api/auth/login
    else if (method === 'POST' && path === '/api/auth/login') {
      const { username, password } = body || {};
      const acct = MOCK_ACCOUNTS[(username||'').toLowerCase()];
      if (!acct)                return resolve(mockResponse(401, { success:false, message:'Invalid credentials' }));
      if (acct.status==='locked') return resolve(mockResponse(403, { success:false, message:'Account is locked. Contact support.' }));
      if (acct.password!==password) return resolve(mockResponse(401, { success:false, message:'Invalid credentials' }));
      resolve(mockResponse(200, { success:true, message:'Login successful', token:'mock-jwt-static-'+Math.random().toString(36).slice(2,10), user:{ username, role:acct.role } }));
    }
    // GET /api/delayed
    else if (method === 'GET' && path === '/api/delayed') {
      resolve(mockResponse(200, { success:true, message:`Response after ${delay}ms delay (mock)`, timestamp:new Date().toISOString() }));
    }
    // GET /api/flaky
    else if (method === 'GET' && path === '/api/flaky') {
      if (Math.random() < 0.5) resolve(mockResponse(500, { success:false, message:'Flaky endpoint — random server error (mock)' }));
      else resolve(mockResponse(200, { success:true, message:'Flaky endpoint succeeded this time! (mock)', timestamp:Date.now() }));
    }
    // POST /api/echo
    else if (method === 'POST' && path === '/api/echo') {
      resolve(mockResponse(200, { success:true, echo:body }));
    }
    // POST /api/upload (simulate)
    else if (method === 'POST' && path === '/api/upload') {
      resolve(mockResponse(200, { success:true, message:'File uploaded successfully (mock)', filename:'example.pdf', size:12345, mimetype:'application/pdf' }));
    }
    else {
      resolve(mockResponse(404, { success:false, message:`No mock handler for ${method} ${path}` }));
    }
  }, delay));
}

// ── Detect GitHub Pages (static hosting) and patch fetch ──────────────────
const IS_STATIC = window.location.hostname.includes('github.io') ||
                  window.location.protocol === 'file:';

if (IS_STATIC) {
  const _fetch = window.fetch.bind(window);
  window.fetch = function(url, opts = {}) {
    const strUrl = typeof url === 'string' ? url : url.toString();
    if (strUrl.includes('/api/')) {
      const method = (opts.method || 'GET').toUpperCase();
      let body = null;
      if (opts.body) {
        try { body = JSON.parse(opts.body); } catch(e) { body = opts.body; }
      }
      return handleMockRequest(method, strUrl, body);
    }
    return _fetch(url, opts);
  };
  console.info('[Mock API] Active — running on static hosting. All /api/* calls use embedded mock data.');
}
