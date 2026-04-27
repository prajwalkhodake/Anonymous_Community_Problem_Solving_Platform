// ═══════════════════════════════════════
// ADMIN PANEL - Comprehensive Management
// ═══════════════════════════════════════

let adminPostFilter = 'all';
let adminReportFilter = 'all';

let adminData = { users: [], problems: [], reports: [] };

async function fetchAdminData() {
  try {
    const [uRes, pRes] = await Promise.all([
      fetch('/api/users').catch(() => ({ok: false})),
      fetch('/api/problems').catch(() => ({ok: false}))
    ]);
    if (uRes.ok) adminData.users = await uRes.json();
    else adminData.users = LS.get('anon_users') || [];
    
    if (pRes.ok) adminData.problems = await pRes.json();
    else adminData.problems = LS.get('anon_problems') || [];
  } catch(e) {
    adminData.users = LS.get('anon_users') || [];
    adminData.problems = LS.get('anon_problems') || [];
  }
  adminData.reports = LS.get('anon_reports') || [];
}

function initAdminPanel() {
  const loginSec = document.querySelector('#adminLoginSection');
  const dashSec = document.querySelector('#adminDashboardSection');
  const loginForm = document.querySelector('#adminLoginForm');
  const logoutBtn = document.querySelector('#adminLogoutBtn');
  const ADMIN_ID = 'admin', ADMIN_PASS = 'admin123';

  if (sessionStorage.getItem('admin_auth') === 'true') showDash();

  if (loginForm) loginForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.querySelector('#adminId').value.trim();
    const pass = document.querySelector('#adminPass').value.trim();
    if (id === ADMIN_ID && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', 'true');
      toast('Admin access granted', 'success');
      showDash();
    } else toast('Invalid admin credentials', 'error');
  };

  if (logoutBtn) logoutBtn.onclick = () => {
    sessionStorage.removeItem('admin_auth');
    dashSec.style.display = 'none';
    loginSec.style.display = 'grid';
    toast('Admin logged out', 'info');
  };

  // Tabs
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#${btn.dataset.target}`)?.classList.add('active');
    };
  });

  // Search inputs
  const searchUsers = document.querySelector('#searchUsers');
  const searchPosts = document.querySelector('#searchPosts');
  const searchReports = document.querySelector('#searchReports');
  if (searchUsers) searchUsers.oninput = () => renderUsers();
  if (searchPosts) searchPosts.oninput = () => renderPosts();
  if (searchReports) searchReports.oninput = () => renderReports();

  // Post category filter pills
  document.querySelectorAll('#postCategoryFilters .filter-pill').forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll('#postCategoryFilters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      adminPostFilter = pill.dataset.cat;
      renderPosts();
    };
  });

  // Report status filter pills
  document.querySelectorAll('#reportStatusFilters .filter-pill').forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll('#reportStatusFilters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      adminReportFilter = pill.dataset.status;
      renderReports();
    };
  });

  // Clear activity log
  const clearLogBtn = document.querySelector('#clearActivityLog');
  if (clearLogBtn) clearLogBtn.onclick = () => {
    LS.set('admin_log', []);
    renderActivityLog();
    toast('Activity log cleared', 'info');
  };

  function showDash() {
    loginSec.style.display = 'none';
    dashSec.style.display = 'block';
    renderAll();
  }

  function logAction(action) {
    const log = LS.get('admin_log') || [];
    log.unshift({ action, time: new Date().toISOString() });
    if (log.length > 100) log.length = 100;
    LS.set('admin_log', log);
  }

  async function renderAll() { 
    await fetchAdminData();
    renderStats(); 
    renderUsers(); 
    renderPosts(); 
    renderReports(); 
    renderActivityLog(); 
  }

  function renderStats() {
    const users = adminData.users;
    const problems = adminData.problems;
    const reports = adminData.reports;
    let totalResp = 0;
    problems.forEach(p => totalResp += (p.responses ? p.responses.length : 0));
    const pendingReports = reports.filter(r => r.status === 'PENDING').length;

    document.querySelector('#adminStatUsers').textContent = users.length;
    document.querySelector('#adminStatPosts').textContent = problems.length;
    document.querySelector('#adminStatResponses').textContent = totalResp;
    document.querySelector('#adminStatReports').textContent = pendingReports;
    const tc1 = document.querySelector('#tabCountUsers'); if (tc1) tc1.textContent = users.length;
    const tc2 = document.querySelector('#tabCountPosts'); if (tc2) tc2.textContent = problems.length;
    const tc3 = document.querySelector('#tabCountReports'); if (tc3) tc3.textContent = pendingReports;
  }

  // ── USERS ──
  function renderUsers() {
    const tbody = document.querySelector('#adminUsersTbody');
    if (!tbody) return;
    let users = adminData.users;
    const problems = adminData.problems;
    const q = (document.querySelector('#searchUsers')?.value || '').toLowerCase();
    if (q) users = users.filter(u => (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));

    if (!users.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">No users found</td></tr>'; return; }

    tbody.innerHTML = users.map(u => {
      const postCount = problems.filter(p => p.authorId === u.id || p.authorName === u.username).length;
      const trust = getUserTrustScore(u.username || '');
      const joined = u.created ? new Date(u.created).toLocaleDateString() : '—';
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="post-avatar ${pickAv(u.username||'U')}" style="width:32px;height:32px;font-size:.75rem;flex-shrink:0">${(u.username||'U').charAt(0).toUpperCase()}</div><div><div style="font-weight:600;font-size:.88rem">${u.username || '<i>No identity</i>'}</div></div></div></td>
        <td style="font-size:.82rem;color:var(--text-muted)">${u.email}</td>
        <td class="trust-col" style="color:var(--accent-light)">${trust}</td>
        <td>${postCount}</td>
        <td style="font-size:.8rem;color:var(--text-muted)">${joined}</td>
        <td><div class="actions-cell">
          <button class="action-btn info" onclick="window._adminViewUser(${u.id})"><i class="fa-solid fa-eye"></i> View</button>
          <button class="action-btn danger" onclick="window._adminDeleteUser(${u.id})"><i class="fa-solid fa-trash"></i> Delete</button>
        </div></td></tr>`;
    }).join('');
  }

  window._adminViewUser = (userId) => {
    const users = adminData.users;
    const u = users.find(x => String(x.id) === String(userId));
    if (!u) return;
    const problems = adminData.problems;
    const userPosts = problems.filter(p => p.authorId === u.id || p.authorName === u.username);
    let respCount = 0;
    problems.forEach(p => (p.responses || []).forEach(r => { if (r.authorName === u.username) respCount++; }));
    const trust = getUserTrustScore(u.username || '');

    showModal(`
      <h3 style="margin-bottom:18px;font-size:1.15rem"><i class="fa-solid fa-user"></i> User Details</h3>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div class="post-avatar ${pickAv(u.username||'U')}" style="width:56px;height:56px;font-size:1.5rem">${(u.username||'U').charAt(0).toUpperCase()}</div>
        <div><div style="font-size:1.2rem;font-weight:700">${u.username || 'No identity'}</div>
        <div style="font-size:.85rem;color:var(--text-muted)">${u.email}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        <div class="glass" style="padding:14px;text-align:center;border-radius:14px"><div style="font-size:1.4rem;font-weight:800;color:var(--accent-light)">${trust}</div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Trust Score</div></div>
        <div class="glass" style="padding:14px;text-align:center;border-radius:14px"><div style="font-size:1.4rem;font-weight:800">${userPosts.length}</div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Posts</div></div>
        <div class="glass" style="padding:14px;text-align:center;border-radius:14px"><div style="font-size:1.4rem;font-weight:800">${respCount}</div><div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Responses</div></div>
      </div>
      <div class="detail-section"><h4>Recent Posts</h4>${userPosts.length ? userPosts.slice(0,5).map(p => `<div class="resp-card"><div class="resp-card-header"><span class="resp-card-name">${p.title}</span><span class="badge badge-${(p.tag||'general')===('urgent')?'pending':'resolved'}">${p.tag||'general'}</span></div><div class="resp-card-text">${(p.body||'').substring(0,120)}${(p.body||'').length>120?'...':''}</div></div>`).join('') : '<p style="color:var(--text-muted)">No posts yet</p>'}</div>
      <div class="detail-actions">
        <button class="action-btn danger" onclick="window._adminDeleteUser(${u.id});window._closeModal()"><i class="fa-solid fa-trash"></i> Delete User & Posts</button>
      </div>
    `);
  };

  window._adminDeleteUser = async (userId) => {
    if (!confirm('Delete this user and ALL their posts & responses?')) return;
    try {
      const res = await fetch('/api/users/' + userId, { method: 'DELETE' });
      if (res.ok) {
        logAction(`Deleted user ID: ${userId} via API`);
        toast('User & content deleted', 'success');
        renderAll();
        return;
      }
    } catch(e) {}
    
    // Fallback to localstorage
    let users = LS.get('anon_users') || [];
    const u = users.find(x => String(x.id) === String(userId));
    if (!u) return;
    users = users.filter(x => String(x.id) !== String(userId));
    LS.set('anon_users', users);
    let problems = LS.get('anon_problems') || [];
    problems = problems.filter(p => !(String(p.authorId) === String(userId) || p.authorName === u.username));
    problems.forEach(p => { if (p.responses) p.responses = p.responses.filter(r => r.authorName !== u.username); });
    LS.set('anon_problems', problems);
    logAction(`Deleted user "${u.username || u.email}" and their content`);
    toast('User & content deleted locally', 'success');
    renderAll();
  };

  // ── POSTS ──
  function renderPosts() {
    const tbody = document.querySelector('#adminPostsTbody');
    if (!tbody) return;
    let problems = adminData.problems;
    const q = (document.querySelector('#searchPosts')?.value || '').toLowerCase();
    if (adminPostFilter !== 'all') problems = problems.filter(p => p.tag === adminPostFilter);
    if (q) problems = problems.filter(p => (p.title||'').toLowerCase().includes(q) || (p.authorName||'').toLowerCase().includes(q) || (p.body||'').toLowerCase().includes(q));

    if (!problems.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">No posts found</td></tr>'; return; }

    const tagColors = {urgent:'badge-pending',help:'badge-problem',discussion:'badge-resolved',advice:'badge-user',general:'badge-response'};
    tbody.innerHTML = problems.map(p => {
      const respLen = (p.responses || []).length;
      return `<tr>
        <td><span style="font-weight:600;font-size:.85rem">${p.authorName || 'Unknown'}</span></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.85rem">${p.title}</td>
        <td><span class="badge ${tagColors[p.tag]||'badge-response'}">${p.tag||'general'}</span></td>
        <td>${p.likes||0}</td>
        <td>${respLen}</td>
        <td style="font-size:.8rem;color:var(--text-muted)">${p.created ? new Date(p.created).toLocaleDateString() : '—'}</td>
        <td><div class="actions-cell">
          <button class="action-btn info" onclick="window._adminViewPost(${p.id})"><i class="fa-solid fa-eye"></i> View</button>
          <button class="action-btn danger" onclick="window._adminDeletePost(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('');
  }

  window._adminViewPost = (postId) => {
    const problems = adminData.problems;
    const p = problems.find(x => x.id === postId);
    if (!p) return;
    const resps = (p.responses || []).map((r, i) => `
      <div class="resp-card">
        <div class="resp-card-header"><span class="resp-card-name">${r.authorName}</span><span class="resp-card-time">${r.created ? timeAgo(r.created) : ''}</span></div>
        <div class="resp-card-text">${r.text}</div>
        <div class="resp-card-actions"><button class="action-btn danger" onclick="window._adminDeleteResponse(${p.id},${i})"><i class="fa-solid fa-trash"></i> Delete Response</button></div>
      </div>`).join('');

    showModal(`
      <h3 style="margin-bottom:14px"><i class="fa-solid fa-layer-group"></i> Post Details</h3>
      <div class="detail-section"><h4>Author</h4><p style="font-weight:600">${p.authorName} · <span style="color:var(--text-muted)">${p.created ? timeAgo(p.created) : ''}</span></p></div>
      <div class="detail-section"><h4>Title</h4><p style="font-weight:700;font-size:1.05rem">${p.title}</p></div>
      <div class="detail-section"><h4>Content</h4><p>${p.body}</p></div>
      <div class="detail-section"><h4>Info</h4><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="badge badge-problem">${p.tag||'general'}</span><span class="badge badge-resolved"><i class="fa-solid fa-heart"></i> ${p.likes||0}</span><span class="badge badge-user"><i class="fa-solid fa-comment"></i> ${(p.responses||[]).length}</span></div></div>
      <div class="detail-section"><h4>Responses (${(p.responses||[]).length})</h4>${resps || '<p style="color:var(--text-muted)">No responses</p>'}</div>
      <div class="detail-actions">
        <button class="action-btn danger" onclick="window._adminDeletePost(${p.id});window._closeModal()"><i class="fa-solid fa-trash"></i> Delete Post</button>
      </div>
    `);
  };

  window._adminDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch('/api/problems/' + postId, { method: 'DELETE' });
      if (res.ok) {
        logAction(`Deleted post ID: ${postId} via API`);
        toast('Post deleted', 'success');
        renderAll();
        return;
      }
    } catch(e) {}
    
    // Fallback
    let problems = LS.get('anon_problems') || [];
    const p = problems.find(x => String(x.id) === String(postId));
    problems = problems.filter(x => String(x.id) !== String(postId));
    LS.set('anon_problems', problems);
    logAction(`Deleted post "${p ? p.title : postId}"`);
    toast('Post deleted locally', 'success');
    renderAll();
  };

  window._adminDeleteResponse = (postId, respIdx) => {
    if (!confirm('Delete this response?')) return;
    const problems = LS.get('anon_problems') || [];
    const p = problems.find(x => String(x.id) === String(postId));
    if (p && p.responses && p.responses[respIdx]) {
      const rName = p.responses[respIdx].authorName;
      p.responses.splice(respIdx, 1);
      LS.set('anon_problems', problems);
      logAction(`Deleted response by "${rName}" on post "${p.title}"`);
      toast('Response deleted', 'success');
      window._adminViewPost(postId);
      renderAll();
    }
  };

  // ── REPORTS ──
  function renderReports() {
    const tbody = document.querySelector('#adminReportsTbody');
    if (!tbody) return;
    let reports = adminData.reports;
    const q = (document.querySelector('#searchReports')?.value || '').toLowerCase();
    if (adminReportFilter !== 'all') reports = reports.filter(r => r.status === adminReportFilter);
    if (q) reports = reports.filter(r => (r.reason||'').toLowerCase().includes(q) || (r.reportedBy||'').toLowerCase().includes(q) || (r.targetType||'').toLowerCase().includes(q));

    if (!reports.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">No reports found</td></tr>'; return; }

    tbody.innerHTML = reports.map(r => {
      const isPending = r.status === 'PENDING';
      const typeBadge = r.targetType === 'PROBLEM' ? 'badge-problem' : r.targetType === 'USER' ? 'badge-user' : 'badge-response';
      const statusBadge = isPending ? 'badge-pending' : 'badge-resolved';
      const targetLabel = r.targetType === 'PROBLEM' ? (function(){ const pr = adminData.problems.find(p=>String(p.id)===String(r.targetId)); return pr ? pr.title.substring(0,25)+'...' : '#'+r.targetId; })() : r.targetId;
      return `<tr>
        <td><span class="badge ${typeBadge}">${r.targetType}</span></td>
        <td style="font-size:.85rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${targetLabel}</td>
        <td style="font-size:.85rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(r.reason||'').replace(/"/g,'&quot;')}">${r.reason}</td>
        <td style="font-size:.85rem">${r.reportedBy}</td>
        <td style="font-size:.8rem;color:var(--text-muted)">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
        <td><span class="badge ${statusBadge}">${r.status}</span></td>
        <td><div class="actions-cell">
          <button class="action-btn info" onclick="window._adminViewReport(${r.id})"><i class="fa-solid fa-eye"></i></button>
          ${isPending ? `<button class="action-btn success" onclick="window._adminDismissReport(${r.id})"><i class="fa-solid fa-check"></i></button>
          <button class="action-btn danger" onclick="window._adminActOnReport(${r.id})"><i class="fa-solid fa-gavel"></i></button>` : ''}
        </div></td></tr>`;
    }).join('');
  }

  window._adminViewReport = (reportId) => {
    const reports = adminData.reports;
    const r = reports.find(x => String(x.id) === String(reportId));
    if (!r) return;
    const isPending = r.status === 'PENDING';
    let targetInfo = '';
    if (r.targetType === 'PROBLEM') {
      const p = adminData.problems.find(x => String(x.id) === String(r.targetId));
      targetInfo = p ? `<div class="resp-card"><div class="resp-card-header"><span class="resp-card-name">${p.authorName}</span><span class="badge badge-problem">${p.tag||'general'}</span></div><div style="font-weight:600;margin-bottom:4px">${p.title}</div><div class="resp-card-text">${(p.body||'').substring(0,200)}</div></div>` : '<p style="color:var(--text-muted)">Post not found (may have been deleted)</p>';
    } else if (r.targetType === 'USER') {
      const u = adminData.users.find(x => String(x.username) === String(r.targetId));
      targetInfo = u ? `<div class="resp-card"><div class="resp-card-name">${u.username} — ${u.email}</div></div>` : '<p style="color:var(--text-muted)">User not found</p>';
    }

    showModal(`
      <h3 style="margin-bottom:16px"><i class="fa-solid fa-flag" style="color:var(--danger)"></i> Report #${r.id}</h3>
      <div class="detail-section"><h4>Status</h4><span class="badge ${isPending?'badge-pending':'badge-resolved'}">${r.status}</span></div>
      <div class="detail-section"><h4>Type</h4><span class="badge ${r.targetType==='PROBLEM'?'badge-problem':'badge-user'}">${r.targetType}</span></div>
      <div class="detail-section"><h4>Reported By</h4><p>${r.reportedBy}</p></div>
      <div class="detail-section"><h4>Date</h4><p>${r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</p></div>
      <div class="detail-section"><h4>Reason</h4><p>${r.reason}</p></div>
      <div class="detail-section"><h4>Reported Content</h4>${targetInfo}</div>
      ${isPending ? `<div class="detail-actions">
        <button class="action-btn success" onclick="window._adminDismissReport(${r.id});window._closeModal()"><i class="fa-solid fa-check"></i> Dismiss Report</button>
        <button class="action-btn danger" onclick="window._adminActOnReport(${r.id});window._closeModal()"><i class="fa-solid fa-gavel"></i> Delete Target & Resolve</button>
      </div>` : ''}
    `);
  };

  window._adminDismissReport = (reportId) => {
    const reports = LS.get('anon_reports') || [];
    const r = reports.find(x => x.id === reportId);
    if (!r) return;
    r.status = 'RESOLVED';
    LS.set('anon_reports', reports);
    logAction(`Dismissed report #${reportId} (${r.targetType})`);
    toast('Report dismissed', 'info');
    renderAll();
  };

  window._adminActOnReport = (reportId) => {
    const reports = LS.get('anon_reports') || [];
    const r = reports.find(x => x.id === reportId);
    if (!r) return;
    if (!confirm(`Delete the reported ${r.targetType.toLowerCase()} and resolve this report?`)) return;

    if (r.targetType === 'PROBLEM') {
      let problems = LS.get('anon_problems') || [];
      problems = problems.filter(p => String(p.id) !== String(r.targetId));
      LS.set('anon_problems', problems);
    } else if (r.targetType === 'USER') {
      let users = LS.get('anon_users') || [];
      const u = users.find(x => String(x.username) === String(r.targetId));
      if (u) {
        users = users.filter(x => x.username !== u.username);
        LS.set('anon_users', users);
        let problems = LS.get('anon_problems') || [];
        problems = problems.filter(p => p.authorName !== u.username);
        problems.forEach(p => { if (p.responses) p.responses = p.responses.filter(res => res.authorName !== u.username); });
        LS.set('anon_problems', problems);
      }
    }
    r.status = 'RESOLVED';
    LS.set('anon_reports', reports);
    logAction(`Acted on report #${reportId}: deleted ${r.targetType.toLowerCase()} "${r.targetId}"`);
    toast('Target deleted & report resolved', 'success');
    renderAll();
  };

  // ── ACTIVITY LOG ──
  function renderActivityLog() {
    const body = document.querySelector('#activityLogBody');
    if (!body) return;
    const log = LS.get('admin_log') || [];
    if (!log.length) { body.innerHTML = '<div class="empty-panel"><i class="fa-solid fa-clock-rotate-left"></i><p>No admin actions recorded yet</p></div>'; return; }
    body.innerHTML = log.map(l => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0"></div>
        <div style="flex:1;font-size:.85rem">${l.action}</div>
        <div style="font-size:.75rem;color:var(--text-muted);white-space:nowrap">${l.time ? timeAgo(l.time) : ''}</div>
      </div>
    `).join('');
  }

  // ── MODAL SYSTEM ──
  function showModal(html) {
    const container = document.querySelector('#adminDetailModal');
    container.innerHTML = `<div class="detail-modal" id="detailOverlay"><div class="detail-card"><button class="detail-close" onclick="window._closeModal()"><i class="fa-solid fa-xmark"></i></button>${html}</div></div>`;
    document.querySelector('#detailOverlay').addEventListener('click', e => { if (e.target.id === 'detailOverlay') window._closeModal(); });
  }

  window._closeModal = () => {
    const container = document.querySelector('#adminDetailModal');
    if (container) container.innerHTML = '';
  };
}
