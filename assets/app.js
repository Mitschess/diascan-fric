/* DiaScan — aplikasi pasien + dasbor tenaga kesehatan (prototipe, mode demo). */
(function () {
  'use strict';
  const { ic, CLASSES, assess, ADVICE, HEAL, healTrack, HEAL_INFO, DANGER_SIGNS, urgentCheck, PHOTOS, photoImage, photoDets, seed, HOSPITALS } = window.DS;
  const KEY = 'diascan-demo-v1', MODE_KEY = 'diascan-mode';
  const root = document.getElementById('app');
  const toastZone = document.getElementById('toasts');
  const fileInput = document.getElementById('fileInput');

  // ---------- penyimpanan (per peramban) ----------
  const readLS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  let S = null;
  try { const o = JSON.parse(readLS(KEY) || 'null'); if (o && o.v === 3) S = o; } catch (e) { S = null; }
  if (!S) S = seed(new Date());
  function persist() {
    if (writeLS(KEY, JSON.stringify(S))) return;
    for (const s of S.scans) {
      if (s.image.src && s.image.src.startsWith('data:')) { s.image.src = null; if (writeLS(KEY, JSON.stringify(S))) return; }
    }
  }

  // ---------- state tampilan ----------
  const hash = (location.hash || '').replace('#', '');
  const U = {
    mode: hash === 'nakes' || hash === 'pasien' ? hash : (readLS(MODE_KEY) === 'nakes' ? 'nakes' : 'pasien'),
    pv: 'home', pStack: [], scanId: null, histTab: 'area', foot: 'Kanan', sheet: null, sheetId: null,
    analyzing: null, cam: null, showBoxes: true, showMask: false,
    cv: 'dash', sel: null, fPri: 'Semua', fSt: 'aktif', q: '', compare: false, selPatient: 'p2',
    modal: null, training: null, noteDraft: '', pNote: '', urgent: null,
  };

  // ---------- util ----------
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONF = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = v => Math.round(v * 100) + '%';
  const fmtNum = v => String(v.toFixed(1)).replace('.', ',');
  const fmtArea = v => fmtNum(v) + ' cm²';
  const D = iso => new Date(iso);
  const fmtTime = iso => { const d = D(iso); return String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
  const shortDate = iso => { const d = D(iso); return d.getDate() + ' ' + MON[d.getMonth()]; };
  const fmtDate = iso => { const d = D(iso); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
  const dayDiff = iso => { const a = new Date(); a.setHours(0, 0, 0, 0); const b = D(iso); b.setHours(0, 0, 0, 0); return Math.round((a - b) / 864e5); };
  const relDate = iso => { const k = dayDiff(iso); return k === 0 ? 'Hari ini, ' + fmtTime(iso) : k === 1 ? 'Kemarin, ' + fmtTime(iso) : shortDate(iso) + ', ' + fmtTime(iso); };
  const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const byDate = (a, b) => D(a.date) - D(b.date);
  let uid = 0;
  const patient = id => S.patients.find(p => p.id === id);
  const scanById = id => S.scans.find(s => s.id === id);
  const scansOf = pid => S.scans.filter(s => s.patientId === pid).sort(byDate);
  const myScans = () => scansOf(S.me);
  const PRI = { Tinggi: 0, Sedang: 1, Rendah: 2 };
  const ST_ORDER = { Menunggu: 0, Ditinjau: 1, Dirujuk: 2, Divalidasi: 3, Tersimpan: 4 };
  const STATUS = {
    Tersimpan: { chip: 't-blue', cls: 's-saved', label: 'Belum dikirim' },
    Menunggu: { chip: 't-gray', cls: 's-wait', label: 'Menunggu' },
    Ditinjau: { chip: 't-amber', cls: 's-review', label: 'Ditinjau' },
    Divalidasi: { chip: 't-green', cls: 's-valid', label: 'Divalidasi' },
    Dirujuk: { chip: 't-red', cls: 's-ref', label: 'Dirujuk' },
  };
  const PRI_CHIP = { Tinggi: 't-red', Sedang: 't-amber', Rendah: 't-green' };
  const CLS_CHIP = { ulkus: 't-red', infeksi: 't-amber', nekrosis: 't-violet', kalus: 't-blue' };
  const statusChip = s => `<span class="chip ${STATUS[s.status].chip}">${STATUS[s.status].label}</span>`;
  const urgentChip = s => s.urgent ? '<span class="chip t-red">Keluhan</span>' : '';
  const findingsText = s => s.detections.length ? [...new Set(s.detections.map(d => CLASSES[d.cls].label))].join(' · ') : 'Tidak ada temuan';
  const headline = s => {
    const has = c => s.detections.some(d => d.cls === c);
    return has('nekrosis') ? 'Nekrosis terdeteksi' : has('ulkus') ? 'Ulkus terdeteksi' : has('kalus') ? 'Kalus terdeteksi' : 'Tidak ada temuan';
  };
  function prevScan(s) {
    const list = scansOf(s.patientId).filter(x => D(x.date) < D(s.date) && x.foot === s.foot);
    return list[list.length - 1] || null;
  }
  // ---------- pemantauan penyembuhan ----------
  const trackOf = pid => healTrack(scansOf(pid));
  const pointOf = s => { const t = trackOf(s.patientId); return t ? t.pts.find(p => p.id === s.id) || null : null; };
  const healChip = st => `<span class="chip ${HEAL_INFO[st].chip}">${HEAL_INFO[st].label}</span>`;
  const pctTxt = v => Math.round(v * 100) + '%';
  function healReason(p) {
    if (p.status === 'awal') return `Foto awal · target turun 50% dalam ${HEAL.weeks} minggu`;
    if (p.red < 0) return `Membesar ${pctTxt(-p.red)} dari foto awal (target turun ${pctTxt(p.tgt)})`;
    return `Turun ${pctTxt(p.red)} dari foto awal (target ${pctTxt(p.tgt)})`;
  }
  function dueLabel(d) {
    const k = -dayDiff(d.toISOString());
    if (k === 0) return 'Hari ini';
    if (k === 1) return 'Besok, ' + shortDate(d.toISOString());
    if (k > 1) return `${DAYS[d.getDay()]}, ${shortDate(d.toISOString())} (${k} hari lagi)`;
    return `Terlambat ${-k} hari`;
  }
  const weekLabel = w => w > HEAL.weeks ? `Minggu ke-${w} · setelah titik keputusan (minggu ke-${HEAL.weeks})`
    : w === HEAL.weeks ? `Minggu ke-${w} · titik keputusan` : `Minggu ke-${w} dari ${HEAL.weeks}`;
  function toast(msg, icon = 'check') {
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = ic(icon, 16, 2.4) + '<span>' + esc(msg) + '</span>';
    toastZone.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  function log(icon, tone, text) { S.activity.unshift({ icon, tone, text, date: new Date().toISOString() }); S.activity = S.activity.slice(0, 30); }

  // ---------- foto + kotak deteksi ----------
  function imgInner(s, fit = 'meet') {
    const im = s.image || s;
    if (!im.src) return `<div class="empty" style="position:absolute;inset:0;align-content:center">${ic('image', 22)}<span class="small">Foto tidak tersimpan</span></div>`;
    return `<img src="${im.src}" alt="Foto telapak kaki yang dipindai" style="object-fit:${fit === 'slice' ? 'cover' : 'contain'}">`;
  }
  const ratioOf = im => im.w / im.h;
  function boxHTML(d, dets, labels = true) {
    const [x, y, w, h] = d.box, c = CLASSES[d.cls];
    const below = y < 0.11 || (d.cls === 'ulkus' && dets.some(o => o.cls === 'infeksi'));
    const txt = c.label + ' ' + (d.manual ? '(manual)' : pct(d.conf));
    return `<div class="bx${below ? ' lb' : ''}" style="--c:${c.color};left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%">${labels ? `<i>${txt}</i>` : ''}</div>`;
  }
  function photo(s, { boxes = true, mask = false, tags = '' } = {}) {
    const bx = boxes ? s.detections.filter(d => d.box).map(d => boxHTML(d, s.detections)).join('') : '';
    const mk = mask && s.image.mask ? `<img class="mask" src="${s.image.mask}" alt="">` : '';
    return `<div class="photo" style="aspect-ratio:${ratioOf(s.image).toFixed(4)}">${imgInner(s)}${mk}${bx}${tags}</div>`;
  }
  const srcNote = s => s.image.ref
    ? `Foto asli dari Wound Image Dataset (${esc(s.image.ref)}). Kotak dihitung dari mask anotasi dataset, belum dari model YOLO terlatih.`
    : 'Mode demo: kotak dari pencarian area kemerahan sederhana, bukan hasil model YOLO terlatih.';
  const thumb = (s, cls = '') => `<span class="thumb ${cls}">${imgInner(s, 'slice')}</span>`;

  // ---------- simulasi deteksi untuk foto unggahan / kamera ----------
  // Bukan model YOLO: mencari area kemerahan terbesar sebagai pengganti hasil deteksi.
  function analyzeImage(src, sw, sh) {
    const r = Math.min(1, 112 / Math.max(sw, sh));
    const W = Math.max(8, Math.round(sw * r)), H = Math.max(8, Math.round(sh * r));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(src, 0, 0, W, H);
    let data; try { data = cx.getImageData(0, 0, W, H).data; } catch (e) { return []; }
    const N = W * H, red = new Float32Array(N), lum = new Float32Array(N);
    let sum = 0, sum2 = 0, lsum = 0;
    for (let i = 0; i < N; i++) {
      const R = data[i * 4], G = data[i * 4 + 1], B = data[i * 4 + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), sat = mx ? (mx - mn) / mx : 0;
      const v = Math.max(0, R - Math.max(G, B)) * sat;
      red[i] = v; sum += v; sum2 += v * v; lum[i] = 0.299 * R + 0.587 * G + 0.114 * B; lsum += lum[i];
    }
    const mean = sum / N, std = Math.sqrt(Math.max(0, sum2 / N - mean * mean)), lmean = lsum / N;
    const thr = Math.max(32, mean + 1.8 * std);
    const seen = new Uint8Array(N);
    let best = null;
    for (let i = 0; i < N; i++) {
      if (seen[i] || red[i] < thr) continue;
      const q = [i]; seen[i] = 1;
      let k = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, acc = 0;
      while (k < q.length) {
        const p = q[k++], x = p % W, y = (p / W) | 0; acc += red[p];
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W];
        for (const j of nb) if (j >= 0 && j < N && !seen[j] && red[j] >= thr * 0.8) { seen[j] = 1; q.push(j); }
      }
      if (!best || q.length > best.n) best = { n: q.length, x0, y0, x1, y1, acc };
    }
    const dets = [];
    if (!best || best.n < Math.max(5, N * 0.002) || best.n > N * 0.6) return dets;
    const pad = 0.12;
    let bw = best.x1 - best.x0 + 1, bh = best.y1 - best.y0 + 1;
    const bx0 = best.x0 - bw * pad, by0 = best.y0 - bh * pad; bw *= 1 + 2 * pad; bh *= 1 + 2 * pad;
    const norm = (x, y, w, h) => {
      const nx = Math.max(0, x), ny = Math.max(0, y), nw = Math.min(W, x + w) - nx, nh = Math.min(H, y + h) - ny;
      return [nx / W, ny / H, nw / W, nh / H].map(v => +v.toFixed(4));
    };
    const strength = best.acc / best.n;
    dets.push({ cls: 'ulkus', conf: +clamp(0.6 + (strength - thr) / 220 + Math.min(best.n / N, 0.05), 0.6, 0.95).toFixed(2), box: norm(bx0, by0, bw, bh) });
    const ex = bw * 0.75, ey = bh * 0.75;
    const rx0 = Math.max(0, Math.floor(bx0 - ex)), ry0 = Math.max(0, Math.floor(by0 - ey));
    const rx1 = Math.min(W - 1, Math.ceil(bx0 + bw + ex)), ry1 = Math.min(H - 1, Math.ceil(by0 + bh + ey));
    let rs = 0, rn = 0, dark = 0, inN = 0;
    for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) {
      const p = y * W + x, inside = x >= bx0 && x <= bx0 + bw && y >= by0 && y <= by0 + bh;
      if (inside) { inN++; if (lum[p] < 55) dark++; } else { rs += red[p]; rn++; }
    }
    const ring = rn ? rs / rn : 0;
    if (ring > mean + 0.7 * std && ring > 14) dets.push({ cls: 'infeksi', conf: +clamp(0.55 + (ring - mean) / (std * 6 + 1), 0.56, 0.88).toFixed(2), box: norm(rx0, ry0, rx1 - rx0 + 1, ry1 - ry0 + 1) });
    if (lmean > 70 && inN && dark / inN > 0.18) dets.push({ cls: 'nekrosis', conf: +clamp(0.5 + dark / inN, 0.55, 0.85).toFixed(2), box: norm(bx0, by0, bw, bh) });
    return dets;
  }
  // Perkiraan luas tanpa stiker kalibrasi: bidang foto diasumsikan selebar 14 cm.
  function estArea(dets, w, h) {
    const u = dets.find(d => d.cls === 'ulkus'); if (!u) return null;
    const cm = 14, a = u.box[2] * cm * u.box[3] * cm * (h / w) * 0.6;
    return +Math.max(0.2, a).toFixed(1);
  }
  // Tombol rana tanpa kamera memakai foto dataset: foto lanjutan dari seri ibu jari Budi untuk pindai mingguan
  // (luas mengecil 12% dari pindai mingguan terakhir), atau foto ulkus dengan kemerahan untuk laporan keluhan.
  const DEMO_POOL = ['budi-4', 'budi-5', 'budi-6', 'budi-7'];
  function demoNext() {
    const trend = myScans().filter(s => s.area && !s.urgent), prev = trend[trend.length - 1], base = prev ? prev.area : 1.4;
    const conf = +(0.86 + Math.random() * 0.08).toFixed(2);
    if (U.urgent) return { key: 'keluhan-0', site: 'Jari III', area: base, conf: { ulkus: conf, infeksi: 0.82 } };
    const k = trend.filter(s => s.mine).length % DEMO_POOL.length;
    return { key: DEMO_POOL[k], site: 'Ibu jari', area: Math.max(0.3, +(base * 0.88).toFixed(1)), conf: { ulkus: conf } };
  }

  // ---------- kamera (opsional; bila ditolak, pakai Galeri) ----------
  let liveTimer = null;
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast('Kamera tidak tersedia di sini. Gunakan Galeri untuk mengunggah foto.', 'info'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false });
      U.cam = stream; render();
    } catch (e) {
      toast('Akses kamera ditolak. Gunakan Galeri untuk mengunggah foto.', 'info');
    }
  }
  function stopCamera() {
    if (U.cam) { U.cam.getTracks().forEach(t => t.stop()); U.cam = null; }
  }
  function attachCamera() {
    const v = document.getElementById('camVideo');
    if (!v || !U.cam) return;
    if (v.srcObject !== U.cam) v.srcObject = U.cam;
    v.onloadedmetadata = () => {
      const st = document.getElementById('camStage'); if (!st || !v.videoWidth) return;
      const box = st.parentElement, r = v.videoWidth / v.videoHeight;
      let w = box.clientWidth, h = w / r;
      if (h > box.clientHeight) { h = box.clientHeight; w = h * r; }
      Object.assign(st.style, { width: w + 'px', height: h + 'px', aspectRatio: 'auto' });
    };
    if (v.videoWidth) v.onloadedmetadata();
  }
  function liveTick() {
    if (U.mode !== 'pasien' || U.pv !== 'scan' || U.analyzing) return;
    const layer = document.getElementById('liveBoxes'); if (!layer) return;
    const v = document.getElementById('camVideo');
    if (U.cam && v && v.videoWidth) {
      const dets = analyzeImage(v, v.videoWidth, v.videoHeight);
      layer.innerHTML = dets.map(d => boxHTML(d, dets)).join('');
    } else if (!U.cam) {
      layer.querySelectorAll('i').forEach(el => { el.textContent = el.textContent.replace(/\d+%/, () => Math.round(70 + Math.random() * 24) + '%'); });
    }
  }

  // ---------- alur pindai ----------
  const STEPS = ['Memeriksa kualitas foto', 'Menjalankan model deteksi', 'Mengukur luas luka', 'Menyusun rekomendasi'];
  function startAnalysis(image, dets, area, site = 'Belum ditentukan') {
    stopCamera();
    U.analyzing = { image, step: 0 };
    render();
    const tick = () => {
      if (!U.analyzing) return;
      U.analyzing.step++;
      if (U.analyzing.step < STEPS.length) { render(); setTimeout(tick, 430); return; }
      let { wagner, priority } = assess(dets, area);
      const urgent = U.urgent ? urgentCheck(U.urgent.symptoms, dets) : null;
      if (urgent && urgent.danger) priority = 'Tinggi';
      U.urgent = null;
      const s = {
        id: 's' + Date.now().toString(36), patientId: S.me, date: new Date().toISOString(), foot: U.foot,
        site, image, detections: dets, area, wagner, priority,
        status: 'Tersimpan', sent: false, ms: 18 + Math.round(Math.random() * 16), mine: true,
      };
      if (urgent) s.urgent = urgent;
      S.scans.push(s); S.seen.scanned = true; persist();
      U.analyzing = null; U.pStack.push('scan'); U.pv = 'result'; U.scanId = s.id; U.showBoxes = true;
      render();
    };
    setTimeout(tick, 430);
  }
  function shoot() {
    const v = document.getElementById('camVideo');
    if (U.cam && v && v.videoWidth) {
      const r = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
      const c = document.createElement('canvas'); c.width = Math.round(v.videoWidth * r); c.height = Math.round(v.videoHeight * r);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      const dets = analyzeImage(c, c.width, c.height);
      startAnalysis({ kind: 'photo', src: c.toDataURL('image/jpeg', 0.8), w: c.width, h: c.height }, dets, estArea(dets, c.width, c.height));
    } else {
      const d = demoNext();
      startAnalysis(photoImage(d.key), photoDets(d.key, d.conf), d.area, d.site);
    }
  }
  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Pilih file gambar (JPG atau PNG).', 'alert'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const dets = analyzeImage(c, c.width, c.height);
        startAnalysis({ kind: 'photo', src: c.toDataURL('image/jpeg', 0.8), w: c.width, h: c.height }, dets, estArea(dets, c.width, c.height));
      };
      img.onerror = () => toast('Gambar tidak dapat dibuka. Coba file lain.', 'alert');
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  });

  // =====================================================================
  // TAMPILAN PASIEN
  // =====================================================================
  const backBtn = () => `<button class="icon-btn" data-act="pback" aria-label="Kembali">${ic('left', 20, 2.3)}</button>`;
  function phead(title, sub = '', { back = false, right = '' } = {}) {
    return `<div class="chead"><div class="row" style="gap:12px;min-width:0">${back ? backBtn() : ''}<div style="min-width:0"><h1>${title}</h1>${sub ? `<p class="muted" style="font-size:13px;margin-top:2px">${sub}</p>` : ''}</div></div>${right ? `<div class="row" style="gap:10px;flex-wrap:wrap">${right}</div>` : ''}</div>`;
  }

  function trendLine(s) {
    if (!s.area || s.urgent) return '';
    const prev = myScans().filter(x => x.area && !x.urgent && x.foot === s.foot && D(x.date) < D(s.date)).pop();
    if (!prev) return '';
    const ch = Math.round((1 - s.area / prev.area) * 100);
    if (ch === 0) return '<span class="small muted">Luas sama dengan pindai sebelumnya</span>';
    return ch > 0
      ? `<span class="row small" style="gap:4px;color:var(--green);font-weight:700">${ic('trendDown', 13, 2.4)}Mengecil ${ch}% dari pindai sebelumnya</span>`
      : `<span class="row small" style="gap:4px;color:var(--red);font-weight:700">${ic('trendUp', 13, 2.4)}Membesar ${-ch}% dari pindai sebelumnya</span>`;
  }

  const urgentBtn = () => `<button class="btn btn-warn" data-act="sheet" data-s="urgent">${ic('alert', 16, 2.2)}Ada keluhan? Laporkan tanda bahaya</button>`;
  function healCard() {
    const t = trackOf(S.me);
    if (!t) return `<section class="card heal"><b style="font-size:15px">Pemantauan penyembuhan</b>
      <p class="small muted">Belum ada luka yang dipantau. Bila ada luka terbuka, foto pertama menjadi minggu ke-0 dan sistem membuat target penyembuhan ${HEAL.weeks} minggu.</p>${urgentBtn()}</section>`;
    const info = HEAL_INFO[t.status], due = -dayDiff(t.next.toISOString()) <= 0;
    return `<section class="card heal">
      <div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px"><div><span class="small muted" style="font-weight:700">Pemantauan ${HEAL.weeks} minggu · kaki ${t.foot.toLowerCase()}</span><b style="display:block;font-size:16px">${weekLabel(t.week)}</b></div>${healChip(t.status)}</div>
      ${weekSteps(t)}
      <div class="advice ${info.tone}">${ic(info.tone === 'green' ? 'check' : 'alert', 18, 2.2)}<p><b>${healReason(t.last)}.</b> ${info.msg}</p></div>
      <div class="due"><span class="si">${ic('calendar', 17, 2.1)}</span><span class="grow"><span class="small muted" style="display:block">Pindai mingguan berikutnya · minggu ke-${t.nextWeek}${t.nextWeek === HEAL.weeks ? ' (titik keputusan)' : ''}</span><b style="font-size:13.5px">${dueLabel(t.next)}</b></span>${due ? `<button class="btn btn-primary btn-sm" data-act="pgo" data-v="scan">${ic('camera', 15, 2.2)}Pindai</button>` : ''}</div>
      ${urgentBtn()}
      <p class="small muted">Foto keluhan bisa dikirim kapan saja dan tidak dihitung dalam grafik penyembuhan.</p>
    </section>`;
  }

  function pHome() {
    const me = patient(S.me), mine = myScans(), last = mine[mine.length - 1];
    const unread = S.notes.some(n => n.patientId === S.me && !n.read);
    const note = S.notes.filter(n => n.patientId === S.me).sort(byDate).pop();
    const h = new Date().getHours();
    const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
    const risk = last ? last.priority : 'Rendah';
    const riskColor = { Tinggi: 'var(--red)', Sedang: 'var(--amber)', Rendah: 'var(--green)' }[risk];
    const bell = `<button class="icon-btn" style="border-radius:50%" data-act="sheet" data-s="notif" aria-label="Notifikasi${unread ? ', ada pesan baru' : ''}">${ic('bell', 20)}${unread ? '<span class="dot"></span>' : ''}</button>`;
    return phead(`${greet}, ${esc(me.name.split(' ')[0])}`, todayLabel() + ' · Puskesmas Sukamaju', { right: bell }) + `
    <div class="home-grid">
      <div class="col">
        <section class="hero">
          <span class="pill"><span style="width:6px;height:6px;border-radius:50%;background:#A7F3D0"></span>Deteksi AI di perangkat</span>
          <h3>Pindai luka kaki Anda</h3>
          <p>Arahkan kamera ke telapak kaki, hasil keluar kurang dari 1 detik.</p>
          <button class="cta" data-act="pgo" data-v="scan">${ic('camera', 16, 2.3)}Mulai Pindai</button>
          <div class="art"><img src="${PHOTOS['hendra-0'].src}" alt=""></div>
        </section>
        ${healCard()}
        <div class="sec"><h3>Ringkasan Hari Ini</h3></div>
        <div class="stats3">
          <button class="card stat" data-act="sheet" data-s="glucose" aria-label="Catat gula darah"><span class="si" style="background:var(--red-soft);color:var(--red)">${ic('droplet', 15, 2.2)}</span><span class="l">Gula darah</span><span class="v">${S.vitals.glucose}<small>mg/dL</small></span></button>
          <div class="card stat"><span class="si" style="background:var(--amber-soft);color:var(--amber)">${ic('activity', 15, 2.2)}</span><span class="l">Skor risiko</span><span class="v" style="color:${riskColor}">${risk}</span></div>
          <div class="card stat"><span class="si" style="background:var(--blue-soft);color:var(--blue)">${ic('calendar', 15, 2.2)}</span><span class="l">Kontrol</span><span class="v">${shortDate(S.vitals.nextVisit)}</span></div>
        </div>
        <div class="sec"><h3>Hasil Pindai Terakhir</h3><button class="link" data-act="pgo" data-v="history">Riwayat</button></div>
        ${last ? `<button class="card tile-btn" data-act="open-scan" data-id="${last.id}">${thumb(last)}
          <span class="grow" style="display:grid;gap:4px">
            <span class="small muted">Kaki ${last.foot.toLowerCase()} · ${relDate(last.date)}</span>
            <b style="font-size:14.5px">${headline(last)}</b>
            <span class="row" style="gap:5px;flex-wrap:wrap">${last.wagner != null ? `<span class="chip t-amber">Wagner ${last.wagner} (est.)</span>` : ''}${last.area ? `<span class="chip t-gray">${fmtArea(last.area)}</span>` : ''}${statusChip(last)}</span>
            ${trendLine(last)}
          </span><span class="muted">${ic('right', 18)}</span></button>`
          : `<div class="card empty">${ic('camera', 24)}<b>Belum ada pindaian</b><span class="small">Tekan Mulai Pindai untuk memeriksa kaki Anda.</span></div>`}
      </div>
      <div class="col">
        <div class="sec"><h3>Pengingat Perawatan</h3><span class="small muted">${S.prefs.remind ? S.reminders.filter(r => r.done).length + '/' + S.reminders.length + ' selesai' : 'Nonaktif'}</span></div>
        ${S.prefs.remind
          ? `<div class="card" style="padding:2px 14px;border-radius:18px">${S.reminders.map(r => `<button class="reminder${r.done ? ' done' : ''}" data-act="rem" data-id="${r.id}" role="checkbox" aria-checked="${r.done}">
            <span class="check">${r.done ? ic('check', 14, 3) : ''}</span>
            <span class="grow"><span class="rt" style="display:block">${esc(r.text)}</span><span class="small" style="color:var(--mut-2)">${r.done ? 'Selesai' : 'Hari ini'} · ${r.time}</span></span></button>`).join('')}</div>`
          : `<button class="card empty" style="width:100%;border-radius:18px" data-act="pgo" data-v="profile"><span class="small">Pengingat dimatikan. Nyalakan lagi di Profil.</span></button>`}
        <div class="sec"><h3>Pesan dari Puskesmas</h3>${note ? '<button class="link" data-act="sheet" data-s="notif">Semua</button>' : ''}</div>
        ${note ? noteCard(note) : '<div class="card empty"><span class="small">Belum ada pesan dari tenaga kesehatan.</span></div>'}
        <button class="card tile-btn" data-act="pgo" data-v="edu"><span class="si" style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;flex:none">${ic('book', 19)}</span>
          <span class="grow"><b style="display:block;font-size:13.5px">Tips hari ini</b><span class="small muted">Periksa sela-sela jari kaki: luka kecil sering tersembunyi di sana.</span></span><span class="muted">${ic('right', 18)}</span></button>
      </div>
    </div>`;
  }

  function pScan() {
    const live = !!U.cam;
    const d = demoNext();
    const vfBoxes = photoDets(d.key, d.conf);
    const recent = myScans().slice(-3).reverse();
    const t = trackOf(S.me), urg = U.urgent;
    const banner = urg
      ? `<div class="advice red" style="margin-bottom:14px">${ic('alert', 18, 2.2)}<p><b>Laporan keluhan (jalur darurat).</b> ${urg.symptoms.length ? 'Gejala: ' + urg.symptoms.map(esc).join(', ').toLowerCase() + '. ' : ''}Foto ini dicek untuk tanda infeksi dan <b>tidak dihitung</b> dalam grafik penyembuhan. <button class="link" data-act="urgent-cancel">Batalkan laporan</button></p></div>`
      : t ? `<div class="due card" style="margin-bottom:14px"><span class="si">${ic('calendar', 17, 2.1)}</span><span class="grow"><span class="small muted" style="display:block">Pindai mingguan · minggu ke-${t.nextWeek}${t.nextWeek === HEAL.weeks ? ' (titik keputusan)' : ''}</span><b style="font-size:13.5px">Jadwal: ${dueLabel(t.next)}</b></span></div>` : '';
    return phead(urg ? 'Foto Keluhan' : 'Pindai Luka', urg ? 'Laporan tanda bahaya, bisa kapan saja' : 'Foto telapak kaki untuk dianalisis', { back: true, right: `<button class="icon-btn" data-act="sheet" data-s="tips" aria-label="Tips memotret luka">${ic('info', 20)}</button>` }) + banner + `
    <div class="scan-grid">
      <div class="cam">
        <div style="display:flex;justify-content:center"><span class="live-pill"><span class="live-dot"></span>${live ? 'Kamera aktif · deteksi langsung' : 'Pratinjau foto dataset'}</span></div>
        <div class="viewfinder"><span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
          <div class="vf-inner">${live
            ? `<div class="vf-stage" id="camStage" style="aspect-ratio:3/4"><video id="camVideo" autoplay playsinline muted></video><div id="liveBoxes" class="live-layer"></div></div>`
            : `<div class="vf-stage" style="aspect-ratio:1"><img src="${PHOTOS[d.key].src}" alt="Pratinjau foto contoh dari dataset"><div id="liveBoxes" class="live-layer">${vfBoxes.map(b => boxHTML(b, vfBoxes)).join('')}</div></div>`}</div>
        </div>
        <div class="qchips"><span class="ok">${ic('sun', 13, 2.2)}Cahaya baik</span><span class="ok">${ic('focus', 13, 2.2)}Fokus tajam</span><span class="ok">${ic('ruler', 13, 2.2)}± 25 cm</span></div>
        <div class="cam-panel">
          <div class="hint">${live ? 'Tahan ponsel 20–30 cm dari telapak kaki' : 'Tekan rana untuk memakai foto dari dataset, atau unggah foto dari Galeri'}</div>
          <div class="seg dark" role="group" aria-label="Pilih kaki">${['Kiri', 'Kanan'].map(f => `<button data-act="foot" data-f="${f}" aria-pressed="${U.foot === f}">Kaki ${f.toLowerCase()}</button>`).join('')}</div>
          <div class="cam-row">
            <button class="cam-side" data-act="upload" aria-label="Unggah foto dari galeri">${ic('image', 20)}Galeri</button>
            <button class="shutter" data-act="shoot" aria-label="Ambil foto dan analisis"><span></span></button>
            <button class="cam-side" data-act="camera" aria-label="${live ? 'Matikan kamera' : 'Nyalakan kamera'}">${ic(live ? 'x' : 'camera', 20)}${live ? 'Tutup' : 'Kamera'}</button>
          </div>
        </div>
      </div>
      <div class="col scan-side">
        <div class="card" style="padding:16px 18px;display:grid;gap:10px">
          <h2 style="font-size:15px;font-weight:800">Cara memotret yang baik</h2>
          <ol style="margin:0;padding-left:18px;display:grid;gap:7px;color:var(--ink-2);font-size:13.5px">${EDU[5][2].map(t => `<li>${t}</li>`).join('')}<li>Pilih kaki kiri atau kanan sebelum memotret.</li></ol>
        </div>
        <div class="card" style="padding:16px 18px;display:grid;gap:10px">
          <h2 style="font-size:15px;font-weight:800">Pindaian terakhir</h2>
          ${recent.map(s => `<button class="row" style="width:100%;text-align:left;gap:11px" data-act="open-scan" data-id="${s.id}">${thumb(s, 'sm')}<span class="grow"><b style="font-size:13px;display:block">${relDate(s.date)}</b><span class="small muted">${findingsText(s)}${s.area ? ' · ' + fmtArea(s.area) : ''}</span></span>${urgentChip(s)}${statusChip(s)}</button>`).join('') || '<p class="small muted">Belum ada pindaian.</p>'}
        </div>
        <p class="disclaimer">Mode demo: tombol rana memakai foto asli dari Wound Image Dataset dengan kotak dari mask anotasinya. Foto kamera dan Galeri dianalisis dengan pencarian warna sederhana. Belum ada model YOLO terlatih.</p>
      </div>
    </div>`;
  }

  function detRow(d, s) {
    const c = CLASSES[d.cls];
    const sub = d.cls === 'ulkus' && s.area ? `Luas ± ${fmtArea(s.area)}` : c.desc;
    const w = d.manual ? '100%' : pct(d.conf);
    return `<div class="detrow" style="--c:${c.color}"><span class="swatch"></span>
      <div><b style="font-size:13px">${c.label}</b><div class="small muted">${sub}</div></div>
      <div><div style="text-align:right;font-weight:800;font-size:12.5px">${d.manual ? 'Manual' : pct(d.conf)}</div><div class="bar"><span style="width:${w}"></span></div></div></div>`;
  }
  const WAG_COL = ['#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444', '#991B1B'];
  const wagnerCard = w => `<div class="card" style="padding:12px 16px 13px;border-radius:18px">
    <div class="row" style="justify-content:space-between"><span class="small muted" style="font-weight:700">Estimasi derajat Wagner</span><span class="chip t-amber">Derajat ${w}</span></div>
    <div class="wagner" role="img" aria-label="Derajat ${w} dari skala 0 sampai 5">${WAG_COL.map((c, i) => `<div class="${i === w ? 'on' : ''}" style="--c:${c}"><span></span>${i}</div>`).join('')}</div></div>`;
  const noteCard = n => `<div class="note-card"><div class="row"><div class="avatar" style="width:32px;height:32px;font-size:11.5px;background:var(--accent);color:var(--accent-ink)">${initials(n.author.replace('dr. ', ''))}</div>
    <div class="grow"><b style="font-size:12.5px">${esc(n.author)}</b><div class="small muted">Puskesmas Sukamaju · ${relDate(n.date)}</div></div></div><p style="font-size:13px;color:var(--ink-2)">${esc(n.text)}</p></div>`;

  function pResult() {
    const s = scanById(U.scanId);
    if (!s) { U.pv = 'home'; return pHome(); }
    const adv = ADVICE[s.priority];
    const notes = S.notes.filter(n => n.scanId === s.id).sort(byDate);
    const ref = S.referrals.find(r => r.scanId === s.id);
    const tags = `<span class="tag" style="top:10px;left:10px">Kaki ${s.foot.toLowerCase()} · ${fmtTime(s.date)}</span><span class="tag" style="bottom:10px;right:10px">${ic('zap', 11, 2.4)}Inferensi ${s.ms} ms</span>`;
    const t = trackOf(s.patientId), hp = t && t.pts.find(p => p.id === s.id), u = s.urgent;
    let guide = `<div class="advice ${adv.tone}">${ic(adv.tone === 'green' ? 'check' : 'alert', 18, 2.2)}<p><b>${adv.title}</b> ${adv.text}</p></div>`;
    if (u) guide = `<div class="advice ${u.danger ? 'red' : 'green'}">${ic(u.danger ? 'alert' : 'check', 18, 2.2)}<p><b>${u.danger ? 'Tanda bahaya ditemukan: disarankan rujukan segera.' : 'Tidak ada tanda bahaya yang terdeteksi.'}</b> ${u.danger ? 'Datangi Puskesmas atau IGD rumah sakit hari ini (≤ 24 jam). Jangan menunggu jadwal pindai mingguan.' : 'Hubungi Puskesmas bila keluhan berlanjut, dan lanjutkan pindai mingguan sesuai jadwal.'}</p></div>
      <div class="card" style="padding:12px 16px;border-radius:18px;display:grid;gap:6px"><span class="small muted" style="font-weight:700">Laporan keluhan · jalur darurat</span>
        ${u.signs.length ? `<ul class="signs">${u.signs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="small">Tidak ada gejala yang dicentang.</p>'}
        <p class="small muted">Foto ini tidak dihitung dalam grafik penyembuhan mingguan.</p></div>`;
    else if (hp) guide = `<div class="card" style="padding:12px 16px;border-radius:18px;display:grid;gap:8px">
        <div class="row" style="justify-content:space-between;gap:8px"><span class="small muted" style="font-weight:700">Pemantauan mingguan · ${weekLabel(hp.wk)}</span>${healChip(hp.status)}</div>
        <b style="font-size:13.5px">${healReason(hp)}</b>
        <p class="small muted">${HEAL_INFO[hp.status].msg}</p></div>` + guide;
    return phead(u ? 'Hasil Laporan Keluhan' : 'Hasil Analisis', `Kaki ${s.foot.toLowerCase()} · ${relDate(s.date)}`, { back: true, right: `${s.image.mask ? `<button class="btn btn-ghost btn-sm" data-act="toggle-mask" aria-pressed="${U.showMask}">${ic('layers', 16)}${U.showMask ? 'Sembunyikan mask' : 'Tampilkan mask'}</button>` : ''}<button class="btn btn-ghost btn-sm" data-act="toggle-boxes" aria-pressed="${U.showBoxes}">${ic('eye', 16)}${U.showBoxes ? 'Sembunyikan kotak' : 'Tampilkan kotak'}</button>` }) + `
    <div class="res-grid">
      <div class="col">
        ${photo(s, { boxes: U.showBoxes, mask: U.showMask, tags })}
        <p class="demo-note">${ic('info', 13)}<span>${srcNote(s)}</span></p>
      </div>
      <div class="col">
        <div class="card" style="padding:10px 16px 6px;border-radius:18px">
          <div class="row" style="justify-content:space-between;padding:2px 0"><b style="font-size:14px">${s.detections.length ? s.detections.length + ' temuan terdeteksi' : 'Tidak ada temuan'}</b><span class="small muted mono">YOLO11n-DFU</span></div>
          ${s.detections.map(d => detRow(d, s)).join('') || '<p class="small muted" style="padding:6px 0 10px">Tidak terlihat luka terbuka, kalus, atau tanda infeksi pada foto ini.</p>'}
        </div>
        ${s.wagner != null ? wagnerCard(s.wagner) : ''}
        ${guide}
        ${s.sent ? `<div class="card" style="padding:12px 16px;border-radius:18px;display:grid;gap:9px">
          <div class="row" style="justify-content:space-between"><span class="small muted" style="font-weight:700">Status di Puskesmas</span>${statusChip(s)}</div>
          ${ref ? `<p class="small">Dirujuk ke <b>${esc(ref.hospital)}</b> · ${ref.urgency === 'Segera' ? 'segera (≤ 24 jam)' : 'terjadwal'}.</p>` : ''}
          ${notes.map(noteCard).join('')}
          ${!notes.length && !ref ? `<p class="small muted">${s.status === 'Divalidasi' ? 'Hasil sudah diperiksa tenaga kesehatan.' : 'Tenaga kesehatan akan meninjau hasil ini. Anda akan menerima notifikasi.'}</p>` : ''}
        </div>` : ''}
        ${s.sent
          ? `<button class="btn btn-ghost" data-act="pgo" data-v="history">${ic('activity', 17)}Lihat perkembangan luka</button>`
          : `<div class="row" style="gap:9px"><button class="btn ${u && u.danger ? 'btn-danger' : 'btn-primary'} grow" data-act="send" data-id="${s.id}">${ic('send', 17, 2.2)}${u ? 'Kirim laporan ke Puskesmas' : 'Kirim ke Puskesmas'}</button><button class="icon-btn" style="width:42px;height:42px" data-act="sheet" data-s="delete" data-id="${s.id}" aria-label="Hapus hasil ini">${ic('trash', 18)}</button></div>`}
        <p class="small" style="text-align:center;color:var(--mut-2)">Hasil ini adalah alat bantu skrining, bukan diagnosis medis.</p>
      </div>
    </div>`;
  }

  // ---------- grafik ----------
  // Luas luka per minggu sejak foto awal, garis target (turun 50% di minggu ke-4), dan titik keputusan.
  const HCOL = { awal: 'var(--accent-2)', sesuai: 'var(--accent-2)', tercapai: 'var(--green)', waspada: 'var(--amber)', rujuk: 'var(--red)' };
  function healChart(t, W = 320, H = 150) {
    if (!t) return '<p class="small muted" style="padding:16px 4px">Grafik muncul setelah ada pindaian mingguan dengan luas luka.</p>';
    const pl = 28, pr = 16, pt = 22, pb = 24, pts = t.pts;
    const maxW = Math.max(HEAL.weeks, t.last.wk), span = Math.max(maxW, t.last.w), goalV = t.a0 * (1 - HEAL.goal);
    const hi = Math.ceil(Math.max(t.a0, ...pts.map(p => p.v)) + 0.5), step = hi > 6 ? 2 : 1;
    const x = w => pl + w / span * (W - pl - pr), y = v => pt + (hi - v) / hi * (H - pt - pb);
    const id = 'ga' + (uid++);
    let g = '';
    for (let v = 0; v <= hi; v += step) g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 7}" y="${y(v) + 3.5}" font-size="10" text-anchor="end">${v}</text>`;
    for (let w = 0; w <= maxW; w++) g += `<text x="${x(w)}" y="${H - 5}" font-size="9.5" text-anchor="middle"${w === HEAL.weeks ? ' font-weight="700" style="fill:var(--ink-2)"' : ''}>Mg ${w}</text>`;
    g += `<line x1="${x(HEAL.weeks)}" x2="${x(HEAL.weeks)}" y1="${pt - 8}" y2="${H - pb}" style="stroke:var(--mut-2)" stroke-dasharray="2 3"/><text x="${x(HEAL.weeks) - 4}" y="${pt - 11}" font-size="9" text-anchor="end">Titik keputusan</text>`;
    g += `<polyline points="${x(0)},${y(t.a0)} ${x(HEAL.weeks)},${y(goalV)}" fill="none" style="stroke:var(--green)" stroke-width="1.8" stroke-dasharray="5 4"/>
      <text x="${x(HEAL.weeks) - 4}" y="${y(goalV) + 14}" font-size="9.5" text-anchor="end" font-weight="700" style="fill:var(--green)">Target ${fmtNum(goalV)}</text>`;
    const P = pts.map(p => x(p.w).toFixed(1) + ',' + y(p.v).toFixed(1)).join(' '), L = pts[pts.length - 1];
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Luas luka dari ${fmtNum(t.a0)} menjadi ${fmtNum(L.v)} cm persegi dalam ${L.wk} minggu; target ${fmtNum(goalV)} cm persegi di minggu ke-${HEAL.weeks}. Status: ${HEAL_INFO[L.status].label}.">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent-2);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--accent-2);stop-opacity:0"/></linearGradient></defs>
      ${g}${pts.length > 1 ? `<polygon points="${x(0)},${y(0)} ${P} ${x(L.w)},${y(0)}" fill="url(#${id})"/><polyline points="${P}" fill="none" style="stroke:var(--accent-2)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
      ${pts.map(p => `<circle cx="${x(p.w)}" cy="${y(p.v)}" r="${p === L ? 5.5 : 4}" style="fill:${p === L ? HCOL[p.status] : 'var(--surface)'};stroke:${HCOL[p.status]}" stroke-width="2.2"/>`).join('')}
      <text x="${x(L.w)}" y="${y(L.v) - 10}" font-size="10" text-anchor="middle" font-weight="700" style="fill:var(--ink-2)">${fmtNum(L.v)}</text>
    </svg>`;
  }
  const healLegend = () => `<div class="legend"><span><i style="background:var(--accent-2)"></i>Luas aktual</span><span><i class="dash"></i>Target: turun 50% di minggu ke-${HEAL.weeks}</span><span><i style="background:var(--amber)"></i>Waspada</span><span><i style="background:var(--red)"></i>Disarankan rujuk</span></div>`;
  // Lima kotak minggu 0–4, diwarnai menurut status pindaian minggu tersebut.
  function weekSteps(t) {
    return `<div class="wk" role="img" aria-label="${weekLabel(t.week)}">${Array.from({ length: HEAL.weeks + 1 }, (_, w) => {
      const p = t.pts.filter(x => x.wk === w).pop();
      const cls = p ? 'h-' + p.status : w < t.week ? 'miss' : w === t.nextWeek ? 'next' : '';
      return `<span class="${cls}"><i></i>Mg ${w}</span>`;
    }).join('')}</div>`;
  }
  function sevChart(scans, W = 320, H = 150) {
    const pts = scans.slice(-8);
    if (!pts.length) return '<p class="small muted">Belum ada data.</p>';
    const pl = 26, pr = 8, pt = 18, pb = 24, bw = Math.min(26, (W - pl - pr) / pts.length - 10);
    const y = v => pt + (1 - v / 5) * (H - pt - pb);
    let g = '';
    for (let v = 0; v <= 5; v++) g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 7}" y="${y(v) + 3.5}" font-size="10" text-anchor="end">${v}</text>`;
    const slot = (W - pl - pr) / pts.length;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik estimasi derajat Wagner per pindaian">${g}${pts.map((s, i) => {
      const cx = pl + slot * i + slot / 2, w = s.wagner ?? 0, top = y(Math.max(w, 0.15));
      return `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${y(0) - top}" rx="4" fill="${s.wagner == null ? '#94A3B8' : WAG_COL[w]}"/><text x="${cx}" y="${top - 5}" font-size="10" text-anchor="middle" font-weight="700" style="fill:var(--ink-2)">${s.wagner == null ? '–' : 'W' + w}</text><text x="${cx}" y="${H - 5}" font-size="9.5" text-anchor="middle">${shortDate(s.date)}</text>`;
    }).join('')}</svg>`;
  }

  function pHistory() {
    const mine = myScans(), t = trackOf(S.me);
    const lastFoot = t ? t.foot : mine.length ? mine[mine.length - 1].foot : 'Kanan';
    const note = S.notes.filter(n => n.patientId === S.me).sort(byDate).pop();
    const tabs = [['area', 'Luas luka'], ['sev', 'Keparahan'], ['gal', 'Galeri foto']];
    let body;
    if (U.histTab === 'area') {
      body = `<div class="card" style="padding:14px 14px 10px;border-radius:18px;display:grid;gap:4px">
        <div class="small muted" style="font-weight:700;padding-left:4px">Luas ulkus · kaki ${lastFoot.toLowerCase()}${t ? ' · ' + weekLabel(t.week).toLowerCase() : ''}</div>
        <div class="row" style="justify-content:space-between;padding:0 4px;flex-wrap:wrap;gap:6px">
          <div style="font-size:26px;font-weight:800;letter-spacing:-.5px">${t ? fmtNum(t.last.v) : '–'} <span style="font-size:14px;color:var(--mut);font-weight:600">cm²</span></div>
          ${t ? healChip(t.status) : ''}
        </div>
        ${t ? `<p class="small" style="padding:0 4px">${healReason(t.last)} · foto awal ${fmtArea(t.a0)} (${shortDate(t.base)})</p>` : ''}
        ${healChart(t, 420, 200)}${t ? healLegend() : ''}</div>
        <div class="card rules"><b style="font-size:13.5px">Cara sistem menilai</b>
          <ol><li><b>Minggu ke-0:</b> luas dari foto awal dicatat, lalu sistem membuat target: luas turun 50% di minggu ke-${HEAL.weeks}.</li>
          <li><b>Minggu ke-1 sampai ke-${HEAL.weeks - 1}:</b> pindai seminggu sekali di hari yang sama. Status menjadi <b>Waspada</b> bila luka membesar, atau mulai minggu ke-2 penurunannya kurang dari separuh target. Anda disarankan kontrol ke Puskesmas tanpa menunggu minggu ke-${HEAL.weeks}.</li>
          <li><b>Minggu ke-${HEAL.weeks} (titik keputusan):</b> bila penurunan kurang dari 50%, sistem menyarankan rujukan.</li>
          <li><b>Jalur darurat:</b> foto keluhan (bau, nanah, kemerahan meluas, demam) bisa dikirim kapan saja, dicek untuk tanda bahaya, dan tidak dihitung dalam grafik.</li></ol>
          <p class="small muted">Patokan 50% dalam ${HEAL.weeks} minggu berasal dari penelitian ulkus kaki diabetik (Sheehan dkk., 2003) dan pedoman IWGDF. Keputusan akhir tetap di tangan tenaga kesehatan.</p></div>`;
    } else if (U.histTab === 'sev') {
      body = `<div class="card" style="padding:14px 14px 10px;border-radius:18px"><div class="small muted" style="font-weight:700;padding:0 4px 6px">Estimasi derajat Wagner per pindaian</div>${sevChart(mine, 420, 180)}</div>`;
    } else {
      body = `<div class="gallery">${mine.slice().reverse().map(s => `<button data-act="open-scan" data-id="${s.id}">${thumb(s)}<span>${shortDate(s.date)}</span></button>`).join('')}</div>`;
    }
    return phead('Perkembangan Luka', `${mine.length} pindaian tersimpan · kaki ${lastFoot.toLowerCase()}`) + `
    <div class="hist-grid">
      <div class="col">
        <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" data-act="htab" data-t="${k}" aria-selected="${U.histTab === k}">${t}</button>`).join('')}</div>
        ${body}
        ${note ? noteCard(note) : ''}
      </div>
      <div class="col">
        <div class="sec"><h3>Riwayat Pindai</h3><span class="small muted">${mine.length} pindaian</span></div>
        <div style="display:grid;gap:8px">${mine.slice().reverse().map(s => `<button class="card row" style="width:100%;text-align:left;padding:9px 11px;gap:11px;border-radius:16px" data-act="open-scan" data-id="${s.id}">${thumb(s, 'sm')}
          <span class="grow"><b style="font-size:13px;display:block">${fmtDate(s.date)}</b><span class="small muted">${findingsText(s)}${s.area ? ' · ' + fmtArea(s.area) : ''}</span></span>${urgentChip(s)}${statusChip(s)}</button>`).join('')}</div>
      </div>
    </div>`;
  }

  const EDU = [
    ['eye', 'Periksa kaki setiap hari', ['Lihat telapak, tumit, dan sela-sela jari setiap pagi atau sebelum tidur.', 'Gunakan cermin atau minta bantuan keluarga bila sulit melihat.', 'Cari luka, lecet, kemerahan, bengkak, kalus, atau perubahan warna kulit.']],
    ['droplet', 'Cuci dan keringkan kaki', ['Cuci dengan air hangat kuku. Cek suhu air dengan siku, bukan dengan kaki.', 'Keringkan dengan lembut, terutama di sela jari.', 'Oleskan pelembap pada kulit kering, tetapi jangan di sela jari.']],
    ['shield', 'Gunakan alas kaki yang tepat', ['Jangan berjalan tanpa alas kaki, baik di dalam maupun di luar rumah.', 'Pilih sepatu yang pas dan lembut; periksa bagian dalamnya sebelum dipakai.', 'Gunakan kaus kaki bersih tanpa jahitan kasar dan ganti setiap hari.']],
    ['edit', 'Potong kuku dengan benar', ['Potong kuku lurus dan tidak terlalu pendek, lalu kikir sudut yang tajam.', 'Jangan memotong kalus atau kutil sendiri; minta bantuan tenaga kesehatan.']],
    ['activity', 'Jaga gula darah tetap terkendali', ['Minum obat sesuai anjuran dokter dan cek gula darah secara rutin.', 'Gula darah yang tinggi memperlambat penyembuhan luka dan menurunkan daya tahan terhadap infeksi.']],
    ['camera', 'Cara memotret luka untuk DiaScan', ['Gunakan cahaya terang dan hindari bayangan.', 'Tahan ponsel 20–30 cm, tegak lurus terhadap telapak kaki.', 'Tempelkan stiker kalibrasi 2 × 2 cm di dekat luka agar luas luka bisa diukur.', 'Pindai seminggu sekali di hari yang sama, dengan jarak dan sudut yang sama, agar grafik penyembuhan akurat.']],
  ];
  function pEdu() {
    return phead('Edukasi Kaki Diabetik', 'Langkah sederhana mencegah luka dan amputasi') + `<div class="col wrap-md">
      <div class="advice red">${ic('alert', 18, 2.2)}<p><b>Segera ke fasilitas kesehatan bila:</b> luka bernanah atau berbau, kemerahan meluas, kaki bengkak atau terasa panas, kulit menghitam, atau Anda demam.</p></div>
      <div class="card" style="padding:0 16px;border-radius:18px">${EDU.map(([i, t, items], k) => `<details class="acc"${k === 0 ? ' open' : ''}><summary><span style="color:var(--accent)">${ic(i, 18)}</span>${t}${ic('down', 16)}</summary><div class="acc-body"><ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div></details>`).join('')}</div>
      <p class="small muted" style="padding:0 2px">Materi ringkas berdasarkan prinsip pencegahan kaki diabetik. Ikuti selalu anjuran tenaga kesehatan Anda.</p>
    </div>`;
  }

  function pProfile() {
    const me = patient(S.me);
    const row = (icon, title, sub, right, act, extra = '') => `<button class="setrow" data-act="${act}" ${extra}><span class="si">${ic(icon, 17)}</span><span class="grow"><b style="display:block;font-size:13.5px">${title}</b><span class="small muted">${sub}</span></span>${right}</button>`;
    return phead('Profil') + `<div class="col wrap-sm">
      <div class="card" style="padding:16px;border-radius:18px;display:flex;gap:14px;align-items:center">
        <div class="avatar" style="width:56px;height:56px;font-size:18px">${initials(me.name)}</div>
        <div class="grow"><b style="font-size:17px">${esc(me.name)}</b><div class="small muted">${me.age} tahun · ${me.sex === 'L' ? 'Laki-laki' : 'Perempuan'} · ${me.dm}</div><div class="small muted">Puskesmas Sukamaju · Desa ${me.village}</div></div>
      </div>
      <div class="card" style="padding:0 16px;border-radius:18px">
        ${row('bell', 'Pengingat harian', 'Notifikasi periksa kaki & ganti balutan', `<span class="toggle" role="switch" aria-checked="${S.prefs.remind}"></span>`, 'pref', 'data-k="remind"')}
        ${row('type', 'Huruf lebih besar', 'Memperbesar tampilan untuk lansia', `<span class="toggle" role="switch" aria-checked="${S.prefs.bigText}"></span>`, 'pref', 'data-k="bigText"')}
        ${row('info', 'Tentang mode demo', 'Cara kerja prototipe ini', ic('right', 18), 'sheet', 'data-s="about"')}
        ${row('refresh', 'Atur ulang data demo', 'Kembalikan semua data contoh', ic('right', 18), 'sheet', 'data-s="reset"')}
      </div>
      <p class="small muted" style="text-align:center">DiaScan v0.1 (prototipe) · Data hanya tersimpan di peramban ini</p>
    </div>`;
  }

  function sheetHTML() {
    if (!U.sheet) return '';
    let inner = '', label = '';
    const mineNotes = S.notes.filter(n => n.patientId === S.me).sort(byDate).reverse();
    switch (U.sheet) {
      case 'notif':
        label = 'Notifikasi';
        inner = `<h3 style="font-size:17px">Notifikasi</h3>${mineNotes.length ? mineNotes.map(noteCard).join('') : '<p class="muted">Belum ada pesan dari tenaga kesehatan.</p>'}<button class="btn btn-ghost" data-act="close-sheet">Tutup</button>`;
        break;
      case 'glucose':
        label = 'Catat gula darah';
        inner = `<h3 style="font-size:17px">Catat gula darah</h3><form id="glucoseForm" class="field" style="gap:10px"><label for="glucoseInput">Hasil cek gula darah (mg/dL)</label>
          <input class="input" id="glucoseInput" type="number" inputmode="numeric" min="40" max="600" required value="${S.vitals.glucose}">
          <p class="small muted">Terakhir dicatat ${relDate(S.vitals.glucoseAt)}. Target umum gula darah puasa 80–130 mg/dL; ikuti target dari dokter Anda.</p>
          <div class="row"><button type="button" class="btn btn-ghost grow" data-act="close-sheet">Batal</button><button class="btn btn-primary grow" type="submit">Simpan</button></div></form>`;
        break;
      case 'tips':
        label = 'Tips memotret';
        inner = `<h3 style="font-size:17px">Tips memotret luka</h3><ul style="margin:0;padding-left:18px;display:grid;gap:6px;font-size:13.5px;color:var(--ink-2)">${EDU[5][2].map(t => `<li>${t}</li>`).join('')}<li>Bersihkan lensa kamera sebelum memotret.</li></ul>
          <p class="small muted">Di prototipe ini, tombol rana memakai foto dari Wound Image Dataset. Gunakan Galeri untuk menguji foto Anda sendiri.</p><button class="btn btn-primary" data-act="close-sheet">Mengerti</button>`;
        break;
      case 'about':
        label = 'Tentang mode demo';
        inner = `<h3 style="font-size:17px">Tentang mode demo</h3><div style="display:grid;gap:8px;font-size:13.5px;color:var(--ink-2)">
          <p>Prototipe ini memperlihatkan alur DiaScan: memindai kaki, mengirim hasil, dan ditinjau tenaga kesehatan.</p>
          <p>Foto pasien contoh adalah foto asli dari Wound Image Dataset (foto luka beserta mask segmentasinya, dan foto kaki normal). Kotak deteksi dihitung dari mask anotasi dataset; tombol <b>Tampilkan mask</b> memperlihatkan area lukanya.</p>
          <p>Belum ada model YOLO terlatih di dalamnya. Foto dari kamera atau Galeri dianalisis dengan pencarian area kemerahan sederhana.</p>
          <p>Pemantauan ${HEAL.weeks} minggu membandingkan luas luka tiap minggu dengan target turun 50% di minggu ke-${HEAL.weeks}. Foto tiap minggu berasal dari satu pasien yang sama di dataset, tetapi angka luasnya adalah data contoh. Tombol rana mencatat luas yang mengecil 12% dari pindai mingguan sebelumnya.</p>
          <p>Semua nama dan data adalah contoh. Data tersimpan hanya di peramban Anda.</p></div><button class="btn btn-primary" data-act="close-sheet">Tutup</button>`;
        break;
      case 'urgent':
        label = 'Laporkan keluhan';
        inner = `<h3 style="font-size:17px">Ada keluhan pada luka?</h3><p class="small muted">Centang yang Anda alami, lalu foto luka. Foto ini dicek untuk tanda bahaya dan tidak dihitung dalam grafik penyembuhan mingguan.</p>
          <form id="urgentForm" style="display:grid;gap:8px">${DANGER_SIGNS.map((x, i) => `<label class="optrow"><input type="checkbox" name="sym" value="${i}"><span class="grow" style="font-size:13.5px">${x}</span></label>`).join('')}
          <div class="row" style="margin-top:4px"><button type="button" class="btn btn-ghost grow" data-act="close-sheet">Batal</button><button class="btn btn-danger grow" type="submit">${ic('camera', 16, 2.2)}Lanjut memotret</button></div></form>`;
        break;
      case 'reset':
        label = 'Atur ulang data';
        inner = `<h3 style="font-size:17px">Atur ulang data demo?</h3><p class="muted">Semua pindaian, catatan, dan rujukan yang Anda buat akan dihapus, lalu data contoh dimuat ulang.</p>
          <div class="row"><button class="btn btn-ghost grow" data-act="close-sheet">Batal</button><button class="btn btn-danger grow" data-act="reset">Atur ulang</button></div>`;
        break;
      case 'delete':
        label = 'Hapus hasil';
        inner = `<h3 style="font-size:17px">Hapus hasil pindai ini?</h3><p class="muted">Hasil yang belum dikirim akan dihapus dari riwayat.</p>
          <div class="row"><button class="btn btn-ghost grow" data-act="close-sheet">Batal</button><button class="btn btn-danger grow" data-act="delete" data-id="${U.sheetId}">Hapus</button></div>`;
        break;
    }
    return `<div class="sheet-wrap" data-bg="sheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="${label}"><span class="grab"></span>${inner}</div></div>`;
  }

  function analyzingHTML() {
    const a = U.analyzing; if (!a) return '';
    return `<div class="analyzing" role="status" aria-live="polite"><div class="scanbox">${imgInner(a.image, 'slice')}<span class="scanline"></span></div>
      <b style="font-size:16px">Menganalisis foto…</b>
      <div class="ana-steps">${STEPS.map((t, i) => `<div class="${i < a.step ? 'ok' : i === a.step ? 'on' : ''}">${ic(i < a.step ? 'check' : 'clock', 15, 2.2)}${t}</div>`).join('')}</div></div>`;
  }

  // =====================================================================
  // TAMPILAN NAKES
  // =====================================================================
  const todayLabel = () => { const d = new Date(); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONF[d.getMonth()]} ${d.getFullYear()}`; };
  const isOpen = s => s.status === 'Menunggu' || s.status === 'Ditinjau';
  function queue() {
    const q = U.q.trim().toLowerCase();
    return S.scans.filter(s => s.sent)
      .filter(s => !q || patient(s.patientId).name.toLowerCase().includes(q) || patient(s.patientId).village.toLowerCase().includes(q))
      .sort((a, b) => (isOpen(b) - isOpen(a)) || (PRI[a.priority] - PRI[b.priority]) || (trendRank(a) - trendRank(b)) || (D(b.date) - D(a.date)));
  }
  // Laporan keluhan berbahaya lebih dulu, lalu "Disarankan rujuk", "Waspada", dst.
  function trendRank(s) {
    if (s.urgent) return s.urgent.danger ? -1 : 6;
    const hp = pointOf(s);
    return hp ? HEAL_INFO[hp.status].order : 5;
  }
  function trendCell(s) {
    if (s.urgent) return `<span class="chip t-red">${ic('alert', 11, 2.4)}Jalur darurat</span>`;
    const hp = pointOf(s);
    return hp ? `${healChip(hp.status)} <span class="small muted">Mg ${hp.wk}</span>` : '<span class="muted">–</span>';
  }
  const findingChips = s => s.detections.length
    ? [...new Map(s.detections.map(d => [d.cls, d])).values()].map(d => `<span class="chip ${CLS_CHIP[d.cls]}">${CLASSES[d.cls].label.replace('Tanda ', '')}</span>`).join('')
    : '<span class="chip t-gray">Tidak ada temuan</span>';

  function qTable(list, empty) {
    if (!list.length) return `<div class="empty">${ic('search', 24)}<b>${empty}</b></div>`;
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pasien · lokasi luka</th><th>Temuan AI</th><th>Tren ${HEAL.weeks} minggu</th><th>Wagner</th><th>Prioritas</th><th>Waktu</th><th>Status</th></tr></thead><tbody>
      ${list.map(s => { const p = patient(s.patientId), st = STATUS[s.status]; return `<tr data-act="sel" data-id="${s.id}" aria-selected="${U.sel === s.id}" tabindex="0">
        <td><div class="pt"><span class="avatar">${initials(p.name)}</span><div><b>${esc(p.name)}${s.mine && s.status === 'Menunggu' ? '<span class="new-badge">BARU</span>' : ''}</b><span>${p.age} th · ${s.foot} · ${esc(s.site)}</span></div></div></td>
        <td><div class="row" style="gap:4px">${findingChips(s)}</div></td>
        <td>${trendCell(s)}</td>
        <td><b>${s.wagner == null ? '–' : 'W' + s.wagner}</b></td>
        <td><span class="chip ${PRI_CHIP[s.priority]}">${s.priority}</span></td>
        <td class="muted">${relDate(s.date)}</td>
        <td><span class="status ${st.cls}">${s.status === 'Menunggu' ? 'Belum ditinjau' : st.label}</span></td></tr>`; }).join('')}
    </tbody></table></div>`;
  }

  function dlRow(d, s) {
    const c = CLASSES[d.cls];
    const sub = d.cls === 'ulkus' && s.area ? fmtArea(s.area) : c.desc;
    return `<div class="dl" style="--c:${c.color}"><span class="swatch"></span><b>${c.label}</b><span class="muted dsub">${sub}</span><div class="bar" style="margin:0"><span style="width:${d.manual ? '100%' : pct(d.conf)}"></span></div><b style="text-align:right">${d.manual ? 'Manual' : pct(d.conf)}</b></div>`;
  }
  function healBox(s) {
    const u = s.urgent;
    if (u) return `<div class="hbox${u.danger ? ' red' : ''}"><div class="row" style="justify-content:space-between;gap:8px"><b style="font-size:13px">Laporan keluhan · jalur darurat</b>${u.danger ? '<span class="chip t-red">Rujuk segera</span>' : '<span class="chip t-green">Tanpa tanda bahaya</span>'}</div>
      ${u.signs.length ? `<ul class="signs">${u.signs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="small muted">Pasien tidak mencentang gejala apa pun.</p>'}
      <p class="small muted">Tidak dihitung dalam tren luas luka.</p></div>`;
    const t = trackOf(s.patientId), hp = t && t.pts.find(p => p.id === s.id);
    if (!hp) return '';
    return `<div class="hbox"><div class="row" style="justify-content:space-between;gap:8px"><b style="font-size:13px">Tren ${HEAL.weeks} minggu · ${weekLabel(hp.wk)}</b>${healChip(hp.status)}</div>
      ${healChart(t, 340, 150)}<p class="small">${healReason(hp)} · foto awal ${fmtArea(t.a0)} (${shortDate(t.base)})</p></div>`;
  }
  function preview(s) {
    if (!s) return `<div class="card preview"><div class="empty">${ic('image', 26)}<b>Pilih pindaian</b><span class="small">Klik salah satu baris untuk melihat hasil deteksi.</span></div></div>`;
    const p = patient(s.patientId), prev = prevScan(s), done = !isOpen(s), st = STATUS[s.status], hp = pointOf(s);
    const suggest = (s.urgent && s.urgent.danger) || (hp && hp.status === 'rujuk');
    const ref = S.referrals.find(r => r.scanId === s.id);
    const fig = x => `<figure>${photo(x, { boxes: U.showBoxes, mask: U.showMask })}<figcaption>${shortDate(x.date)} · ${x.area ? fmtArea(x.area) : 'tanpa ulkus'}</figcaption></figure>`;
    return `<div class="card preview">
      <div class="row" style="justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:15.5px;font-weight:800">Pratinjau Deteksi</h2><p class="small muted">${esc(p.name)} · Kaki ${s.foot.toLowerCase()} · ${relDate(s.date)}</p></div>${s.wagner != null ? `<span class="chip t-amber">Wagner ${s.wagner} (est.)</span>` : ''}</div>
      ${U.compare && prev ? `<div class="cmp">${fig(prev)}${fig(s)}</div>` : photo(s, { boxes: U.showBoxes, mask: U.showMask })}
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <button class="chip ${U.showBoxes ? 't-teal' : 't-gray'}" data-act="toggle-boxes" aria-pressed="${U.showBoxes}">${ic('eye', 12)}Kotak deteksi</button>
        ${s.image.mask ? `<button class="chip ${U.showMask ? 't-teal' : 't-gray'}" data-act="toggle-mask" aria-pressed="${U.showMask}">${ic('layers', 12)}Mask</button>` : ''}
        ${prev ? `<button class="chip ${U.compare ? 't-teal' : 't-gray'}" data-act="compare" aria-pressed="${U.compare}">${ic('layers', 12)}Bandingkan ${shortDate(prev.date)}</button>` : ''}
        <span class="chip t-gray mono">${s.ms} ms</span>${s.image.ref ? `<span class="chip t-gray mono" title="Foto dari Wound Image Dataset">${esc(s.image.ref)}</span>` : '<span class="chip t-blue">Foto unggahan</span>'}
      </div>
      <div style="display:grid;gap:9px">${s.detections.length ? s.detections.map(d => dlRow(d, s)).join('') : '<p class="small muted">Tidak ada temuan pada foto ini.</p>'}</div>
      ${healBox(s)}
      <div class="row small" style="justify-content:space-between"><span class="muted">Status</span><span class="status ${st.cls}">${s.status === 'Menunggu' ? 'Belum ditinjau' : st.label}${s.reviewer ? ' · ' + esc(s.reviewer) : ''}</span></div>
      ${ref ? `<p class="small" style="background:var(--red-soft);color:var(--red);padding:8px 10px;border-radius:10px">Dirujuk ke <b>${esc(ref.hospital)}</b> (${ref.urgency})</p>` : ''}
      <div class="field"><label for="noteText">Catatan untuk pasien</label><textarea class="input" id="noteText" rows="2" placeholder="Contoh: Lanjutkan balutan lembap dan kontrol 3 hari lagi.">${esc(U.noteDraft)}</textarea></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">${done
        ? `<button class="btn btn-primary grow" data-act="note-only" data-id="${s.id}">${ic('send', 16, 2.2)}Kirim catatan</button>`
        : `<button class="btn btn-primary grow" data-act="validate" data-id="${s.id}">${ic('check', 16, 2.6)}Validasi</button><button class="btn btn-ghost grow" data-act="modal" data-m="correct" data-id="${s.id}">${ic('edit', 15, 2.2)}Koreksi</button><button class="btn btn-danger grow" data-act="modal" data-m="refer" data-id="${s.id}">${ic('hospital', 15, 2.1)}${suggest ? 'Rujuk (disarankan)' : 'Rujuk'}</button>`}</div>
    </div>`;
  }

  function wagnerDist() {
    const cut = Date.now() - 30 * 864e5, c = [0, 0, 0, 0, 0, 0];
    S.scans.filter(s => s.sent && s.wagner != null && D(s.date) >= cut).forEach(s => c[s.wagner]++);
    const W = 320, H = 190, pl = 28, pb = 24, pt = 18, max = Math.max(4, Math.ceil(Math.max(...c) / 4) * 4);
    const bw = 30, gap = (W - pl - 8 - bw * 6) / 5;
    let g = '';
    for (let v = 0; v <= max; v += max / 4) { const y = pt + (1 - v / max) * (H - pt - pb); g += `<line class="grid" x1="${pl}" x2="${W - 4}" y1="${y}" y2="${y}"/><text x="${pl - 7}" y="${y + 4}" font-size="10.5" text-anchor="end">${v}</text>`; }
    return { total: c.reduce((a, b) => a + b, 0), svg: `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribusi derajat Wagner: ${c.map((v, i) => 'W' + i + ' ' + v).join(', ')}">${g}${c.map((v, i) => {
      const x = pl + 6 + i * (bw + gap), h = v / max * (H - pt - pb), y = H - pb - h;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 0.5)}" rx="5" fill="${WAG_COL[i]}"/><text x="${x + bw / 2}" y="${y - 5}" font-size="11" font-weight="700" text-anchor="middle" style="fill:var(--ink-2)">${v}</text><text x="${x + bw / 2}" y="${H - 6}" font-size="11" text-anchor="middle">W${i}</text>`;
    }).join('')}</svg>` };
  }
  function weeklyTrend() {
    const W = 320, H = 190, pl = 28, pr = 10, pt = 18, pb = 24;
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - start.getDay() - 7 * 7);
    const a = Array(8).fill(0), b = Array(8).fill(0);
    S.scans.filter(s => s.sent).forEach(s => { const k = Math.floor((D(s.date) - start) / (7 * 864e5)); if (k >= 0 && k < 8) { a[k]++; if (s.priority === 'Tinggi') b[k]++; } });
    const max = Math.max(4, Math.ceil(Math.max(...a) / 4) * 4);
    const x = i => pl + i * (W - pl - pr) / 7, y = v => pt + (1 - v / max) * (H - pt - pb);
    let g = '';
    for (let v = 0; v <= max; v += max / 4) g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 7}" y="${y(v) + 4}" font-size="10.5" text-anchor="end">${v}</text>`;
    const pa = a.map((v, i) => `${x(i)},${y(v)}`).join(' '), pbp = b.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const id = 'gt' + (uid++);
    const lbl = i => { const d = new Date(start); d.setDate(d.getDate() + i * 7); return i === 7 ? 'Ini' : d.getDate() + '/' + (d.getMonth() + 1); };
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Jumlah pindaian per minggu: ${a.join(', ')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent-2);stop-opacity:.25"/><stop offset="1" style="stop-color:var(--accent-2);stop-opacity:0"/></linearGradient></defs>
      ${g}<polygon points="${x(0)},${y(0)} ${pa} ${x(7)},${y(0)}" fill="url(#${id})"/><polyline points="${pa}" fill="none" style="stroke:var(--accent-2)" stroke-width="2.6" stroke-linejoin="round"/>
      <polyline points="${pbp}" fill="none" style="stroke:var(--red)" stroke-width="2.2" stroke-dasharray="5 4" stroke-linejoin="round"/>
      ${a.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === 7 ? 4.5 : 3.2}" style="fill:${i === 7 ? 'var(--accent-2)' : 'var(--surface)'};stroke:var(--accent-2)" stroke-width="2"/><text x="${x(i)}" y="${H - 6}" font-size="10.5" text-anchor="middle">${lbl(i)}</text>`).join('')}</svg>`;
  }
  const TONE = { teal: ['var(--accent-soft)', 'var(--accent)'], green: ['var(--green-soft)', 'var(--green)'], violet: ['var(--violet-soft)', 'var(--violet)'], red: ['var(--red-soft)', 'var(--red)'], amber: ['var(--amber-soft)', 'var(--amber)'] };
  const feed = n => `<div class="feed">${S.activity.slice(0, n).map(a => `<div class="it"><span class="fi" style="background:${TONE[a.tone][0]};color:${TONE[a.tone][1]}">${ic(a.icon, 15, 2.2)}</span><span>${esc(a.text)}</span><span class="small muted">${relDate(a.date).replace('Hari ini, ', '')}</span></div>`).join('')}</div>`;

  function chead(title, sub, right = '') {
    return `<div class="chead"><div><h1>${title}</h1><p class="muted" style="font-size:13px;margin-top:2px">${sub}</p></div><div class="row" style="gap:10px;flex-wrap:wrap">${right}</div></div>`;
  }
  const searchBox = ph => `<label class="search">${ic('search', 17)}<span class="sr">Cari</span><input id="q" type="search" placeholder="${ph}" value="${esc(U.q)}" autocomplete="off"></label>`;

  function cDash() {
    const list = queue(), open = S.scans.filter(s => s.sent && isOpen(s));
    const tracks = S.patients.map(p => ({ p, t: trackOf(p.id) })).filter(x => x.t);
    const off = tracks.filter(x => x.t.status === 'waspada' || x.t.status === 'rujuk');
    if (!U.sel || !scanById(U.sel)) U.sel = (list[0] || {}).id || null;
    const wd = wagnerDist();
    const kpi = (i, tone, l, v, d, dc) => `<div class="card kpi"><span class="ki" style="background:${TONE[tone][0]};color:${TONE[tone][1]}">${ic(i, 22, 2.1)}</span><div><div class="l">${l}</div><div class="v">${v}</div><div class="d" style="color:${dc}">${d}</div></div></div>`;
    return chead('Dasbor Pemantauan Luka', todayLabel() + ' · Wilayah kerja Puskesmas Sukamaju',
      searchBox('Cari pasien atau desa…') + `<button class="btn btn-primary" data-act="modal" data-m="export">${ic('file', 16, 2.2)}Ekspor Laporan</button>`) +
      `<div class="kpis">
        ${kpi('users', 'teal', 'Pasien terpantau', S.patients.length, S.patients.filter(p => scansOf(p.id).some(s => s.area)).length + ' dengan luka aktif', 'var(--mut)')}
        ${kpi('trendUp', 'amber', 'Tidak sesuai target', off.length, off.filter(x => x.t.status === 'rujuk').length + ' disarankan rujuk', 'var(--amber)')}
        ${kpi('alert', 'red', 'Risiko tinggi terbuka', open.filter(s => s.priority === 'Tinggi').length, 'Perlu tindakan segera', 'var(--red)')}
        ${kpi('clock', 'amber', 'Belum ditinjau', open.filter(s => s.status === 'Menunggu').length, open.length + ' antrean terbuka', 'var(--mut)')}
      </div>
      <div class="split">
        <div class="card" style="overflow:hidden;min-width:0"><div class="panel-h"><div><h2>Antrean Triase Prioritas</h2><p>Diurutkan dari risiko tertinggi hasil deteksi AI</p></div><button class="btn btn-ghost btn-sm" data-act="cgo" data-v="queue">Lihat semua ${ic('right', 15)}</button></div>
          ${qTable(list.slice(0, 7), 'Tidak ada pasien yang cocok')}</div>
        ${preview(scanById(U.sel))}
      </div>
      ${healPanel(tracks)}
      <div class="charts">
        <div class="card"><h2 style="font-size:15px;font-weight:800">Distribusi Estimasi Derajat Wagner</h2><p class="small muted">30 hari terakhir · ${wd.total} pindaian dengan temuan</p><div style="margin-top:8px">${wd.svg}</div></div>
        <div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><h2 style="font-size:15px;font-weight:800">Tren Pindaian Mingguan</h2><p class="small muted">8 minggu terakhir</p></div>
          <div class="small muted" style="text-align:right;line-height:1.6"><span style="color:var(--accent-2);font-weight:800">━</span> Semua<br><span style="color:var(--red);font-weight:800">╍</span> Risiko tinggi</div></div><div style="margin-top:4px">${weeklyTrend()}</div></div>
        <div class="card"><h2 style="font-size:15px;font-weight:800">Aktivitas Terbaru</h2>${feed(5)}</div>
      </div>`;
  }

  function healPanel(tracks) {
    const rows = tracks.slice().sort((a, b) => (HEAL_INFO[a.t.status].order - HEAL_INFO[b.t.status].order) || a.p.name.localeCompare(b.p.name));
    return `<div class="card" style="overflow:hidden;min-width:0"><div class="panel-h"><div><h2>Pemantauan Penyembuhan ${HEAL.weeks} Minggu</h2><p>Luas luka tiap minggu dibandingkan target turun 50% di minggu ke-${HEAL.weeks}</p></div></div>
      ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pasien · lokasi luka</th><th>Minggu</th><th>Luas awal → terakhir</th><th>Perubahan / target</th><th>Tren</th><th>Status</th><th>Pindai berikutnya</th></tr></thead><tbody>
      ${rows.map(({ p, t }) => `<tr data-act="open-p" data-id="${p.id}" tabindex="0">
        <td><div class="pt"><span class="avatar">${initials(p.name)}</span><div><b>${esc(p.name)}</b><span>${p.age} th · ${t.foot} · ${esc(t.site)}</span></div></div></td>
        <td><b>${t.week}</b> <span class="muted">${t.week > HEAL.weeks ? `· setelah keputusan mg ${HEAL.weeks}` : t.week === HEAL.weeks ? '· keputusan' : '/ ' + HEAL.weeks}</span></td>
        <td>${fmtNum(t.a0)} → <b>${fmtArea(t.last.v)}</b></td>
        <td>${t.last.red < 0 ? `<b style="color:var(--red)">+${pctTxt(-t.last.red)}</b>` : `<b>−${pctTxt(t.last.red)}</b>`} <span class="muted">/ −${pctTxt(t.last.tgt)}</span></td>
        <td>${spark(p.id)}</td>
        <td>${healChip(t.status)}</td>
        <td class="muted">${dueLabel(t.next)}</td></tr>`).join('')}
      </tbody></table></div>` : `<div class="empty">${ic('activity', 24)}<b>Belum ada luka yang dipantau</b></div>`}</div>`;
  }

  function cQueue() {
    let list = queue();
    if (U.fPri !== 'Semua') list = list.filter(s => s.priority === U.fPri);
    if (U.fSt === 'aktif') list = list.filter(isOpen);
    if (!U.sel || !list.some(s => s.id === U.sel)) U.sel = (list[0] || {}).id || null;
    const f = (k, v, t) => `<button data-act="filter" data-k="${k}" data-v="${v}" aria-pressed="${U[k] === v}">${t}</button>`;
    return chead('Antrean Triase', 'Semua pindaian yang dikirim pasien dan kader', searchBox('Cari pasien atau desa…')) +
      `<div class="split"><div class="card" style="overflow:hidden;min-width:0">
        <div class="panel-h"><div class="filters" role="group" aria-label="Filter prioritas">${['Semua', 'Tinggi', 'Sedang', 'Rendah'].map(v => f('fPri', v, v)).join('')}</div>
          <div class="filters" role="group" aria-label="Filter status">${f('fSt', 'aktif', 'Perlu tindakan')}${f('fSt', 'semua', 'Semua status')}</div></div>
        ${qTable(list, U.fSt === 'aktif' ? 'Semua antrean sudah ditangani' : 'Tidak ada pindaian yang cocok')}</div>
        ${preview(list.length ? scanById(U.sel) : null)}</div>`;
  }

  function spark(pid) {
    const t = trackOf(pid), pts = t ? t.pts.map(p => p.v) : [];
    if (!t) return '<span class="small muted">Tanpa ulkus aktif</span>';
    if (pts.length < 2) return '<span class="small muted">Foto awal</span>';
    const W = 90, H = 26, lo = Math.min(...pts), hi = Math.max(...pts), r = hi - lo || 1;
    const P = pts.map((v, i) => `${(i * (W - 4) / (pts.length - 1) + 2).toFixed(1)},${(H - 3 - (v - lo) / r * (H - 6)).toFixed(1)}`).join(' ');
    const col = { waspada: 'var(--amber)', rujuk: 'var(--red)' }[t.status] || 'var(--green)';
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-label="Tren luas luka: ${HEAL_INFO[t.status].label}"><polyline points="${P}" fill="none" style="stroke:${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  }
  function cPatients() {
    const q = U.q.trim().toLowerCase();
    const ps = S.patients.filter(p => !q || p.name.toLowerCase().includes(q) || p.village.toLowerCase().includes(q));
    if (!patient(U.selPatient)) U.selPatient = 'p2';
    const sp = patient(U.selPatient), list = scansOf(sp.id), last = list[list.length - 1];
    const notes = S.notes.filter(n => n.patientId === sp.id).sort(byDate).reverse();
    const t = trackOf(sp.id);
    return chead('Data Pasien', S.patients.length + ' pasien diabetes di wilayah kerja', searchBox('Cari nama atau desa…')) +
      `<div class="pgrid">${ps.map(p => { const sc = scansOf(p.id), l = sc[sc.length - 1]; return `<button class="pcard-btn" data-act="selp" data-id="${p.id}" aria-pressed="${p.id === sp.id}">
        <div class="pt"><span class="avatar">${initials(p.name)}</span><div><b>${esc(p.name)}</b><span>${p.age} th · Desa ${p.village}</span></div></div>
        <div class="row" style="justify-content:space-between">${l ? `<span class="chip ${PRI_CHIP[l.priority]}">${l.priority}</span>` : '<span class="chip t-gray">Belum ada pindaian</span>'}${spark(p.id)}</div>
        <span class="row small muted" style="gap:6px;flex-wrap:wrap">${(pt => pt ? healChip(pt.status) : '')(trackOf(p.id))}${l ? 'Pindai terakhir ' + relDate(l.date) : '–'}</span></button>`; }).join('') || '<div class="empty">Tidak ada pasien yang cocok.</div>'}</div>
      <div class="split">
        <div class="card pcard" style="display:grid;gap:14px">
          <div class="row" style="justify-content:space-between;flex-wrap:wrap"><div class="pt"><span class="avatar" style="width:44px;height:44px;font-size:14px">${initials(sp.name)}</span><div><b style="font-size:16px">${esc(sp.name)}</b><span>${sp.age} th · ${sp.sex === 'L' ? 'Laki-laki' : 'Perempuan'} · ${sp.dm}</span></div></div>${last ? `<span class="chip ${PRI_CHIP[last.priority]}">Risiko ${last.priority.toLowerCase()}</span>` : ''}</div>
          <div><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px"><h2 style="font-size:14px;font-weight:800">Pemantauan ${HEAL.weeks} minggu${t ? ' · kaki ' + t.foot.toLowerCase() + ' · ' + esc(t.site) : ''}</h2>${t ? healChip(t.status) : ''}</div>
            ${t ? `<p class="small muted">${weekLabel(t.week)} · ${healReason(t.last)} · foto awal ${fmtArea(t.a0)} (${shortDate(t.base)}) · pindai berikutnya ${dueLabel(t.next).toLowerCase()}</p>` : ''}
            ${healChart(t, 560, 200)}${t ? healLegend() : ''}</div>
          <div><h2 style="font-size:14px;font-weight:800;margin-bottom:8px">Riwayat pindaian (${list.length})</h2>
            <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Temuan</th><th>Luas</th><th>Wagner</th><th>Status</th></tr></thead><tbody>
            ${list.slice().reverse().map(s => `<tr data-act="open-c" data-id="${s.id}" tabindex="0"><td>${relDate(s.date)}</td><td><div class="row" style="gap:4px">${findingChips(s)}${urgentChip(s)}</div></td><td>${s.area ? fmtArea(s.area) : '–'}</td><td><b>${s.wagner == null ? '–' : 'W' + s.wagner}</b></td><td><span class="status ${STATUS[s.status].cls}">${STATUS[s.status].label}</span></td></tr>`).join('')}
            </tbody></table></div></div>
        </div>
        <div class="card pcard" style="display:grid;gap:12px">
          <h2 style="font-size:15px;font-weight:800">Catatan untuk pasien</h2>
          <form id="pNoteForm" class="field" style="gap:8px"><label for="pNote" class="sr">Tulis catatan</label><textarea class="input" id="pNote" rows="3" placeholder="Tulis pesan untuk ${esc(sp.name)}…">${esc(U.pNote)}</textarea><button class="btn btn-primary" type="submit">${ic('send', 16, 2.2)}Kirim ke aplikasi pasien</button></form>
          ${notes.length ? notes.map(n => `<div style="border-top:1px solid var(--line-2);padding-top:10px"><div class="small muted">${esc(n.author)} · ${relDate(n.date)}</div><p style="font-size:13px;margin-top:3px">${esc(n.text)}</p></div>`).join('') : '<p class="small muted">Belum ada catatan.</p>'}
        </div>
      </div>`;
  }

  function cReferrals() {
    const list = S.referrals.slice().sort(byDate).reverse();
    return chead('Rujukan', 'Pasien yang dirujuk ke rumah sakit') + `<div class="card" style="overflow:hidden">
      ${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pasien</th><th>Rumah sakit tujuan</th><th>Urgensi</th><th>Alasan</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>
      ${list.map(r => { const p = patient(r.patientId); return `<tr style="cursor:default"><td><div class="pt"><span class="avatar">${initials(p.name)}</span><div><b>${esc(p.name)}</b><span>${p.age} th · Desa ${p.village}</span></div></div></td>
        <td>${esc(r.hospital)}</td><td><span class="chip ${r.urgency === 'Segera' ? 't-red' : 't-gray'}">${r.urgency}</span></td><td style="white-space:normal;min-width:220px">${esc(r.reason)}</td><td class="muted">${relDate(r.date)}</td>
        <td><label class="sr" for="rs-${r.id}">Status rujukan</label><select class="input" id="rs-${r.id}" data-ref="${r.id}" style="width:auto;padding:6px 10px">${['Dijadwalkan', 'Diterima RS', 'Selesai'].map(o => `<option${o === r.status ? ' selected' : ''}>${o}</option>`).join('')}</select></td></tr>`; }).join('')}
      </tbody></table></div>` : `<div class="empty">${ic('hospital', 26)}<b>Belum ada rujukan</b><span class="small">Rujukan dibuat dari panel pratinjau deteksi.</span></div>`}</div>`;
  }

  function cModel() {
    const m = S.model, tr = U.training;
    const ready = m.corrections >= 10;
    return chead('Model AI', 'Pemantauan model deteksi dan pelatihan ulang dari koreksi dokter') +
      `<div class="split">
        <div style="display:grid;gap:16px;min-width:0">
          <div class="card pcard" style="display:grid;gap:12px">
            <div class="row" style="justify-content:space-between;flex-wrap:wrap"><div><h2 style="font-size:16px;font-weight:800">${esc(m.version)}</h2><p class="small muted">Model aktif di server · varian nano berjalan di ponsel</p></div><span class="chip t-green">${ic('check', 12, 3)}Aktif</span></div>
            <dl class="kv"><dt>Arsitektur</dt><dd>YOLO11s (server) · YOLO11n (ponsel)</dd><dt>Kelas</dt><dd>Ulkus, Tanda infeksi, Nekrosis, Kalus</dd><dt>Ukuran input</dt><dd>640 × 640 piksel</dd><dt>Format</dt><dd>ONNX (server) · TFLite (ponsel)</dd><dt>Data latih</dt><dd>Wound Image Dataset (2.686 foto luka + mask, 2.757 foto kaki normal) + citra lokal Puskesmas mitra</dd></dl>
            <p class="demo-note">${ic('info', 13)}<span>Mode demo: halaman ini mensimulasikan siklus pelatihan ulang; belum ada model yang benar-benar dilatih.</span></p>
          </div>
          <div class="card pcard" style="display:grid;gap:10px">
            <h2 style="font-size:15px;font-weight:800">Koreksi label terbaru</h2>
            ${S.corrections.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Waktu</th><th>Pasien</th><th>Label AI</th><th>Koreksi dokter</th></tr></thead><tbody>${S.corrections.slice(0, 8).map(c => `<tr style="cursor:default"><td class="muted">${relDate(c.date)}</td><td>${esc(patient(c.patientId).name)}</td><td>${esc(c.from)}</td><td><b>${esc(c.to)}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">Belum ada koreksi.</p>'}
          </div>
        </div>
        <div class="card pcard" style="display:grid;gap:12px">
          <h2 style="font-size:15px;font-weight:800">Pelatihan ulang</h2>
          <p class="small muted">Setiap koreksi dokter disimpan sebagai data latih baru. Pelatihan ulang disarankan setelah ${m.threshold} koreksi.</p>
          <div class="row" style="justify-content:space-between"><b style="font-size:24px">${m.corrections}<span class="small muted" style="font-weight:600"> / ${m.threshold} koreksi</span></b></div>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${m.threshold}" aria-valuenow="${m.corrections}"><span style="width:${clamp(m.corrections / m.threshold * 100, 0, 100)}%"></span></div>
          ${tr ? `<div style="display:grid;gap:6px"><div class="row small" style="justify-content:space-between"><span>Melatih model… epoch ${Math.round(tr.pct / 2)} / 50</span><b>${Math.round(tr.pct)}%</b></div><div class="progress"><span style="width:${tr.pct}%"></span></div></div>`
            : `<button class="btn btn-primary" data-act="train" ${ready ? '' : 'disabled'}>${ic('play', 15, 2.2)}Mulai pelatihan ulang</button>${ready ? '' : '<p class="small muted">Butuh minimal 10 koreksi.</p>'}`}
          <h3 style="font-size:13.5px;font-weight:800;margin-top:6px">Riwayat versi</h3>
          ${m.history.map(h => `<div style="border-top:1px solid var(--line-2);padding-top:8px"><b>${esc(h.version)}</b> <span class="small muted">· ${fmtDate(h.date)}</span><p class="small muted">${esc(h.note)}</p></div>`).join('')}
        </div>
      </div>`;
  }

  // ---------- modal nakes ----------
  function modalHTML() {
    const m = U.modal; if (!m) return '';
    let inner = '';
    const s = m.id ? scanById(m.id) : null;
    if (m.type === 'correct' && s) {
      inner = `<h3 id="mTitle">Koreksi label · ${esc(patient(s.patientId).name)}</h3><p class="small muted">Perbaikan Anda disimpan sebagai data latih untuk pelatihan ulang model.</p>
        <form id="correctForm" style="display:grid;gap:10px">
        ${s.detections.map((d, i) => `<div class="optrow"><span class="swatch" style="--c:${CLASSES[d.cls].color}"></span><span class="grow"><b>${CLASSES[d.cls].label}</b> <span class="small muted">${d.manual ? 'manual' : pct(d.conf)}</span></span>
          <label class="sr" for="cls-${i}">Label untuk temuan ${i + 1}</label><select class="input" id="cls-${i}" style="width:auto">${Object.keys(CLASSES).map(k => `<option value="${k}"${k === d.cls ? ' selected' : ''}>${CLASSES[k].label}</option>`).join('')}<option value="hapus">Bukan temuan (hapus)</option></select></div>`).join('') || '<p class="small muted">AI tidak menemukan apa pun pada foto ini.</p>'}
        <div class="field"><label for="addCls">Tambah temuan yang terlewat</label><select class="input" id="addCls"><option value="">Tidak ada</option>${Object.keys(CLASSES).map(k => `<option value="${k}">${CLASSES[k].label}</option>`).join('')}</select></div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-act="close-modal">Batal</button><button class="btn btn-primary" type="submit">Simpan koreksi</button></div></form>`;
    } else if (m.type === 'refer' && s) {
      const ai = 'Temuan AI: ' + findingsText(s).toLowerCase() + (s.wagner != null ? `, estimasi Wagner ${s.wagner}` : '') + '.';
      const hp = pointOf(s), t = hp && trackOf(s.patientId);
      let reason = ai + ' Mohon evaluasi lanjutan.';
      if (s.urgent && s.urgent.danger) reason = `Laporan keluhan pasien: ${s.urgent.signs.join('; ')}. ${ai} Mohon evaluasi segera.`;
      else if (hp && hp.status === 'rujuk') reason = `Luas ulkus hanya turun ${pctTxt(hp.red)} dalam ${hp.wk} minggu (${fmtNum(t.a0)} → ${fmtNum(hp.v)} cm²; patokan ≥ 50%). ${ai} Mohon evaluasi lanjutan (vaskular, infeksi, offloading).`;
      else if (hp && hp.status === 'waspada') reason = `Penyembuhan lebih lambat dari target: ${healReason(hp).toLowerCase()}, minggu ke-${hp.wk}. ${ai} Mohon evaluasi lanjutan.`;
      inner = `<h3 id="mTitle">Rujuk · ${esc(patient(s.patientId).name)}</h3>
        <form id="referForm" style="display:grid;gap:12px">
        <div class="field"><label for="refHosp">Rumah sakit tujuan</label><select class="input" id="refHosp">${HOSPITALS.map(h => `<option>${h}</option>`).join('')}</select></div>
        <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:12.5px;font-weight:700;color:var(--ink-2);margin-bottom:6px">Urgensi</legend>
          <label class="optrow"><input type="radio" name="urg" value="Segera" ${s.priority === 'Tinggi' ? 'checked' : ''}><span class="grow"><b>Segera</b> <span class="small muted">dalam 24 jam</span></span></label>
          <label class="optrow"><input type="radio" name="urg" value="Terjadwal" ${s.priority !== 'Tinggi' ? 'checked' : ''}><span class="grow"><b>Terjadwal</b> <span class="small muted">dalam 1–2 minggu</span></span></label></fieldset>
        <div class="field"><label for="refReason">Alasan rujukan</label><textarea class="input" id="refReason" rows="3">${esc(reason)}</textarea></div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-act="close-modal">Batal</button><button class="btn btn-danger" type="submit">${ic('hospital', 15, 2.1)}Buat rujukan</button></div></form>`;
    } else if (m.type === 'export') {
      const rows = [['Tanggal', 'Waktu', 'Pasien', 'Usia', 'Desa', 'Kaki', 'Lokasi', 'Temuan', 'Wagner (est.)', 'Prioritas', 'Luas (cm2)', `Tren ${HEAL.weeks} minggu`, 'Status']]
        .concat(queue().map(s => { const p = patient(s.patientId); return [fmtDate(s.date), fmtTime(s.date), p.name, p.age, p.village, s.foot, s.site, findingsText(s), s.wagner ?? '', s.priority, s.area ? fmtNum(s.area) : '', s.urgent ? 'Jalur darurat' : (hp => hp ? `${HEAL_INFO[hp.status].label} (minggu ${hp.wk})` : '')(pointOf(s)), STATUS[s.status].label]; }));
      const csv = rows.map(r => r.map(v => /[",;\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
      inner = `<h3 id="mTitle">Ekspor laporan</h3><p class="small muted">${rows.length - 1} pindaian dalam format CSV. Salin lalu tempel ke Excel atau Google Sheets.</p>
        <pre class="csv" id="csvText" tabindex="0">${esc(csv)}</pre>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-act="close-modal">Tutup</button><button class="btn btn-primary" data-act="copy-csv">${ic('copy', 15, 2.2)}Salin CSV</button></div>`;
    } else if (m.type === 'reset') {
      inner = `<h3 id="mTitle">Atur ulang data demo?</h3><p class="muted">Semua pindaian, catatan, koreksi, dan rujukan yang Anda buat akan dihapus, lalu data contoh dimuat ulang.</p>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-act="close-modal">Batal</button><button class="btn btn-danger" data-act="reset">Atur ulang</button></div>`;
    }
    return `<div class="modal-wrap" data-bg="modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">${inner}</div></div>`;
  }

  // =====================================================================
  // RENDER
  // =====================================================================
  const LOGO = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M12 8v8M8 12h8"/></svg>';
  const P_ITEMS = [['home', 'Beranda', 'home'], ['scan', 'Pindai Luka', 'camera'], ['history', 'Riwayat', 'clock'], ['edu', 'Edukasi', 'book'], ['profile', 'Profil', 'user']];
  const C_ITEMS = [['dash', 'Dasbor', 'grid'], ['queue', 'Antrean', 'list'], ['patients', 'Pasien', 'users'], ['referrals', 'Rujukan', 'hospital'], ['model', 'Model AI', 'cpu']];
  const P_VIEWS = { home: pHome, scan: pScan, result: pResult, history: pHistory, edu: pEdu, profile: pProfile };
  const C_VIEWS = { dash: cDash, queue: cQueue, patients: cPatients, referrals: cReferrals, model: cModel };

  // Satu kerangka: sidebar di layar lebar, bilah atas + navigasi bawah di layar ≤ 768px (diatur oleh CSS).
  function shell() {
    const pas = U.mode === 'pasien';
    const waiting = S.scans.filter(s => s.sent && s.status === 'Menunggu').length;
    const cur = pas ? (U.pv === 'result' ? 'history' : U.pv) : U.cv;
    const act = pas ? 'pgo' : 'cgo';
    const roleSeg = `<div class="seg" role="group" aria-label="Pilih peran">
      <button data-act="mode" data-mode="pasien" aria-pressed="${pas}">${ic('user', 15)}<span class="lbl">Pasien</span></button>
      <button data-act="mode" data-mode="nakes" aria-pressed="${!pas}">${ic('monitor', 15)}<span class="lbl">Nakes</span></button></div>`;
    const me = patient(S.me);
    const who = pas
      ? `<span class="avatar">${initials(me.name)}</span><div><b>${esc(me.name)}</b><span>Pasien · Desa ${me.village}</span></div>`
      : '<span class="avatar">RP</span><div><b>dr. Rina Pratiwi</b><span>Dokter · Puskesmas Sukamaju</span></div>';
    const bn = pas ? [P_ITEMS[0], P_ITEMS[2], null, P_ITEMS[3], P_ITEMS[4]] : C_ITEMS;
    return `<div class="app${pas && S.prefs.bigText ? ' big-text' : ''}">
      <aside class="side" aria-label="Menu utama">
        <div class="brand"><span class="logo">${LOGO}</span>DiaScan</div>
        ${roleSeg}
        <div class="label">${pas ? 'APLIKASI PASIEN' : 'PUSKESMAS SUKAMAJU'}</div>
        ${(pas ? P_ITEMS : C_ITEMS).map(([k, t, i]) => `<button class="m" data-act="${act}" data-v="${k}"${cur === k ? ' aria-current="page"' : ''}>${ic(i, 19)}${t}${!pas && k === 'queue' && waiting ? `<span class="badge">${waiting}</span>` : ''}</button>`).join('')}
        <div class="demo"><b>${ic('info', 13)}Mode demo · data contoh</b>
          <span>${pas ? 'Pindai lalu kirim hasil, kemudian pilih peran Nakes untuk meninjaunya.' + (waiting ? ` Saat ini ${waiting} pindaian menunggu tinjauan.` : '') : 'Hasil kiriman dari peran Pasien muncul di antrean dengan tanda BARU.'}</span>
          <button data-act="modal" data-m="reset">${ic('refresh', 13)}Atur ulang data</button></div>
        <div class="who">${who}</div>
      </aside>
      <header class="mbar"><div class="brand"><span class="logo">${LOGO}</span>DiaScan</div>${roleSeg}</header>
      <main class="main" id="main">${(pas ? P_VIEWS[U.pv] || pHome : C_VIEWS[U.cv] || cDash)()}</main>
      <nav class="bnav" aria-label="Navigasi">${bn.map(n => n
        ? `<button data-act="${act}" data-v="${n[0]}"${cur === n[0] ? ' aria-current="page"' : ''}>${ic(n[2], 22, cur === n[0] ? 2.3 : 1.9)}${n[1].replace(' Luka', '')}${!pas && n[0] === 'queue' && waiting ? `<span class="badge">${waiting}</span>` : ''}</button>`
        : `<button data-act="pgo" data-v="scan" style="color:var(--accent)" aria-label="Pindai luka"><span class="fab">${ic('camera', 24, 2.2)}</span>Pindai</button>`).join('')}</nav>
    </div>`;
  }
  function render() {
    const ae = document.activeElement;
    const focus = ae && ae.id ? { id: ae.id, s: ae.selectionStart, e: ae.selectionEnd } : null;
    root.innerHTML = shell() + analyzingHTML() + (U.mode === 'pasien' ? sheetHTML() : '') + modalHTML();
    if (focus) {
      const el = document.getElementById(focus.id);
      if (el) { el.focus({ preventScroll: true }); try { if (focus.s != null) el.setSelectionRange(focus.s, focus.e); } catch (e) { /* jenis input tanpa seleksi */ } }
    }
    attachCamera();
    if ((U.modal || U.sheet) && !focus) { const f = document.querySelector('.modal input, .modal select, .sheet input, .modal .btn-primary, .sheet .btn-primary'); if (f) f.focus({ preventScroll: true }); }
  }

  // ---------- aksi ----------
  function goPatient(v) {
    if (v !== 'scan') { stopCamera(); U.urgent = null; }
    if (v === U.pv) { render(); return; }
    if (['home', 'history', 'edu', 'profile'].includes(v)) U.pStack = [];
    else U.pStack.push(U.pv);
    U.pv = v; U.sheet = null;
    render(); window.scrollTo({ top: 0 });
  }
  function addNote(pid, scanId, text) {
    S.notes.push({ id: 'n' + Date.now().toString(36), patientId: pid, scanId, author: 'dr. Rina Pratiwi', text, date: new Date().toISOString(), read: false, demo: true });
  }
  function markReviewed(s) { if (s.mine) S.seen.reviewed = true; }

  const A = {
    mode: t => {
      U.mode = t.dataset.mode; writeLS(MODE_KEY, U.mode); stopCamera(); U.sheet = null;
      if (U.mode === 'nakes') {
        const mine = S.scans.filter(s => s.mine && s.sent && s.status === 'Menunggu').pop();
        if (mine) { U.cv = 'dash'; U.sel = mine.id; U.noteDraft = ''; U.compare = false; }
      }
      render(); window.scrollTo({ top: 0 });
    },
    pgo: t => goPatient(t.dataset.v),
    pback: () => { stopCamera(); U.urgent = null; U.pv = U.pStack.pop() || 'home'; if (U.pv === 'result' && !scanById(U.scanId)) U.pv = 'home'; render(); window.scrollTo({ top: 0 }); },
    sheet: t => {
      U.sheet = t.dataset.s; U.sheetId = t.dataset.id || null;
      if (U.sheet === 'notif') {
        const mine = S.notes.filter(n => n.patientId === S.me);
        if (mine.some(n => n.demo && !n.read)) S.seen.readNote = true;
        mine.forEach(n => { n.read = true; }); persist();
      }
      render();
    },
    'close-sheet': () => { U.sheet = null; render(); },
    rem: t => { const r = S.reminders.find(x => x.id === t.dataset.id); r.done = !r.done; persist(); render(); },
    'open-scan': t => { U.scanId = t.dataset.id; U.showBoxes = true; goPatient('result'); },
    'toggle-boxes': () => { U.showBoxes = !U.showBoxes; render(); },
    'toggle-mask': () => { U.showMask = !U.showMask; render(); },
    foot: t => { U.foot = t.dataset.f; render(); },
    'urgent-cancel': () => { U.urgent = null; render(); },
    upload: () => fileInput.click(),
    shoot: () => shoot(),
    camera: () => { if (U.cam) { stopCamera(); render(); } else startCamera(); },
    send: t => {
      const s = scanById(t.dataset.id); s.sent = true; s.status = 'Menunggu'; S.seen.sent = true;
      log('send', 'teal', `${patient(s.patientId).name} mengirim pindaian baru dari aplikasi`); persist();
      toast('Terkirim ke Puskesmas Sukamaju'); render();
    },
    delete: t => { S.scans = S.scans.filter(s => s.id !== t.dataset.id); U.sheet = null; persist(); U.pStack = []; U.pv = 'history'; toast('Hasil pindai dihapus', 'trash'); render(); },
    htab: t => { U.histTab = t.dataset.t; render(); },
    pref: t => { const k = t.dataset.k; S.prefs[k] = !S.prefs[k]; persist(); render(); },
    reset: () => {
      stopCamera(); S = seed(new Date()); persist();
      Object.assign(U, { pv: 'home', pStack: [], scanId: null, sheet: null, modal: null, sel: null, q: '', fPri: 'Semua', fSt: 'aktif', compare: false, selPatient: 'p2', training: null, noteDraft: '', pNote: '', histTab: 'area', urgent: null });
      toast('Data demo dimuat ulang', 'refresh'); render();
    },
    // nakes
    cgo: t => { U.cv = t.dataset.v; U.q = ''; render(); window.scrollTo({ top: 0 }); },
    sel: t => {
      const s = scanById(t.dataset.id); if (!s) return;
      if (U.sel !== s.id) { U.noteDraft = ''; U.compare = false; }
      U.sel = s.id;
      if (s.status === 'Menunggu') { s.status = 'Ditinjau'; s.reviewer = 'dr. Rina'; persist(); }
      render();
      if (window.innerWidth <= 1240) { const pv = document.querySelector('.preview'); if (pv) pv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    },
    'open-c': t => { U.cv = 'queue'; U.fSt = 'semua'; U.fPri = 'Semua'; U.q = ''; A.sel(t); },
    compare: () => { U.compare = !U.compare; render(); },
    filter: t => { U[t.dataset.k] = t.dataset.v; render(); },
    selp: t => { U.selPatient = t.dataset.id; U.pNote = ''; render(); },
    'open-p': t => { U.cv = 'patients'; U.selPatient = t.dataset.id; U.q = ''; U.pNote = ''; render(); window.scrollTo({ top: 0 }); },
    validate: t => {
      const s = scanById(t.dataset.id), p = patient(s.patientId);
      s.status = 'Divalidasi'; s.reviewer = 'dr. Rina';
      const txt = U.noteDraft.trim();
      const hp = pointOf(s);
      const auto = s.priority === 'Tinggi' ? 'Mohon datang ke Puskesmas hari ini untuk perawatan luka.'
        : hp && hp.status === 'rujuk' ? `Penurunan luas luka belum mencapai patokan ${HEAL.weeks} minggu. Mohon datang ke Puskesmas untuk membahas rujukan.`
        : hp && hp.status === 'waspada' ? 'Luka mengecil lebih lambat dari target. Mohon kontrol ke Puskesmas minggu ini.'
        : 'Lanjutkan perawatan sesuai anjuran dan pindai kembali minggu depan di hari yang sama.';
      addNote(s.patientId, s.id, txt || 'Hasil pindai Anda sudah diperiksa. ' + auto);
      U.noteDraft = ''; markReviewed(s);
      log('check', 'green', `Pindaian ${p.name} divalidasi`); persist();
      toast(`Hasil ${p.name} divalidasi · notifikasi dikirim ke pasien`); render();
    },
    'note-only': t => {
      const s = scanById(t.dataset.id), txt = U.noteDraft.trim();
      if (!txt) { toast('Tulis catatan terlebih dahulu.', 'info'); document.getElementById('noteText')?.focus(); return; }
      addNote(s.patientId, s.id, txt); U.noteDraft = ''; markReviewed(s);
      log('msg', 'teal', `Catatan dikirim ke ${patient(s.patientId).name}`); persist();
      toast('Catatan terkirim ke aplikasi pasien'); render();
    },
    modal: t => { U.modal = { type: t.dataset.m, id: t.dataset.id || null }; render(); },
    'close-modal': () => { U.modal = null; render(); },
    'copy-csv': () => {
      const txt = document.getElementById('csvText').textContent;
      const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('csvText')); const w = getSelection(); w.removeAllRanges(); w.addRange(r); toast('Teks dipilih. Tekan Ctrl+C untuk menyalin.', 'copy'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('CSV disalin', 'copy'), sel);
      else sel();
    },
    train: () => {
      if (U.training) return;
      U.training = { pct: 0 }; render();
      const iv = setInterval(() => {
        if (!U.training) { clearInterval(iv); return; }
        U.training.pct = Math.min(100, U.training.pct + 2.5);
        if (U.training.pct >= 100) {
          clearInterval(iv);
          const cur = +(S.model.version.match(/v1\.(\d+)/) || [0, 3])[1];
          const nv = 'v1.' + (cur + 1);
          S.model.history.unshift({ version: nv, date: new Date().toISOString(), note: `Pelatihan ulang dengan ${S.model.corrections} koreksi dokter` });
          S.model.version = 'YOLO11s-DFU ' + nv; S.model.corrections = 0; U.training = null;
          log('cpu', 'violet', `Model diperbarui ke ${nv} dan dikirim ke aplikasi`); persist();
          toast(`Pelatihan selesai · model ${nv} aktif`);
        }
        if (U.mode === 'nakes' && U.cv === 'model') render();
      }, 110);
    },
  };

  root.addEventListener('click', e => {
    const bg = e.target.dataset && e.target.dataset.bg;
    if (bg === 'sheet') { U.sheet = null; render(); return; }
    if (bg === 'modal') { U.modal = null; render(); return; }
    const t = e.target.closest('[data-act]');
    if (!t || !root.contains(t)) return;
    const fn = A[t.dataset.act];
    if (fn) { e.preventDefault(); fn(t, e); }
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (U.modal) { U.modal = null; render(); } else if (U.sheet) { U.sheet = null; render(); } return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-act]')) { e.preventDefault(); A[e.target.dataset.act](e.target); }
  });
  root.addEventListener('input', e => {
    if (e.target.id === 'q') { U.q = e.target.value; render(); }
    else if (e.target.id === 'noteText') U.noteDraft = e.target.value;
    else if (e.target.id === 'pNote') U.pNote = e.target.value;
  });
  root.addEventListener('change', e => {
    const id = e.target.dataset && e.target.dataset.ref;
    if (id) { const r = S.referrals.find(x => x.id === id); r.status = e.target.value; log('hospital', 'red', `Status rujukan ${patient(r.patientId).name}: ${r.status}`); persist(); toast('Status rujukan diperbarui'); }
  });
  root.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'urgentForm') {
      U.urgent = { symptoms: [...f.querySelectorAll('input[name="sym"]:checked')].map(x => DANGER_SIGNS[+x.value]) };
      goPatient('scan');
    } else if (f.id === 'glucoseForm') {
      const v = +document.getElementById('glucoseInput').value;
      if (!v || v < 40 || v > 600) { toast('Masukkan angka antara 40 dan 600 mg/dL.', 'alert'); return; }
      S.vitals.glucose = Math.round(v); S.vitals.glucoseAt = new Date().toISOString(); U.sheet = null; persist();
      toast(v > 250 ? 'Tersimpan. Gula darah tinggi: hubungi Puskesmas bila berlanjut.' : 'Gula darah tersimpan', v > 250 ? 'alert' : 'check'); render();
    } else if (f.id === 'correctForm') {
      const s = scanById(U.modal.id), p = patient(s.patientId);
      let changes = 0; const next = [];
      s.detections.forEach((d, i) => {
        const v = document.getElementById('cls-' + i).value;
        if (v === 'hapus') { changes++; S.corrections.unshift({ date: new Date().toISOString(), patientId: p.id, from: CLASSES[d.cls].label, to: 'Bukan temuan' }); return; }
        if (v !== d.cls) { changes++; S.corrections.unshift({ date: new Date().toISOString(), patientId: p.id, from: CLASSES[d.cls].label, to: CLASSES[v].label }); next.push({ ...d, cls: v, manual: true }); return; }
        next.push(d);
      });
      const add = document.getElementById('addCls').value;
      if (add) { changes++; next.push({ cls: add, conf: 1, manual: true, box: [0.3, 0.3, 0.4, 0.4] }); S.corrections.unshift({ date: new Date().toISOString(), patientId: p.id, from: '(tidak terdeteksi)', to: CLASSES[add].label }); }
      if (!changes) { U.modal = null; toast('Tidak ada perubahan label', 'info'); render(); return; }
      s.detections = next; Object.assign(s, assess(next, s.area)); S.model.corrections += changes;
      log('edit', 'violet', `dr. Rina mengoreksi ${changes} label pada pindaian ${p.name}`); persist();
      U.modal = null; toast(`${changes} label dikoreksi · disimpan untuk pelatihan ulang`); render();
    } else if (f.id === 'referForm') {
      const s = scanById(U.modal.id), p = patient(s.patientId);
      const hosp = document.getElementById('refHosp').value, urg = (f.querySelector('input[name="urg"]:checked') || {}).value || 'Terjadwal';
      const reason = document.getElementById('refReason').value.trim() || 'Evaluasi lanjutan luka kaki diabetik';
      S.referrals.push({ id: 'r' + Date.now().toString(36), patientId: p.id, scanId: s.id, hospital: hosp, urgency: urg, reason, date: new Date().toISOString(), status: 'Dijadwalkan' });
      s.status = 'Dirujuk'; s.reviewer = 'dr. Rina'; markReviewed(s);
      addNote(p.id, s.id, `Anda dirujuk ke ${hosp} (${urg === 'Segera' ? 'segera, dalam 24 jam' : 'terjadwal'}). Bawa kartu BPJS dan tunjukkan hasil pindai ini kepada petugas.` + (U.noteDraft.trim() ? ' ' + U.noteDraft.trim() : ''));
      U.noteDraft = ''; log('hospital', 'red', `${p.name} dirujuk ke ${hosp}`); persist();
      U.modal = null; toast(`Rujukan ke ${hosp} dibuat`); render();
    } else if (f.id === 'pNoteForm') {
      const txt = U.pNote.trim(); if (!txt) { toast('Tulis catatan terlebih dahulu.', 'info'); return; }
      addNote(U.selPatient, null, txt); U.pNote = '';
      if (U.selPatient === S.me) S.seen.reviewed = true;
      log('msg', 'teal', `Catatan dikirim ke ${patient(U.selPatient).name}`); persist();
      toast('Catatan terkirim ke aplikasi pasien'); render();
    }
  });

  liveTimer = setInterval(liveTick, 450);
  render();
})();
