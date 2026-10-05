/* DiaScan — ikon, aturan klinis, foto dataset, dan data contoh (mode demo). */
(function (global) {
  'use strict';

  // ---------- Ikon (gaya Feather) ----------
  const I = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    down: '<polyline points="6 9 12 15 18 9"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    trendDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    trendUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    edit: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>',
    focus: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><circle cx="12" cy="12" r="3"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    hospital: '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  };
  const ic = (n, s = 20, w = 2) =>
    `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

  // ---------- Kelas deteksi ----------
  const CLASSES = {
    ulkus: { label: 'Ulkus', color: 'var(--box-ulkus)', desc: 'Luka terbuka' },
    infeksi: { label: 'Tanda infeksi', color: 'var(--box-infeksi)', desc: 'Kemerahan di sekitar luka' },
    nekrosis: { label: 'Nekrosis', color: 'var(--box-nekrosis)', desc: 'Jaringan menghitam' },
    kalus: { label: 'Kalus', color: 'var(--box-kalus)', desc: 'Penebalan kulit (praulkus)' },
  };

  // Aturan triase sederhana (simulasi) dari temuan deteksi
  function assess(dets, area) {
    const has = c => dets.some(d => d.cls === c);
    let wagner = null, priority = 'Rendah';
    if (has('nekrosis')) { wagner = 4; priority = 'Tinggi'; }
    else if (has('ulkus') && has('infeksi')) { wagner = 2; priority = 'Tinggi'; }
    else if (has('ulkus')) { wagner = area && area >= 4 ? 2 : 1; priority = 'Sedang'; }
    else if (has('kalus')) { wagner = 0; priority = 'Rendah'; }
    return { wagner, priority };
  }

  // ---------- Pemantauan penyembuhan 4 minggu (jalur tren) ----------
  // Patokan klinis: ulkus kaki diabetik yang luasnya tidak turun ≥ 50% dalam 4 minggu perawatan
  // standar kemungkinan besar tidak sembuh dalam 12 minggu (Sheehan dkk., Diabetes Care 2003; IWGDF).
  // Ambang "waspada" di minggu ke-1–3 adalah aturan tim (belum baku) dan perlu divalidasi klinis.
  const HEAL = { weeks: 4, goal: 0.5, warnRatio: 0.5 };
  const targetRed = w => HEAL.goal * Math.min(Math.max(w, 0), HEAL.weeks) / HEAL.weeks;
  const WEEK = 7 * 864e5;
  function healStatus(a0, a, w) {
    const red = 1 - a / a0, tgt = targetRed(w);
    if (w < 0.5) return 'awal';
    if (w >= HEAL.weeks - 0.5) return red >= HEAL.goal ? 'tercapai' : 'rujuk';
    if (a > a0) return 'waspada';
    if (w >= 1.5 && red < tgt * HEAL.warnRatio) return 'waspada';
    return 'sesuai';
  }
  // Jalur tren: pindaian mingguan (bukan laporan keluhan) dengan luas luka, pada kaki pindaian terakhir.
  function healTrack(scans) {
    const trend = scans.filter(s => s.area && !s.urgent);
    if (!trend.length) return null;
    const lastScan = trend[trend.length - 1];
    const ep = trend.filter(s => s.foot === lastScan.foot);
    const t0 = new Date(ep[0].date).getTime(), a0 = ep[0].area;
    const pts = ep.map(s => {
      const w = (new Date(s.date).getTime() - t0) / WEEK;
      return { id: s.id, d: s.date, v: s.area, w, wk: Math.round(w), red: 1 - s.area / a0, tgt: targetRed(w), status: healStatus(a0, s.area, w) };
    });
    const last = pts[pts.length - 1];
    const next = new Date(t0 + (last.wk + 1) * WEEK);
    return { foot: lastScan.foot, site: lastScan.site, a0, base: ep[0].date, pts, last, week: last.wk, status: last.status, next, nextWeek: last.wk + 1 };
  }
  const HEAL_INFO = {
    awal: { chip: 't-blue', label: 'Target dibuat', tone: 'green', order: 3,
      msg: `Foto awal tercatat. Sistem membuat target penyembuhan untuk ${HEAL.weeks} minggu ke depan. Pindai lagi minggu depan di hari yang sama.` },
    sesuai: { chip: 't-green', label: 'Sesuai target', tone: 'green', order: 2,
      msg: 'Luka mengecil sesuai target. Lanjutkan perawatan dan pindai lagi minggu depan di hari yang sama.' },
    waspada: { chip: 't-amber', label: 'Waspada', tone: 'amber', order: 1,
      msg: `Luka mengecil lebih lambat dari target. Disarankan kontrol ke Puskesmas minggu ini, tidak perlu menunggu minggu ke-${HEAL.weeks}.` },
    rujuk: { chip: 't-red', label: 'Disarankan rujuk', tone: 'red', order: 0,
      msg: `Dalam ${HEAL.weeks} minggu luas luka turun kurang dari 50%. Sistem menyarankan rujukan ke rumah sakit; tenaga kesehatan akan menindaklanjuti.` },
    tercapai: { chip: 't-green', label: 'Patokan tercapai', tone: 'green', order: 4,
      msg: `Luas luka turun ≥ 50% dalam ${HEAL.weeks} minggu, sesuai patokan penyembuhan. Lanjutkan perawatan sampai luka menutup.` },
  };

  // ---------- Jalur darurat (bisa kapan saja, tidak dihitung dalam tren) ----------
  const DANGER_SIGNS = ['Luka berbau tidak sedap', 'Keluar nanah atau cairan keruh', 'Kemerahan di sekitar luka meluas', 'Kaki bengkak atau terasa panas', 'Demam atau menggigil', 'Kulit di sekitar luka menghitam'];
  function urgentCheck(symptoms, dets) {
    const signs = symptoms.slice();
    if (dets.some(d => d.cls === 'infeksi')) signs.push('AI: tanda infeksi (kemerahan) pada foto');
    if (dets.some(d => d.cls === 'nekrosis')) signs.push('AI: jaringan menghitam (nekrosis) pada foto');
    return { symptoms, signs, danger: signs.length > 0 };
  }

  const ADVICE = {
    Tinggi: { tone: 'red', title: 'Perlu pemeriksaan segera.', text: 'Periksakan ke Puskesmas dalam 24 jam. Jangan menekan luka atau berjalan tanpa alas kaki.' },
    Sedang: { tone: 'amber', title: 'Luka perlu dirawat.', text: 'Bersihkan dan tutup luka dengan balutan bersih, kurangi tekanan pada kaki, lalu kirim hasil ini ke Puskesmas.' },
    Rendah: { tone: 'green', title: 'Tidak ada luka terbuka.', text: 'Lanjutkan pemeriksaan kaki setiap hari dan gunakan alas kaki yang nyaman.' },
  };

  // ---------- Foto asli (Wound Image Dataset) ----------
  // assets/photos.js dibuat oleh tools/build_photos.py: foto terpilih + kotak dari mask anotasi dataset.
  const PHOTOS = global.DS_PHOTOS || {};
  const photoImage = key => { const p = PHOTOS[key]; return { kind: 'photo', key, src: p.src, mask: p.mask || null, w: p.w, h: p.h, ref: p.ref }; };
  // Tiap komponen mask menjadi satu kotak. Kelasnya "nekrosis" bila conf.nekrosis ada, selain itu "ulkus".
  // conf.infeksi menambah kotak kemerahan di sekitar luka (kotak luka diperluas).
  function photoDets(key, conf) {
    const boxes = (PHOTOS[key] || {}).boxes || [];
    const main = conf.nekrosis ? 'nekrosis' : conf.ulkus ? 'ulkus' : null;
    if (!main || !boxes.length) return [];
    const out = boxes.map((box, i) => ({ cls: main, conf: +(conf[main] - i * 0.06).toFixed(2), box }));
    if (conf.infeksi) {
      const x0 = Math.min(...boxes.map(b => b[0])), y0 = Math.min(...boxes.map(b => b[1]));
      const x1 = Math.max(...boxes.map(b => b[0] + b[2])), y1 = Math.max(...boxes.map(b => b[1] + b[3]));
      const e = Math.max(x1 - x0, y1 - y0) * 0.6, c = v => Math.min(1, Math.max(0, v));
      const bx = [c(x0 - e), c(y0 - e)];
      out.push({ cls: 'infeksi', conf: conf.infeksi, box: [bx[0], bx[1], c(x1 + e) - bx[0], c(y1 + e) - bx[1]].map(v => +v.toFixed(4)) });
    }
    return out;
  }

  // ---------- Data contoh ----------
  function seed(now) {
    const at = (daysAgo, hh, mm) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(hh, mm, 0, 0); return d.toISOString(); };
    const patients = [
      { id: 'p1', name: 'Siti Aminah', age: 64, sex: 'P', village: 'Mekarsari', dm: 'DM tipe 2 · 14 th' },
      { id: 'p2', name: 'Budi Santoso', age: 58, sex: 'L', village: 'Sukamaju', dm: 'DM tipe 2 · 9 th' },
      { id: 'p3', name: 'Hendra Wijaya', age: 61, sex: 'L', village: 'Cibereum', dm: 'DM tipe 2 · 11 th' },
      { id: 'p4', name: 'Agus Firmansyah', age: 67, sex: 'L', village: 'Mekarsari', dm: 'DM tipe 2 · 20 th' },
      { id: 'p5', name: 'Maria Lestari', age: 55, sex: 'P', village: 'Sukamaju', dm: 'DM tipe 2 · 6 th' },
      { id: 'p6', name: 'Dewi Kartika', age: 49, sex: 'P', village: 'Cibereum', dm: 'DM tipe 2 · 4 th' },
      { id: 'p7', name: 'Rahmat Hidayat', age: 70, sex: 'L', village: 'Sukamaju', dm: 'DM tipe 2 · 18 th' },
      { id: 'p8', name: 'Nur Aisyah', age: 52, sex: 'P', village: 'Mekarsari', dm: 'DM tipe 2 · 7 th' },
    ];
    const scans = [];
    let n = 1;
    const add = (pid, date, foot, site, key, conf, area, status, extra = {}) => {
      const dets = photoDets(key, conf);
      const { wagner, priority } = assess(dets, area);
      scans.push({ id: 's' + (n++), patientId: pid, date, foot, site, image: photoImage(key), detections: dets, area, wagner, priority, status, sent: true, ms: 24 + (n * 7) % 19, ...extra });
    };
    // Episode pemantauan mingguan: luas luka per minggu sejak foto awal (minggu ke-0).
    // Foto tiap minggu diambil dari satu pasien yang sama di dataset. Pindaian hari ini masuk antrean (Menunggu).
    const series = (pid, foot, site, startDaysAgo, areas, prefix, conf, hh, mm) => areas.forEach((a, w) => {
      const d = startDaysAgo - w * 7;
      add(pid, at(d, hh, mm + w), foot, site, prefix + '-' + w, conf(w), a, d === 0 ? 'Menunggu' : 'Divalidasi');
    });
    // Budi (akun pasien demo): luka ujung ibu jari, sempat sesuai target, lalu melambat → "Waspada" di minggu ke-3.
    // Minggu ke-4 (titik keputusan) jatuh hari ini dan belum dipindai.
    series('p2', 'Kanan', 'Ibu jari', 28, [1.6, 1.5, 1.39, 1.34], 'budi', w => ({ ulkus: [0.91, 0.88, 0.9, 0.87][w] }), 7, 30);
    // Siti: eskar hitam (nekrosis) di tumit makin luas → "Waspada" (minggu ke-3).
    series('p1', 'Kiri', 'Tumit', 21, [5.2, 5.6, 6.0, 6.8], 'siti', w => ({ nekrosis: [0.86, 0.89, 0.88, 0.9][w] }), 6, 55);
    // Hendra: ulkus plantar di bawah metatarsal I, mengecil sesuai target (minggu ke-3).
    series('p3', 'Kanan', 'Metatarsal I', 21, [3.8, 3.2, 2.7, 2.3], 'hendra', () => ({ ulkus: 0.86 }), 8, 7);
    // Agus: minggu ke-4 hanya turun 21% → "Disarankan rujuk".
    series('p4', 'Kiri', 'Plantar depan', 28, [2.4, 2.3, 2.2, 2.1, 1.9], 'agus', () => ({ ulkus: 0.84 }), 8, 44);
    // Rahmat: ulkus tumit sempat terinfeksi, setelah dirujuk turun 50% di minggu ke-4 → "Patokan tercapai".
    series('p7', 'Kiri', 'Tumit', 35, [3.0, 2.4, 1.9, 1.5, 1.2], 'rahmat', w => w < 2 ? { ulkus: 0.84, infeksi: 0.72 } : { ulkus: 0.81 }, 9, 12);
    // Kaki normal tanpa luka (tidak masuk jalur tren)
    add('p5', at(0, 8, 31), 'Kiri', 'Telapak kaki', 'maria-0', {}, null, 'Menunggu');
    add('p6', at(0, 9, 5), 'Kanan', 'Telapak kaki', 'dewi-0', {}, null, 'Divalidasi');
    [['p5', 'Kiri', 'maria', 3], ['p6', 'Kanan', 'dewi', 2], ['p8', 'Kanan', 'nur', 4]]
      .forEach(([pid, foot, prefix, count], k) => {
        for (let w = 1; w <= count; w++) add(pid, at(w * 7 + k, 8 + k, 5 + k * 6), foot, 'Telapak kaki', prefix + '-' + (pid === 'p8' ? w - 1 : w), {}, null, 'Divalidasi');
      });

    return {
      v: 3,
      me: 'p2',
      patients,
      scans,
      notes: [
        { id: 'n1', patientId: 'p2', author: 'dr. Rina Pratiwi', text: `Luka mengecil lebih lambat dari target. Kurangi tekanan pada kaki kanan, ganti balutan setiap hari, dan pindai lagi tepat minggu depan. Bila minggu ke-${HEAL.weeks} belum turun separuh, kita bahas rujukan.`, date: at(6, 14, 20), read: true },
      ],
      referrals: [
        { id: 'r1', patientId: 'p7', scanId: null, hospital: 'RSUD Kota Sukamaju', urgency: 'Terjadwal', reason: 'Evaluasi vaskular (dugaan penyakit arteri perifer)', date: at(30, 10, 0), status: 'Selesai' },
      ],
      corrections: [
        { date: at(1, 15, 5), patientId: 'p5', from: 'Ulkus', to: '(tidak ada temuan)' },
        { date: at(1, 15, 4), patientId: 'p8', from: 'Ulkus', to: '(tidak ada temuan)' },
        { date: at(31, 10, 40), patientId: 'p7', from: '(tidak terdeteksi)', to: 'Tanda infeksi' },
      ],
      activity: [
        { icon: 'send', tone: 'teal', text: 'Kader Desa Mekarsari mengirim 2 pindaian', date: at(0, 8, 50) },
        { icon: 'check', tone: 'green', text: 'Pindaian Dewi Kartika divalidasi: tidak ada temuan', date: at(0, 9, 12) },
        { icon: 'edit', tone: 'violet', text: 'dr. Rina mengoreksi 2 label ulkus positif palsu', date: at(1, 15, 5) },
      ],
      reminders: [
        { id: 'm1', text: 'Periksa kedua telapak kaki', time: '06.30', done: true },
        { id: 'm2', text: 'Ganti balutan luka', time: '16.00', done: false },
        { id: 'm3', text: 'Minum Metformin 500 mg', time: '19.00', done: false },
      ],
      vitals: { glucose: 168, glucoseAt: at(0, 6, 40), nextVisit: at(-2, 9, 0) },
      model: { version: 'YOLO11s-DFU v1.3', corrections: 46, threshold: 60, history: [
        { version: 'v1.3', date: at(21, 13, 0), note: 'Penambahan 312 citra lokal dari 4 Puskesmas' },
        { version: 'v1.2', date: at(63, 13, 0), note: 'Kelas "Nekrosis" dipisah dari "Ulkus"' },
      ] },
      prefs: { bigText: false, remind: true },
      seen: {},
    };
  }

  const HOSPITALS = ['RSUD Kota Sukamaju', 'RS Mitra Sehat', 'RS Bhakti Husada'];

  global.DS = { I, ic, CLASSES, assess, ADVICE, HEAL, healTrack, HEAL_INFO, DANGER_SIGNS, urgentCheck, PHOTOS, photoImage, photoDets, seed, HOSPITALS };
})(window);
