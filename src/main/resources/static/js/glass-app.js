// ════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(k); }
};

// Debounce utility — delays function execution until after `delay` ms of inactivity
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ════════════════════════════════════════
// CONTENT MODERATION (ABUSE / 18+)
// ════════════════════════════════════════
const RESTRICTED_WORDS = [
  'abuse', 'kill', 'murder', 'suicide', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 
  'slut', 'whore', 'dick', 'pussy', 'porn', 'sex', 'nude', 'nsfw', 'rape', 'pedophile'
];

function containsRestrictedContent(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return RESTRICTED_WORDS.some(word => {
    // Check for exact word match to avoid blocking words like "glass" because it contains "ass"
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

// ════════════════════════════════════════
// TOAST
// ════════════════════════════════════════
function toast(msg, type = 'info') {
  let w = $('.toast-wrap');
  if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
  const icons = { success: '<i class="fa-solid fa-check"></i>', error: '<i class="fa-solid fa-xmark"></i>', info: '<i class="fa-solid fa-lightbulb"></i>' };
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.innerHTML = `<span>${icons[type] || '<i class="fa-solid fa-lightbulb"></i>'}</span><span>${msg}</span>`;
  w.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ════════════════════════════════════════
// NAME GENERATOR
// ════════════════════════════════════════
const ADJ = ['Silent','Hidden','Mystic','Shadow','Cosmic','Neon','Phantom','Velvet','Crystal','Brave','Gentle','Wild','Calm','Bright','Lunar','Ember','Frost','Storm','Dream','Noble'];
const NOUN = ['Phoenix','Wolf','Eagle','Tiger','Panda','Fox','Owl','Lion','Bear','Hawk','Dragon','Raven','Falcon','Lynx','Cobra','Sparrow','Panther','Orca','Viper','Stag'];

function randomName() {
  return ADJ[Math.floor(Math.random() * ADJ.length)] + NOUN[Math.floor(Math.random() * NOUN.length)] + Math.floor(Math.random() * 999);
}

// ════════════════════════════════════════
// TIME AGO
// ════════════════════════════════════════
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ════════════════════════════════════════
// TRUST SCORE CALCULATOR
// ════════════════════════════════════════
// Trust score cache — populated once per renderFeed() call to avoid O(n²) lookups
let _trustScoreCache = null;

function buildTrustScoreCache() {
  const problems = LS.get('anon_problems') || [];
  const cache = {};
  problems.forEach(p => {
    cache[p.authorName] = (cache[p.authorName] || 0) + 5;
    (p.responses || []).forEach(r => {
      cache[r.authorName] = (cache[r.authorName] || 0) + 2;
    });
  });
  return cache;
}

function getUserTrustScore(authorName) {
  if (!_trustScoreCache) _trustScoreCache = buildTrustScoreCache();
  return _trustScoreCache[authorName] || 0;
}

// ════════════════════════════════════════
// AVATAR COLOR PICKER
// ════════════════════════════════════════
const AV_COLORS = ['av-teal','av-amber','av-coral','av-sky','av-pink'];
function pickAv(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

// ════════════════════════════════════════
// AUTH GUARDS
// ════════════════════════════════════════
function guardAuth() {
  if (!LS.get('anon_user')) { window.location.href = 'auth.html'; return null; }
  return LS.get('anon_user');
}

function guardUsername() {
  if (!LS.get('anon_username')) { window.location.href = 'username.html'; return null; }
  return LS.get('anon_username');
}

// ════════════════════════════════════════
// DROPDOWN SYSTEM
// ════════════════════════════════════════
function initDropdowns() {
  document.addEventListener('click', (e) => {
    $$('.dropdown').forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  $$('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = trigger.closest('.dropdown');
      $$('.dropdown').forEach(d => { if (d !== dd) d.classList.remove('open'); });
      dd.classList.toggle('open');
    });
  });

  $$('.dropdown-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      switch (action) {
        case 'dashboard':
          window.location.href = 'dashboard.html';
          break;
        case 'community':
          window.location.href = 'community.html';
          break;
        case 'change-name':
          const cUserDrop = LS.get('anon_user');
          if (cUserDrop && (cUserDrop.identity_changes || 0) >= 3) {
            toast('Identity changes limit reached (3/3)', 'error');
            break;
          }
          window.location.href = 'username.html?change=1';
          break;
        case 'clear-posts':
          const cProblems = LS.get('anon_problems') || [];
          const cUname = LS.get('anon_username');
          const cUser = LS.get('anon_user');
          const filteredProblems = cProblems.filter(p => p.authorName !== cUname && p.authorId !== cUser?.id);
          LS.set('anon_problems', filteredProblems);
          toast('Your posts cleared', 'info');
          setTimeout(() => location.reload(), 500);
          break;
        case 'logout':
          LS.del('anon_user');
          LS.del('anon_username');
          toast('Logged out', 'info');
          setTimeout(() => { window.location.href = 'auth.html'; }, 500);
          break;
      }
    });
  });
}

// Populate dropdown & taskbar info
function populateDropdown() {
  const user = LS.get('anon_user');
  const uname = LS.get('anon_username');

  $$('.dd-username').forEach(el => { if (uname) el.textContent = uname; });
  $$('.dd-email').forEach(el => { if (user) el.textContent = user.email; });
  $$('.trigger-name').forEach(el => { if (uname) el.textContent = uname; });
  $$('.trigger-initial').forEach(el => {
    if (uname) el.textContent = uname.charAt(0).toUpperCase();
  });
}

