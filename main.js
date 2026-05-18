// =============================================
// NOOR-E-ISLAM — Main JavaScript
// =============================================

const CITY = "Karachi";
const COUNTRY = "Pakistan";
const METHOD = 1;

// CLOCK
function updateClock() {
  const now = new Date();
  const t = document.getElementById('current-time');
  const d = document.getElementById('gregorian-today');
  if(t) t.textContent = now.toLocaleTimeString('ur-PK',{hour:'2-digit',minute:'2-digit'});
  if(d) d.textContent = now.toLocaleDateString('ur-PK',{day:'numeric',month:'long',year:'numeric'});
}
updateClock();
setInterval(updateClock, 1000);

// PRAYER TIMES
async function fetchPrayerTimes() {
  const now = new Date();
  const url = `https://api.aladhan.com/v1/timingsByCity/${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if(data.code===200) {
      const t = data.data.timings;
      const el = document.getElementById('ticker-namaz');
      if(el) el.textContent = `🕌 فجر: ${t.Fajr} | ظہر: ${t.Dhuhr} | عصر: ${t.Asr} | مغرب: ${t.Maghrib} | عشاء: ${t.Isha}`;
    }
  } catch(e){}
}

// HIJRI DATE
async function fetchHijriDate() {
  const now = new Date();
  const url = `https://api.aladhan.com/v1/gToH/${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if(data.code===200) {
      const h = data.data.hijri;
      const str = `${h.day} ${h.month.ar} ${h.year}ھ`;
      document.querySelectorAll('#hijri-today, .hijri-today').forEach(el => el.textContent = str);
    }
  } catch(e){}
}

// WEEKLY TABLE (only on namaz page)
async function fetchWeeklyTimes() {
  const tbody = document.getElementById('weekly-tbody');
  if(!tbody) return;
  const city = window._prayerCity || CITY;
  const country = window._prayerCountry || COUNTRY;
  const days = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ 🕌','ہفتہ'];
  tbody.innerHTML = '';
  for(let i=0;i<7;i++){
    const date = new Date();
    date.setDate(date.getDate()+i);
    const d=date.getDate(),mo=date.getMonth()+1,y=date.getFullYear();
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${d}-${mo}-${y}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${METHOD}`);
      const data = await res.json();
      if(data.code===200){
        const t=data.data.timings;
        tbody.innerHTML+=`<tr class="${i===0?'today-row':''}">
          <td class="day-col">${days[date.getDay()]}${i===0?' ⭐':''}</td>
          <td>${t.Fajr}</td><td>${t.Sunrise}</td><td>${t.Dhuhr}</td>
          <td>${t.Asr}</td><td>${t.Maghrib}</td><td>${t.Isha}</td>
        </tr>`;
      }
    }catch(e){}
  }
}

// NAV ACTIVE
const pg = window.location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('nav a').forEach(a=>{
  a.classList.remove('active');
  if(a.getAttribute('href')===pg||(pg===''&&a.getAttribute('href')==='index.html')) a.classList.add('active');
});

// INIT
fetchPrayerTimes();
fetchHijriDate();
