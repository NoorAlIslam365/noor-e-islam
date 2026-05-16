// =============================================
// NOOR-E-ISLAM — Main JavaScript
// Automatic Prayer Times + Hijri Date API
// =============================================

// ===== CITY SETTINGS (Yahan apna shehar badlein) =====
const CITY = "Karachi";
const COUNTRY = "Pakistan";
const METHOD = 1; // 1 = University of Islamic Sciences, Karachi

// =============================================
// CLOCK & DATE (Live)
// =============================================
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('current-time');
  const dateEl = document.getElementById('gregorian-today');
  const dateFullEl = document.getElementById('gregorian-full');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  if (dateFullEl) dateFullEl.textContent = now.toLocaleDateString('ur-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);

// =============================================
// PRAYER TIMES API (Aladhan.com — Bilkul Free)
// =============================================
async function fetchPrayerTimes() {
  const today = new Date();
  const d = today.getDate();
  const mo = today.getMonth() + 1;
  const y = today.getFullYear();
  const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${mo}-${y}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 200) {
      const t = data.data.timings;
      const prayers = {
        fajr: t.Fajr, sunrise: t.Sunrise,
        dhuhr: t.Dhuhr, asr: t.Asr,
        maghrib: t.Maghrib, isha: t.Isha
      };
      updatePrayerDisplays(prayers);
      findNextPrayer(prayers);
      startCountdown(prayers);
    }
  } catch (e) { console.log('Prayer API error:', e); }
}

function updatePrayerDisplays(prayers) {
  const map = {
    'fajr-time': prayers.fajr,
    'sunrise-time': prayers.sunrise,
    'dhuhr-time': prayers.dhuhr,
    'asr-time': prayers.asr,
    'maghrib-time': prayers.maghrib,
    'isha-time': prayers.isha
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
  const ticker = document.getElementById('ticker-namaz');
  if (ticker) ticker.textContent = `🕌 فجر: ${prayers.fajr} | ظہر: ${prayers.dhuhr} | عصر: ${prayers.asr} | مغرب: ${prayers.maghrib} | عشاء: ${prayers.isha}`;
}

function findNextPrayer(prayers) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const list = [
    { name: 'فجر',  time: prayers.fajr,    id: 'card-fajr' },
    { name: 'ظہر',  time: prayers.dhuhr,   id: 'card-dhuhr' },
    { name: 'عصر',  time: prayers.asr,     id: 'card-asr' },
    { name: 'مغرب', time: prayers.maghrib, id: 'card-maghrib' },
    { name: 'عشاء', time: prayers.isha,    id: 'card-isha' }
  ];
  let next = list[0];
  for (const p of list) {
    const [h, m] = p.time.split(':').map(Number);
    if (h * 60 + m > cur) { next = p; break; }
  }
  list.forEach(p => {
    const c = document.getElementById(p.id);
    if (c) {
      c.classList.remove('next-prayer');
      const b = c.querySelector('.next-badge');
      if (b) b.remove();
    }
  });
  const card = document.getElementById(next.id);
  if (card) {
    card.classList.add('next-prayer');
    const badge = document.createElement('div');
    badge.className = 'next-badge';
    badge.textContent = 'اگلی نماز';
    card.appendChild(badge);
  }
  const lbl = document.getElementById('countdown-prayer');
  if (lbl) lbl.textContent = `${next.name} کی نماز — ${next.time}`;
  window._nextPrayerTime = next.time;
}

function startCountdown(prayers) {
  findNextPrayer(prayers);
  setInterval(() => {
    const el = document.getElementById('countdown');
    if (!el || !window._nextPrayerTime) return;
    const now = new Date();
    const [h, m] = window._nextPrayerTime.split(':').map(Number);
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const diff = next - now;
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    el.textContent = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
  }, 1000);
}

// =============================================
// HIJRI DATE API (Automatic)
// =============================================
async function fetchHijriDate() {
  const today = new Date();
  const d = today.getDate();
  const mo = today.getMonth() + 1;
  const y = today.getFullYear();
  const url = `https://api.aladhan.com/v1/gToH/${d}-${mo}-${y}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 200) {
      const h = data.data.hijri;
      const hijriStr = `${h.day} ${h.month.ar} ${h.year}ھ`;
      document.querySelectorAll('.hijri-today').forEach(el => el.textContent = hijriStr);
      const headerEl = document.getElementById('hijri-today');
      if (headerEl) headerEl.textContent = hijriStr;
    }
  } catch (e) { console.log('Hijri API error:', e); }
}

// =============================================
// WEEKLY PRAYER TIMES TABLE
// =============================================
async function fetchWeeklyTimes() {
  const tbody = document.getElementById('weekly-tbody');
  if (!tbody) return;
  const days = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ 🕌','ہفتہ'];
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--gold-light); padding:1rem;">⏳ اوقات لوڈ ہو رہے ہیں...</td></tr>';
  tbody.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const d = date.getDate(), mo = date.getMonth() + 1, y = date.getFullYear();
    const dayIdx = date.getDay();
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${d}-${mo}-${y}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`);
      const data = await res.json();
      if (data.code === 200) {
        const t = data.data.timings;
        tbody.innerHTML += `
          <tr class="${i === 0 ? 'today-row' : ''}">
            <td class="day-name">${days[dayIdx]}${i === 0 ? ' ⭐' : ''}</td>
            <td>${t.Fajr}</td><td>${t.Sunrise}</td><td>${t.Dhuhr}</td>
            <td>${t.Asr}</td><td>${t.Maghrib}</td><td>${t.Isha}</td>
          </tr>`;
      }
    } catch (e) {}
  }
}

// =============================================
// NAV ACTIVE LINK
// =============================================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(a => {
  a.classList.remove('active');
  if (a.getAttribute('href') === currentPage || (currentPage === '' && a.getAttribute('href') === 'index.html')) {
    a.classList.add('active');
  }
});

// =============================================
// TAB & FILTER BUTTONS
// =============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.content-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.names-filter').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// =============================================
// INIT
// =============================================
fetchPrayerTimes();
fetchHijriDate();
fetchWeeklyTimes();