// ════════════════════════════════════════
// CATEGORIES DROPDOWN
// ════════════════════════════════════════
function initCategoryDropdown() {
  const items = $$('.cat-dropdown-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.dataset.filter;
      activeFilter = filter;

      // Update active state
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update sidebar filter items too
      $$('.filter-item').forEach(f => {
        f.classList.toggle('active', f.dataset.filter === filter);
      });

      // Update dropdown label
      const label = $('.cat-label');
      if (label) {
        const emojiMap = { all: '<i class="fa-solid fa-globe"></i>', urgent: '<span class="status-dot dot-red"></span>', help: '<span class="status-dot dot-yellow"></span>', discussion: '<span class="status-dot dot-blue"></span>', advice: '<span class="status-dot dot-purple"></span>', general: '<span class="status-dot dot-gray"></span>' };
        label.innerHTML = `${emojiMap[filter] || '<i class="fa-solid fa-globe"></i>'} ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      }

      // Close dropdown
      item.closest('.dropdown')?.classList.remove('open');

      renderFeed();
    });
  });
}

// ════════════════════════════════════════
// TASKBAR
// ════════════════════════════════════════
function initTaskbar() {
  // Compose button opens modal
  const composeBtn = $('#tbCompose');
  const overlay = $('#composerModal');
  const closeBtn = $('#modalClose');

  if (composeBtn && overlay) {
    composeBtn.addEventListener('click', () => {
      overlay.classList.add('show');
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('show');
    });
  }

  // Taskbar nav items
  $$('.tb-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      window.location.href = item.dataset.page;
    });
  });
}

// ════════════════════════════════════════
// PAGE 1: AUTH
// ════════════════════════════════════════
// ════════════════════════════════════════
// PAGE 1: AUTH (REAL BACKEND INTEGRATION)
// ════════════════════════════════════════
const API_URL = '/api/auth';

// Helper for API calls
async function apiCall(endpoint, data) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || 'Action failed');
    return result;
  } catch (err) {
    toast(err.message, 'error');
    throw err;
  }
}

function initAuth() {
  const lt = $('#tabLogin'), st = $('#tabSignup');
  const lf = $('#formLogin'), sf = $('#formSignup'), vf = $('#formVerify');
  const switcher = $('.auth-switcher');

  if (!lt) return;

  // Auto-redirect if already logged in (local fallback)
  const currentUser = LS.get('anon_user');
  if (currentUser) {
    window.location.href = currentUser.anonymousName ? 'community.html' : 'username.html';
    return;
  }

  let pendingAction = ''; // 'login' or 'register'
  let pendingEmail = '';

  lt.onclick = () => {
    lt.classList.add('active'); st.classList.remove('active');
    lf.classList.remove('hidden'); sf.classList.add('hidden'); vf.classList.add('hidden');
    switcher.classList.remove('hidden');
  };
  st.onclick = () => {
    st.classList.add('active'); lt.classList.remove('active');
    sf.classList.remove('hidden'); lf.classList.add('hidden'); vf.classList.add('hidden');
    switcher.classList.remove('hidden');
  };

  // 1. INITIATE LOGIN
  lf.onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#lEmail').value.trim();
    const password = $('#lPass').value.trim();
    
    try {
      const res = await apiCall('/login', { email, password });
      pendingEmail = email;
      pendingAction = 'login';
      showVerifyScreen('Verification code sent for login.');
    } catch (e) {}
  };

  // 2. INITIATE REGISTER
  sf.onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#sEmail').value.trim();
    const password = $('#sPass').value.trim();
    const conf = $('#sConfirm').value.trim();
    const terms = $('#termsCheck');
    
    if (password.length < 6) return toast('Password: 6+ chars', 'error');
    if (password !== conf) return toast('Passwords don\'t match', 'error');
    if (terms && !terms.checked) return toast('Please agree to terms', 'error');

    try {
      // For registration, we need a random starting name to satisfy backend
      const anonymousName = randomName(); 
      await apiCall('/register', { email, password, anonymousName });
      pendingEmail = email;
      pendingAction = 'register';
      showVerifyScreen('Registration code sent to your email.');
    } catch (e) {}
  };

  // 3. VERIFY OTP
  vf.onsubmit = async (e) => {
    e.preventDefault();
    const otp = $('#vOtp').value.trim();
    const endpoint = pendingAction === 'login' ? '/verify-login' : '/verify-registration';

    try {
      const user = await apiCall(endpoint, { email: pendingEmail, otp });
      
      // Save user to local storage for the rest of the app to work
      LS.set('anon_user', user);
      if (user.anonymousName) LS.set('anon_username', user.anonymousName);

      toast(pendingAction === 'login' ? 'Welcome back!' : 'Account verified!', 'success');
      setTimeout(() => {
        window.location.href = user.anonymousName ? 'community.html' : 'username.html';
      }, 800);
    } catch (e) {}
  };

  // 4. RESEND OTP
  $('#resendBtn').onclick = (e) => {
    e.preventDefault();
    apiCall('/resend-otp', { email: pendingEmail })
      .then(res => toast(res.message, 'success'));
  };

  function showVerifyScreen(msg) {
    lf.classList.add('hidden');
    sf.classList.add('hidden');
    switcher.classList.add('hidden');
    vf.classList.remove('hidden');
    if ($('#verifyMsg')) $('#verifyMsg').textContent = msg;
    toast('Code Sent!', 'info');
  }
}

// ════════════════════════════════════════
// PAGE 2: USERNAME
// ════════════════════════════════════════
function initUsername() {
  const badge = $('#genBadge'), genBtn = $('#genBtn'), cin = $('#customName'), saveBtn = $('#saveName');
  if (!badge) return;
  if (!guardAuth()) return;
  
  const isChanging = new URLSearchParams(window.location.search).get('change') === '1';
  if (LS.get('anon_username') && !isChanging) { 
    window.location.href = 'dashboard.html'; 
    return; 
  }

  // Update text if changing
  if (isChanging) {
    const subtitle = document.querySelector('.username-glass .subtitle');
    const changesCount = LS.get('anon_user')?.identity_changes || 0;
    if (subtitle) subtitle.innerHTML = `Change your identity (${3 - changesCount} changes left).<br>Old posts will remain under your old name.`;
  }

  let cur = randomName();
  badge.textContent = cur;

  genBtn.onclick = () => {
    cur = randomName();
    badge.textContent = cur;
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  };

  saveBtn.onclick = () => {
    const custom = cin.value.trim();
    const final = custom || cur;
    if (final.length < 3) return toast('Min 3 characters', 'error');

    const authUser = LS.get('anon_user');

    if (authUser && authUser.email) {
      const emailPart = authUser.email.split('@')[0].toLowerCase();
      const finalLower = final.toLowerCase();
      if (emailPart.includes(finalLower) || finalLower.includes(emailPart)) {
        return toast('Username cannot be similar to your email', 'error');
      }
    }

    const users = LS.get('anon_users') || [];
    const problems = LS.get('anon_problems') || [];
    
    // Check if username is already taken by another user
    const isTakenInUsers = users.some(u => u.username && u.username.toLowerCase() === final.toLowerCase() && u.id !== LS.get('anon_user')?.id);
    const isTakenInProblems = problems.some(p => (
      (p.authorName && p.authorName.toLowerCase() === final.toLowerCase() && p.authorId !== LS.get('anon_user')?.id) ||
      (p.responses && p.responses.some(r => r.authorName && r.authorName.toLowerCase() === final.toLowerCase() && r.authorId !== LS.get('anon_user')?.id))
    ));
    if (isTakenInUsers || isTakenInProblems) return toast('Username already taken', 'error');

    let msg = `Identity: ${final} <i class="fa-solid fa-user-secret"></i>`;

    if (authUser) {
      if (isChanging) {
        if ((authUser.identity_changes || 0) >= 3) {
          return toast('Identity changes limit reached (3/3)', 'error');
        }
        authUser.identity_changes = (authUser.identity_changes || 0) + 1;
        msg = `Identity changed to ${final} (${authUser.identity_changes}/3)`;
      }
      authUser.username = final;
      const uIndex = users.findIndex(u => u.id === authUser.id);
      if (uIndex !== -1) users[uIndex] = authUser;
      LS.set('anon_users', users);
      LS.set('anon_user', authUser);
    }

    LS.set('anon_username', final);
    toast(msg, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  };
}

// ════════════════════════════════════════
// PAGE 3: DASHBOARD
// ════════════════════════════════════════
function initDashboard() {
  const heroName = $('#heroName');
  if (!heroName) return;
  const user = guardAuth(); if (!user) return;
  const uname = guardUsername(); if (!uname) return;

  heroName.textContent = uname;
  populateDropdown();

  const problems = LS.get('anon_problems') || [];
  const mine = problems.filter(p => p.authorId === user.id);
  
  // Count responses made by this user
  let myResponsesCount = 0;
  problems.forEach(p => {
    (p.responses || []).forEach(r => {
      if (r.authorId === user.id || r.authorName === uname) myResponsesCount++;
    });
  });

  const trustScore = (mine.length * 5) + (myResponsesCount * 2);

  // Calculate helpful responses (People Helped)
  let helpedCount = 0;
  problems.forEach(p => {
    (p.responses || []).forEach(r => {
      if ((r.authorId === user.id || r.authorName === uname) && r.isHelpful) {
        helpedCount++;
      }
    });
  });

  const ep = $('#statProblems'), er = $('#statResponses'), eh = $('#statHelped'), et = $('#statTrustScore');
  if (ep) animNum(ep, mine.length);
  if (er) animNum(er, myResponsesCount);
  if (eh) animNum(eh, helpedCount);
  if (et) animNum(et, trustScore);

  const go = $('#goBoard');
  if (go) go.onclick = () => { window.location.href = 'community.html'; };

  initTaskbar();
}

function animNum(el, target) {
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 25));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = cur;
  }, 35);
}

// ════════════════════════════════════════
// PAGE 4: COMMUNITY
// ════════════════════════════════════════
let activeFilter = 'all';
let isAnon = false;
let searchQuery = '';
const debouncedRenderFeed = debounce(() => renderFeed(), 300);

function initCommunity() {
  const feed = $('#feed');
  if (!feed) return;
  const user = guardAuth(); if (!user) return;
  const uname = guardUsername(); if (!uname) return;

  populateDropdown();

  if (!LS.get('anon_problems')) LS.set('anon_problems', seedData());

  renderFeed();
  initModalComposer(user, uname);
  initFilters();
  initCategoryDropdown();
  initSearch();
  initTaskbar();

  const tog = $('#anonToggle');
  if (tog) { tog.checked = false; tog.onchange = () => { isAnon = tog.checked; }; }
}

function initModalComposer(user, uname) {
  const chips = $$('.modal-glass .tag-chip');
  let selTag = 'general';
  let keywordList = [];

  const kwInput = $('#mKeywords');
  const kwContainer = $('#keywordTags');

  // Set initial active state for 'general' tag
  chips.forEach(c => {
    if (c.dataset.tag === 'general') c.classList.add('active');
  });

  function renderKeywords() {
    if (!kwContainer) return;
    kwContainer.innerHTML = keywordList.map((k, i) => `
      <div class="keyword-tag">
        <span>#${k}</span>
        <i class="fa-solid fa-xmark remove-kw" data-idx="${i}"></i>
      </div>
    `).join('');
    
    $$('.remove-kw').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        keywordList.splice(idx, 1);
        renderKeywords();
      };
    });
  }

  if (kwInput) {
    kwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = kwInput.value.trim().replace(/^#/, '');
        addKeyword(val);
      }
    });
  }

  function addKeyword(val) {
    if (val && !keywordList.includes(val)) {
      keywordList.push(val);
      if (kwInput) kwInput.value = '';
      renderKeywords();
    }
  }

  // Suggestion chips for composer
  $$('.comp-suggestion').forEach(chip => {
    chip.addEventListener('click', () => {
      addKeyword(chip.dataset.val);
    });
  });

  chips.forEach(c => {
    c.onclick = () => {
      chips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      selTag = c.dataset.tag;
    };
  });

  const pb = $('#modalPostBtn');
  if (pb) {
    pb.onclick = () => {
      const title = $('#mTitle').value.trim();
      const body = $('#mBody').value.trim();
      if (!title || !body) return toast('Title & description needed', 'error');

      if (containsRestrictedContent(title) || containsRestrictedContent(body)) {
        return toast('Please remove abusive or 18+ content', 'error');
      }

      const tog = $('#mAnonToggle');
      const anon = tog ? tog.checked : false;

      const prob = {
        id: Date.now(), title, body, tag: selTag,
        keywords: [...keywordList],
        authorId: user.id,
        authorName: anon ? randomName() : uname,
        isAnonymous: anon,
        likes: 0, likedBy: [], responses: [],
        created: new Date().toISOString()
      };

      const all = LS.get('anon_problems') || [];
      all.unshift(prob);
      LS.set('anon_problems', all);
      $('#mTitle').value = '';
      $('#mBody').value = '';
      if (kwInput) kwInput.value = '';
      keywordList = [];
      renderKeywords();
      chips.forEach(x => x.classList.remove('active'));
      selTag = 'general';

      // Close modal
      const overlay = $('#composerModal');
      if (overlay) overlay.classList.remove('show');
      
      // Also reset tag to 'general' for next use
      chips.forEach(x => {
        if(x.dataset.tag === 'general') x.classList.add('active');
        else x.classList.remove('active');
      });
      selTag = 'general';

      toast('Posted anonymously <i class="fa-solid fa-user-secret"></i>', 'success');
      renderFeed();
    };
  }
}

function initFilters() {
  $$('.filter-item').forEach(btn => {
    btn.onclick = () => {
      $$('.filter-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;

      // Also update category dropdown active
      $$('.cat-dropdown-item').forEach(i => {
        i.classList.toggle('active', i.dataset.filter === activeFilter);
      });

      // Update label
      const label = $('.cat-label');
      if (label) {
        const emojiMap = { all: '<i class="fa-solid fa-globe"></i>', urgent: '<span class="status-dot dot-red"></span>', help: '<span class="status-dot dot-yellow"></span>', discussion: '<span class="status-dot dot-blue"></span>', advice: '<span class="status-dot dot-purple"></span>', general: '<span class="status-dot dot-gray"></span>' };
        label.innerHTML = `${emojiMap[activeFilter] || '<i class="fa-solid fa-globe"></i>'} ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`;
      }

      renderFeed();
    };
  });
}

function initSearch() {
  const searchInput = $('#searchInput');
  const searchClearBtn = $('#searchClearBtn');
  const suggestions = $('#searchSuggestions');
  const exploreBtn = $('#tbExplore');

  if (!searchInput) return;

  // Explore button scrolls to and focuses search
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        searchInput.focus();
        if (suggestions) suggestions.style.display = 'block';
      }, 500);
    });
  }

  searchInput.addEventListener('focus', () => {
    if (suggestions) suggestions.style.display = 'block';
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (suggestions && !suggestions.contains(e.target) && e.target !== searchInput && e.target !== exploreBtn && !exploreBtn?.contains(e.target)) {
      suggestions.style.display = 'none';
    }
  });

  // Suggestion chips
  $$('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.textContent;
      searchInput.value = val;
      searchQuery = val.toLowerCase();
      if (searchClearBtn) searchClearBtn.style.display = 'grid';
      if (suggestions) suggestions.style.display = 'none';
      renderFeed();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();

    // Show/hide clear button
    if (searchClearBtn) {
      searchClearBtn.style.display = searchQuery.length > 0 ? 'grid' : 'none';
    }

    if (suggestions) suggestions.style.display = searchQuery.length > 0 ? 'none' : 'block';

    debouncedRenderFeed();
  });

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      renderFeed();
    });
  }
}

function renderFeed() {
  const feed = $('#feed');
  if (!feed) return;

  // Rebuild trust score cache at the start of each render
  _trustScoreCache = buildTrustScoreCache();

  let problems = LS.get('anon_problems') || [];

  // Counts
  const counts = { all: problems.length, urgent: 0, help: 0, discussion: 0, advice: 0, general: 0 };
  problems.forEach(p => { if (counts[p.tag] !== undefined) counts[p.tag]++; });
  $$('.filter-item').forEach(f => {
    const c = f.querySelector('.f-count');
    if (c) c.textContent = counts[f.dataset.filter] ?? '';
  });
  // Also update category dropdown counts
  $$('.cat-dropdown-item').forEach(f => {
    const c = f.querySelector('.f-count');
    if (c) c.textContent = counts[f.dataset.filter] ?? '';
  });

  // Apply category filter
  if (activeFilter !== 'all') problems = problems.filter(p => p.tag === activeFilter);

  // Apply search filter
  if (searchQuery) {
    problems = problems.filter(p => {
      const title = (p.title || '').toLowerCase();
      const body = (p.body || '').toLowerCase();
      const author = (p.authorName || '').toLowerCase();
      const kws = (p.keywords || []).some(k => k.toLowerCase().includes(searchQuery));

      return title.includes(searchQuery) || body.includes(searchQuery) || author.includes(searchQuery) || kws;
    });
  }

  if (!problems.length) {
    if (searchQuery) {
      feed.innerHTML = `<div class="empty"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><h3>No results found</h3><p>Try searching with different keywords or username.</p></div>`;
    } else {
      feed.innerHTML = `<div class="empty"><div class="empty-icon"><i class="fa-solid fa-moon"></i></div><h3>Nothing here yet</h3><p>Be the first to share anonymously.</p></div>`;
    }
    return;
  }

  feed.innerHTML = problems.map(p => buildPost(p)).join('');
  bindPostEvents();
}

function buildPost(p) {
  const av = pickAv(p.authorName);
  const init = p.authorName.charAt(0).toUpperCase();
  const user = LS.get('anon_user');
  const liked = (p.likedBy || []).includes(user?.id);
  const tm = { urgent:'t-urgent', help:'t-help', discussion:'t-discussion', advice:'t-advice', general:'t-general' };

  const resps = (p.responses || []).map((r, ri) => {
    const nestedResps = (r.replies || []).map(nr => `
      <div class="resp-item nested">
        <div class="resp-av smaller">${nr.authorName.charAt(0).toUpperCase()}</div>
        <div style="flex: 1">
          <div class="resp-name">
            <span class="user-link">${nr.authorName}</span> <span>· ${timeAgo(nr.created)}</span>
          </div>
          <div class="resp-text">${nr.text}</div>
        </div>
      </div>`).join('');

    return `
    <div class="resp-container">
      <div class="resp-item">
        <a href="profile.html?user=${encodeURIComponent(r.authorName)}" style="text-decoration: none; color: inherit;">
          <div class="resp-av">${r.authorName.charAt(0).toUpperCase()}</div>
        </a>
        <div style="flex: 1">
          <div class="resp-name">
            <a href="profile.html?user=${encodeURIComponent(r.authorName)}" class="user-link">${r.authorName}</a> 
            <span class="trust-badge"><i class="fa-regular fa-gem"></i> ${getUserTrustScore(r.authorName)}</span> <span>· ${timeAgo(r.created)}</span>
          </div>
          <div class="resp-text">${r.text}</div>
          <div class="resp-actions">
            <button class="nested-reply-btn" data-post-id="${p.id}" data-resp-idx="${ri}"><i class="fa-solid fa-reply"></i> Reply</button>
          </div>
        </div>
        ${p.authorId === user?.id ? `
          <button class="helpful-btn ${r.isHelpful ? 'active' : ''}" data-post-id="${p.id}" data-resp-idx="${ri}" title="Mark as helpful">
            <i class="fa-solid fa-circle-check"></i>
          </button>
        ` : r.isHelpful ? `
          <div class="helpful-badge" title="Author marked this as helpful"><i class="fa-solid fa-circle-check"></i></div>
        ` : ''}
      </div>
      <div class="nested-responses">${nestedResps}</div>
      <div class="nested-input-wrap hidden" id="niw-${p.id}-${ri}">
        <input class="field-input field-input--plain smaller" placeholder="Reply to ${r.authorName}…" id="ni-${p.id}-${ri}">
        <button class="btn btn-amber btn-sm send-nested-resp" data-post-id="${p.id}" data-resp-idx="${ri}">Send</button>
      </div>
    </div>`;
  }).join('');

  const kwDisplay = (p.keywords || []).map(k => `<span class="post-keyword-pill">#${k}</span>`).join('');

  return `
    <div class="post-glass glass-static" data-id="${p.id}">
      <div class="post-top">
        <div class="post-user">
          <a href="profile.html?user=${encodeURIComponent(p.authorName)}" style="text-decoration: none; color: inherit;">
            <div class="post-avatar ${av}">${init}</div>
          </a>
          <div>
            <div class="post-name">
              <a href="profile.html?user=${encodeURIComponent(p.authorName)}" class="user-link">${p.authorName}</a> 
              <span class="trust-badge"><i class="fa-regular fa-gem"></i> ${getUserTrustScore(p.authorName)}</span>
            </div>
            <div class="post-time">${timeAgo(p.created)}</div>
          </div>
        </div>
        <span class="post-tag ${tm[p.tag] || 't-general'}">${p.tag}</span>
      </div>
      <div class="post-title">${p.title}</div>
      <div class="post-body">${p.body}</div>
      <div class="post-keyword-display">${kwDisplay}</div>
      <div class="post-actions">
        <button class="act-btn like-btn ${liked?'liked':''}" data-id="${p.id}">${liked?'<i class="fa-solid fa-heart" style="color: #ff4b4b;"></i>':'<i class="fa-regular fa-heart"></i>'} ${p.likes||0}</button>
        <button class="act-btn reply-toggle" data-id="${p.id}"><i class="fa-solid fa-comment"></i> ${p.responses?.length||0} replies</button>
        <button class="act-btn share-btn"><i class="fa-solid fa-link"></i> Share</button>
        <button class="act-btn report-btn" data-id="${p.id}" data-type="PROBLEM" style="margin-left: auto; color: var(--text-2);"><i class="fa-solid fa-flag"></i> Report</button>
      </div>
      <div class="responses-wrap hidden" id="rw-${p.id}">
        ${resps}
        <div class="resp-input-row">
          <input class="field-input field-input--plain" placeholder="Write a kind response…" id="ri-${p.id}">
          <button class="btn btn-amber btn-sm send-resp" data-id="${p.id}">Send</button>
        </div>
      </div>
    </div>`;
}

function bindPostEvents() {
  $$('.like-btn').forEach(b => {
    b.onclick = () => {
      const id = +b.dataset.id;
      const user = LS.get('anon_user');
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === id);
      if (!p) return;
      if (!p.likedBy) p.likedBy = [];
      const idx = p.likedBy.indexOf(user.id);
      if (idx > -1) { p.likedBy.splice(idx, 1); p.likes = Math.max(0, (p.likes||0)-1); }
      else { p.likedBy.push(user.id); p.likes = (p.likes||0)+1; }
      LS.set('anon_problems', all);
      renderFeed();
    };
  });

  $$('.reply-toggle').forEach(b => {
    b.onclick = () => { const w = $(`#rw-${b.dataset.id}`); if (w) w.classList.toggle('hidden'); };
  });

  $$('.helpful-btn').forEach(b => {
    b.onclick = () => {
      const pid = +b.dataset.postId;
      const ridx = +b.dataset.respIdx;
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === pid);
      if (p && p.responses && p.responses[ridx]) {
        p.responses[ridx].isHelpful = !p.responses[ridx].isHelpful;
        LS.set('anon_problems', all);
        renderFeed();
      }
    };
  });

  $$('.report-btn').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.id;
      const type = b.dataset.type;
      openReportModal(id, type);
    };
  });

  $$('.nested-reply-btn').forEach(b => {
    b.onclick = () => {
      const pid = b.dataset.postId;
      const ridx = b.dataset.respIdx;
      const w = $(`#niw-${pid}-${ridx}`);
      if (w) w.classList.toggle('hidden');
    };
  });

  $$('.send-nested-resp').forEach(b => {
    b.onclick = () => {
      const pid = +b.dataset.postId;
      const ridx = +b.dataset.respIdx;
      const input = $(`#ni-${pid}-${ridx}`);
      const text = input?.value.trim();
      if (!text) return toast('Write something', 'error');

      if (containsRestrictedContent(text)) {
        return toast('Please remove abusive or 18+ content', 'error');
      }

      const uname = LS.get('anon_username');
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === pid);
      if (p && p.responses && p.responses[ridx]) {
        if (!p.responses[ridx].replies) p.responses[ridx].replies = [];
        p.responses[ridx].replies.push({
          text,
          authorName: uname,
          created: new Date().toISOString()
        });
        LS.set('anon_problems', all);
        input.value = '';
        renderFeed();
        toast('Reply sent', 'success');
      }
    };
  });

  $$('.send-resp').forEach(b => {
    b.onclick = () => {
      const id = +b.dataset.id;
      const input = $(`#ri-${id}`);
      const text = input?.value.trim();
      if (!text) return toast('Write something', 'error');

      if (containsRestrictedContent(text)) {
        return toast('Please remove abusive or 18+ content', 'error');
      }

      const uname = LS.get('anon_username');
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === id);
      if (!p) return;
      if (!p.responses) p.responses = [];
      p.responses.push({ id: Date.now(), text, authorName: isAnon ? randomName() : uname, created: new Date().toISOString() });
      LS.set('anon_problems', all);
      toast('Reply sent <i class="fa-solid fa-comment"></i>', 'success');
      renderFeed();
    };
  });

  $$('.share-btn').forEach(b => {
    b.onclick = () => {
      const postCard = b.closest('.post-glass');
      const postId = postCard ? postCard.dataset.id : '';
      const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast('Link copied to clipboard!', 'success');
        }).catch(() => {
          toast('Link copied!', 'success');
        });
      } else {
        toast('Link copied!', 'success');
      }
    };
  });
}

// ════════════════════════════════════════
// SEED DATA
// ════════════════════════════════════════
function seedData() {
  return [
    {
      id: 1, title: 'Struggling with social anxiety at college',
      body: 'I just started college and find it really hard to talk to people. Every time I try to join a conversation, I freeze. Does anyone have tips?',
      tag: 'help', authorName: 'SilentPhoenix42', authorId: 0, isAnonymous: true,
      likes: 24, likedBy: [],
      responses: [
        { id: 101, text: 'Start small — say hi to one person a day. It builds up!', authorName: 'GentleOwl88', created: new Date(Date.now() - 3600000).toISOString() },
        { id: 102, text: 'Join a club around your interests. Common ground helps.', authorName: 'BraveFalcon55', created: new Date(Date.now() - 7200000).toISOString() }
      ],
      created: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2, title: 'How to deal with developer burnout?',
      body: "Been coding 10+ hours daily for months. The passion is gone. Everything feels like a chore. How do you recover?",
      tag: 'discussion', authorName: 'MysticWolf77', authorId: 0, isAnonymous: true,
      likes: 42, likedBy: [],
      responses: [
        { id: 201, text: 'Take a real break. Not a weekend — a full week off code.', authorName: 'CalmTiger23', created: new Date(Date.now() - 1800000).toISOString() }
      ],
      created: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3, title: 'Family pressure about career choices',
      body: "Parents want me to be a doctor but I'm passionate about art. They say art won't pay bills. I feel stuck between my dream and family expectations.",
      tag: 'urgent', authorName: 'CosmicEagle19', authorId: 0, isAnonymous: true,
      likes: 67, likedBy: [], responses: [],
      created: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 4, title: 'Budgeting tips for students?',
      body: "Terrible with money. Always broke by mid-month. Need practical budgeting advice for someone with limited income.",
      tag: 'advice', authorName: 'NeonPanda66', authorId: 0, isAnonymous: true,
      likes: 15, likedBy: [],
      responses: [
        { id: 401, text: '50/30/20 rule: 50% needs, 30% wants, 20% savings. Track everything!', authorName: 'WildHawk44', created: new Date(Date.now() - 5400000).toISOString() }
      ],
      created: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 5, title: 'Feeling lost after graduation',
      body: "Graduated 3 months ago with no plan. Everyone seems sorted. I feel like I'm falling behind. Anyone else feel this?",
      tag: 'general', authorName: 'VelvetRaven31', authorId: 0, isAnonymous: true,
      likes: 33, likedBy: [],
      responses: [
        { id: 501, text: "Comparison is the thief of joy. Most people are just as lost.", authorName: 'FrostDragon12', created: new Date(Date.now() - 9000000).toISOString() },
        { id: 502, text: "There's no universal timeline for success. Be kind to yourself.", authorName: 'EmberSparrow99', created: new Date(Date.now() - 4500000).toISOString() }
      ],
      created: new Date(Date.now() - 432000000).toISOString()
    }
  ];
}

// ════════════════════════════════════════
// REPORT MODAL
// ════════════════════════════════════════
function openReportModal(targetId, targetType) {
  // Create modal overlay if it doesn't exist
  let overlay = document.getElementById('reportModalOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'reportModalOverlay';
  overlay.className = 'modal-overlay show';
  overlay.innerHTML = `
    <div class="modal-glass" style="max-width: 460px;">
      <div class="modal-top">
        <h3><i class="fa-solid fa-flag"></i> Report ${targetType === 'USER' ? 'User' : 'Content'}</h3>
        <button class="modal-close" id="reportModalClose"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <p style="color: var(--text-dim); font-size: 0.88rem; margin-bottom: 18px;">
        Help us maintain a safe community. Please describe why you're reporting this ${targetType.toLowerCase()}.
      </p>
      <div class="field">
        <label class="field-label">Reason</label>
        <textarea class="field-textarea" id="reportReasonInput" placeholder="Describe the issue..." style="min-height: 100px;"></textarea>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
        <button class="btn btn-ghost btn-sm" id="reportCancelBtn">Cancel</button>
        <button class="btn btn-sm" id="reportSubmitBtn" style="background: rgba(239,68,68,0.7); color: #fff;"><i class="fa-solid fa-flag"></i> Submit Report</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const closeModal = () => overlay.remove();
  document.getElementById('reportModalClose').onclick = closeModal;
  document.getElementById('reportCancelBtn').onclick = closeModal;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Submit handler
  document.getElementById('reportSubmitBtn').onclick = () => {
    const reason = document.getElementById('reportReasonInput').value.trim();
    if (!reason) return toast('Please provide a reason', 'error');

    const uname = LS.get('anon_username') || 'Anonymous';
    const reports = LS.get('anon_reports') || [];
    reports.push({
      id: Date.now(),
      targetType,
      targetId: String(targetId),
      reason,
      reportedBy: uname,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    LS.set('anon_reports', reports);
    closeModal();
    toast('Report submitted. Thank you for helping keep the community safe.', 'success');
  };
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  initDropdowns();

  // Reset globals to prevent state leaking between navigations
  isAnon = false;
  activeFilter = 'all';
  searchQuery = '';
  _trustScoreCache = null;

  switch (page) {
    case 'auth': initAuth(); break;
    case 'username': initUsername(); break;
    case 'dashboard': initDashboard(); break;
    case 'community': initCommunity(); break;
    case 'profile': initProfile(); break;
    case 'admin': initAdmin(); break;
  }
});

// ════════════════════════════════════════
// PAGE 6: ADMIN (delegates to admin-panel.js)
// ════════════════════════════════════════
function initAdmin() {
  if (typeof initAdminPanel === 'function') return initAdminPanel();

  // Fallback if admin-panel.js not loaded
  const loginSec = $('#adminLoginSection');
  const dashSec = $('#adminDashboardSection');
  const loginForm = $('#adminLoginForm');
  const logoutBtn = $('#adminLogoutBtn');

  const ADMIN_ID = 'admin';
  const ADMIN_PASS = 'admin123';

  // Check login state
  if (sessionStorage.getItem('admin_auth') === 'true') {
    showDashboard();
  }

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const id = $('#adminId').value.trim();
      const pass = $('#adminPass').value.trim();
      
      if (id === ADMIN_ID && pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_auth', 'true');
        toast('Admin access granted', 'success');
        showDashboard();
      } else {
        toast('Invalid admin credentials', 'error');
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem('admin_auth');
      dashSec.style.display = 'none';
      loginSec.style.display = 'grid';
      toast('Admin logged out', 'info');
    };
  }

  // Tabs
  $$('.admin-tab-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      $$('.panel-section').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`#${btn.dataset.target}`).classList.add('active');
    };
  });

  function showDashboard() {
    loginSec.style.display = 'none';
    dashSec.style.display = 'block';
    renderAdminData();
  }

  function renderAdminData() {
    const users = LS.get('anon_users') || [];
    let problems = LS.get('anon_problems') || [];

    // Stats
    let totalResp = 0;
    problems.forEach(p => totalResp += (p.responses ? p.responses.length : 0));
    
    $('#adminStatUsers').textContent = users.length;
    $('#adminStatPosts').textContent = problems.length;
    $('#adminStatResponses').textContent = totalResp;

    // Render Users
    const utbody = $('#adminUsersTbody');
    if (utbody) {
      utbody.innerHTML = users.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${u.username || '<i>No identity yet</i>'}</td>
          <td>${u.email}</td>
          <td>${u.trustScore || 0}</td>
          <td>
            <button class="action-btn" onclick="window.deleteAdminUser(${u.id})">
              <i class="fa-solid fa-trash"></i> Delete User
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Render Posts
    const ptbody = $('#adminPostsTbody');
    if (ptbody) {
      ptbody.innerHTML = problems.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${p.authorName || 'Unknown'}</td>
          <td>${p.title.length > 30 ? p.title.substring(0,30)+'...' : p.title}</td>
          <td>${new Date(p.created).toLocaleDateString()}</td>
          <td>
            <button class="action-btn" onclick="window.deleteAdminPost(${p.id})">
              <i class="fa-solid fa-trash"></i> Delete Post
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Render Reports
    const rtbody = $('#adminReportsTbody');
    if (rtbody) {
      const reports = LS.get('anon_reports') || [];
      rtbody.innerHTML = reports.map(r => `
        <tr>
          <td>${r.id}</td>
          <td><span class="trust-badge">${r.targetType}</span></td>
          <td>${r.reason.length > 40 ? r.reason.substring(0,40)+'...' : r.reason}</td>
          <td>${r.reportedBy}</td>
          <td>${r.status}</td>
          <td>
            <button class="action-btn" style="background: rgba(0, 200, 0, 0.2); border-color: rgba(0,200,0,0.3);" onclick="window.dismissReport(${r.id})">
              <i class="fa-solid fa-check"></i> Dismiss
            </button>
            <button class="action-btn" onclick="window.deleteReportTarget(${r.id})">
              <i class="fa-solid fa-trash"></i> Delete ${r.targetType.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Global Delete Functions for inline onclick
  window.deleteAdminUser = async (userId) => {
    if(!confirm('Are you sure you want to delete this user? ALL THEIR POSTS WILL ALSO BE DELETED.')) return;
    
    try {
      const res = await fetch('/api/users/' + userId, { method: 'DELETE' });
      if (res.ok) {
        toast('User & their posts deleted via API', 'success');
        renderAdminData();
        return;
      }
    } catch(e) {}

    let users = LS.get('anon_users') || [];
    const userToDel = users.find(u => String(u.id) === String(userId));
    
    if (userToDel) {
      users = users.filter(u => String(u.id) !== String(userId));
      LS.set('anon_users', users);

      let problems = LS.get('anon_problems') || [];
      problems = problems.filter(p => !((p.authorId && String(p.authorId) === String(userId)) || (p.authorName && p.authorName === userToDel.username)));
      
      // Also remove their responses from other posts
      problems.forEach(p => {
        if(p.responses) p.responses = p.responses.filter(r => !((r.authorId && String(r.authorId) === String(userId)) || (r.authorName && r.authorName === userToDel.username)));
      });

      LS.set('anon_problems', problems);
      toast('User & their posts deleted locally', 'success');
      renderAdminData();
    }
  };

  window.deleteAdminPost = async (postId) => {
    if(!confirm('Delete this post?')) return;
    try {
      const res = await fetch('/api/problems/' + postId, { method: 'DELETE' });
      if (res.ok) {
        toast('Post deleted via API', 'success');
        renderAdminData();
        return;
      }
    } catch(e) {}

    let problems = LS.get('anon_problems') || [];
    problems = problems.filter(p => String(p.id) !== String(postId));
    LS.set('anon_problems', problems);
    toast('Post deleted locally', 'success');
    renderAdminData();
  };

  window.dismissReport = (reportId) => {
    let reports = LS.get('anon_reports') || [];
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    report.status = 'RESOLVED';
    LS.set('anon_reports', reports);
    toast('Report dismissed', 'info');
    renderAdminData();
  };

  window.deleteReportTarget = async (reportId) => {
    let reports = LS.get('anon_reports') || [];
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (!confirm(`Are you sure you want to delete this ${report.targetType}?`)) return;

    try {
      if (report.targetType === 'PROBLEM') {
        await fetch('/api/problems/' + report.targetId, { method: 'DELETE' });
      } else if (report.targetType === 'USER') {
        await fetch('/api/users/' + report.targetId, { method: 'DELETE' });
      }
    } catch(e) {}

    if (report.targetType === 'PROBLEM') {
      let problems = LS.get('anon_problems') || [];
      problems = problems.filter(p => String(p.id) !== String(report.targetId));
      LS.set('anon_problems', problems);
    } else if (report.targetType === 'USER') {
      let users = LS.get('anon_users') || [];
      const userToDel = users.find(u => String(u.username) === String(report.targetId)); 
      if (userToDel) {
        users = users.filter(u => u.username !== userToDel.username);
        LS.set('anon_users', users);
        
        let problems = LS.get('anon_problems') || [];
        problems = problems.filter(p => !(p.authorName === userToDel.username));
        // Remove responses
        problems.forEach(p => {
          if(p.responses) p.responses = p.responses.filter(r => !(r.authorName === userToDel.username));
        });
        LS.set('anon_problems', problems);
      }
    }
    
    // Set report as resolved because the target has been acted upon
    report.status = 'RESOLVED';
    LS.set('anon_reports', reports);
    
    toast('Target deleted and report resolved', 'success');
    renderAdminData();
  };
}

function initProfile() {
  const user = guardAuth(); if (!user) return;
  const myUname = guardUsername(); if (!myUname) return;

  const urlParams = new URLSearchParams(window.location.search);
  const targetUser = urlParams.get('user') || myUname;
  const isMyProfile = targetUser === myUname;

  const profileName = document.querySelector('#profileName');
  const profileAvatar = document.querySelector('#profileAvatar');
  const profileTrustScore = document.querySelector('#profileTrustScore');
  const profileEmail = document.querySelector('#profileEmail');
  const profileFeed = document.querySelector('#profileFeed');
  const settingsCard = document.querySelector('.settings-card');
  const userEmailDisplay = profileEmail ? profileEmail.parentElement : null;
  const dashHeroH1 = document.querySelector('.dash-hero h1');
  const dashHeroP = document.querySelector('.dash-hero p');

  if (!isMyProfile) {
    if (dashHeroH1) dashHeroH1.textContent = `${targetUser}'s Profile`;
    if (dashHeroP) dashHeroP.textContent = "Viewing community member";
    if (settingsCard) settingsCard.style.display = 'none'; 
    if (userEmailDisplay) userEmailDisplay.style.display = 'none';
    
    const reportUserBtn = document.querySelector('#reportUserBtn');
    if (reportUserBtn) {
      reportUserBtn.style.display = 'block';
      reportUserBtn.onclick = () => openReportModal(targetUser, 'USER');
    }
  } else {
    if (dashHeroH1) dashHeroH1.textContent = "Your Profile";
    if (dashHeroP) dashHeroP.textContent = "Manage your identity and account settings";
    if (profileEmail) profileEmail.textContent = user.email || 'user@email.com';
  }

  if (profileName) profileName.textContent = targetUser;
  if (profileAvatar) {
    profileAvatar.textContent = targetUser.charAt(0).toUpperCase();
    profileAvatar.className = `post-avatar ${pickAv(targetUser)}`;
    profileAvatar.style.width = '80px';
    profileAvatar.style.height = '80px';
    profileAvatar.style.fontSize = '2.5rem';
    profileAvatar.style.margin = '0 auto 20px';
    profileAvatar.style.display = 'flex';
    profileAvatar.style.alignItems = 'center';
    profileAvatar.style.justifyContent = 'center';
  }
  
  if (profileTrustScore) {
    const score = getUserTrustScore(targetUser);
    profileTrustScore.innerHTML = `<i class="fa-regular fa-gem"></i> ${score}`;
  }

  // Settings Actions
  if (isMyProfile) {
    const btnChangeId = document.querySelector('#settingChangeId');
    const btnUpdateEmail = document.querySelector('#settingUpdateEmail');
    const btnChangePass = document.querySelector('#settingChangePass');
    const btnClearPosts = document.querySelector('#settingClearPosts');
    const btnLogout = document.querySelector('#settingLogout');

    if (btnChangeId) {
      btnChangeId.addEventListener('click', () => {
        const cUser = LS.get('anon_user');
        if (cUser && (cUser.identity_changes || 0) >= 3) {
          return toast('Identity changes limit reached (3/3)', 'error');
        }
        window.location.href = 'username.html?change=1';
      });
    }

    if (btnUpdateEmail) {
      btnUpdateEmail.addEventListener('click', () => {
        const newEmail = prompt('Enter your new email address:', user.email);
        if (newEmail && newEmail.trim() !== '') {
          user.email = newEmail.trim();
          LS.set('anon_user', user);
          
          // update user in anon_users list
          const users = LS.get('anon_users') || [];
          const uIndex = users.findIndex(u => u.id === user.id);
          if (uIndex !== -1) {
            users[uIndex] = user;
            LS.set('anon_users', users);
          }
          
          if (profileEmail) profileEmail.textContent = user.email;
          populateDropdown();
          toast('Email updated successfully ', 'success');
        }
      });
    }

    if (btnChangePass) {
      btnChangePass.addEventListener('click', () => {
        const newPass = prompt('Enter your new password:');
        if (newPass && newPass.length >= 6) {
          user.password = newPass;
          LS.set('anon_user', user);
          
          // update user in anon_users list
          const users = LS.get('anon_users') || [];
          const uIndex = users.findIndex(u => u.id === user.id);
          if (uIndex !== -1) {
            users[uIndex] = user;
            LS.set('anon_users', users);
          }
          toast('Password changed successfully <i class="fa-solid fa-lock"></i>', 'success');
        } else if (newPass) {
          toast('Password must be at least 6 characters', 'error');
        }
      });
    }

    if (btnClearPosts) {
      btnClearPosts.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all your posts? This cannot be undone.')) {
          let problems = LS.get('anon_problems') || [];
          const wasLen = problems.length;
          problems = problems.filter(p => p.authorName !== targetUser);
          
          if (problems.length < wasLen) {
             LS.set('anon_problems', problems);
             toast('All your posts cleared <i class="fa-solid fa-trash"></i>', 'info');
             setTimeout(() => location.reload(), 500);
          } else {
             toast('You have no posts to clear', 'info');
          }
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        LS.del('anon_user');
        LS.del('anon_username');
        toast('Logged out', 'info');
        setTimeout(() => window.location.href = 'auth.html', 500);
      });
    }
  }

  if (profileFeed) {
    const problems = LS.get('anon_problems') || [];
    const mine = problems.filter(p => p.authorName === targetUser).sort((a,b) => new Date(b.created) - new Date(a.created));
    
    if (mine.length === 0) {
      profileFeed.innerHTML = `<div class="empty"><div class="empty-icon"><i class="fa-solid fa-moon"></i></div><h3>No activity yet</h3><p>${isMyProfile ? "You haven't" : "This user hasn't"} posted anything.</p></div>`;
    } else {
      profileFeed.innerHTML = mine.map(p => buildPost(p)).join('');
      bindPostEvents();
    }
  }

  populateDropdown();
  initTaskbar();
}