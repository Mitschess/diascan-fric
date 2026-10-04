/* DiaScan — ikon, ilustrasi kaki, aturan klinis, dan data contoh (mode demo). */
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
  const ADVICE = {
    Tinggi: { tone: 'red', title: 'Perlu pemeriksaan segera.', text: 'Periksakan ke Puskesmas dalam 24 jam. Jangan menekan luka atau berjalan tanpa alas kaki.' },
    Sedang: { tone: 'amber', title: 'Luka perlu dirawat.', text: 'Bersihkan dan tutup luka dengan balutan bersih, kurangi tekanan pada kaki, lalu kirim hasil ini ke Puskesmas.' },
    Rendah: { tone: 'green', title: 'Tidak ada luka terbuka.', text: 'Lanjutkan pemeriksaan kaki setiap hari dan gunakan alas kaki yang nyaman.' },
  };

  // ---------- Ilustrasi telapak kaki (pengganti foto pasien) ----------
  const TOES = [[80, 54, 21, 25], [114, 42, 12.5, 15.5], [137, 47, 11.5, 13.5], [156, 58, 10.5, 12], [171, 74, 9, 10.5]];
  let gid = 0;
  function footScene(f) {
    const k = 'fs' + (gid++);
    const crop = f.crop || [20, 14, 190, 190];
    let s = `<svg viewBox="${crop.join(' ')}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
<defs>
<linearGradient id="${k}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEC6A4"/><stop offset="1" stop-color="#C88C66"/></linearGradient>
<radialGradient id="${k}e"><stop offset="0" stop-color="#DC2626" stop-opacity=".5"/><stop offset=".6" stop-color="#EF4444" stop-opacity=".22"/><stop offset="1" stop-color="#EF4444" stop-opacity="0"/></radialGradient>
<radialGradient id="${k}w" cx=".45" cy=".5" r=".6"><stop offset="0" stop-color="#7F1D1D"/><stop offset=".5" stop-color="#B91C1C"/><stop offset=".85" stop-color="#F87171"/><stop offset="1" stop-color="#FDA4AF"/></radialGradient>
<radialGradient id="${k}n" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#1C1310"/><stop offset=".7" stop-color="#3B231B"/><stop offset="1" stop-color="#7A3B2C"/></radialGradient>
</defs>`;
    TOES.forEach(([cx, cy, rx, ry]) => { s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${k}s)" stroke="rgba(130,75,45,.35)" stroke-width="1"/>`; });
    s += `<path d="M110,358 C72,358 63,328 65,294 C67,258 80,238 78,204 C76,172 56,148 56,118 C56,88 80,70 114,70 C150,70 176,86 176,116 C176,148 168,172 167,204 C166,238 164,268 160,298 C158,332 146,358 110,358 Z" fill="url(#${k}s)" stroke="rgba(130,75,45,.4)" stroke-width="1.2"/>
<ellipse cx="90" cy="212" rx="11" ry="40" fill="rgba(255,240,228,.28)"/><ellipse cx="112" cy="320" rx="33" ry="26" fill="rgba(255,255,255,.10)"/>
<path d="M70 146 Q115 158 168 144" stroke="rgba(130,75,45,.18)" stroke-width="1.2" fill="none"/>`;
    if (f.necro != null) {
      const [cx, cy, rx, ry] = TOES[f.necro];
      s += `<ellipse cx="${cx}" cy="${cy - ry * 0.3}" rx="${rx * 0.78}" ry="${ry * 0.62}" fill="url(#${k}n)" stroke="#9A4A36" stroke-width="1.4"/>`;
    }
    if (f.callus) {
      const [x, y] = f.callus === true ? [156, 126] : f.callus;
      s += `<ellipse cx="${x}" cy="${y}" rx="12" ry="9" fill="#F2DEBB" stroke="#D6B484" stroke-width=".8"/><ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#F8ECD3"/>`;
    }
    if (f.ulcer) {
      const { x, y, s: sc = 1 } = f.ulcer;
      if (f.ery) s += `<circle cx="${x}" cy="${y}" r="${38 * Math.max(sc, 0.8)}" fill="url(#${k}e)"/>`;
      s += `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-15,-2 C-17,-10 -7,-14 1,-13 C11,-12 17,-7 15,2 C13,11 5,14 -4,12 C-12,11 -14,5 -15,-2 Z" fill="url(#${k}w)" stroke="#FECDD3" stroke-width=".9"/>
<ellipse cx="-6" cy="-4" rx="3.2" ry="2" fill="#FBBF24" opacity=".85"/><ellipse cx="7" cy="5" rx="2.6" ry="1.6" fill="#FCD34D" opacity=".8"/></g>`;
    }
    return s + '</svg>';
  }
  // Kotak deteksi (dalam koordinat gambar) dari fitur ilustrasi, dinormalisasi ke area crop
  function sceneBoxes(f, conf) {
    const crop = f.crop || [20, 14, 190, 190];
    const n = ([x, y, w, h]) => [(x - crop[0]) / crop[2], (y - crop[1]) / crop[3], w / crop[2], h / crop[3]].map(v => +v.toFixed(4));
    const out = [];
    if (f.ulcer) {
      const { x, y, s = 1 } = f.ulcer, hw = 17 * s * 1.1 + 2, hh = 14 * s * 1.1 + 2;
      out.push({ cls: 'ulkus', conf: conf.ulkus ?? 0.9, box: n([x - hw, y - hh, hw * 2, hh * 2]) });
      if (f.ery) { const r = 36 * Math.max(s, 0.8); out.push({ cls: 'infeksi', conf: conf.infeksi ?? 0.8, box: n([x - r, y - r, r * 2, r * 2]) }); }
    }
    if (f.necro != null) {
      const [cx, cy, rx, ry] = TOES[f.necro];
      out.push({ cls: 'nekrosis', conf: conf.nekrosis ?? 0.88, box: n([cx - rx - 2, cy - ry - 2, rx * 2 + 4, ry * 1.5]) });
    }
    if (f.callus) {
      const [x, y] = f.callus === true ? [156, 126] : f.callus;
      out.push({ cls: 'kalus', conf: conf.kalus ?? 0.75, box: n([x - 15, y - 12, 30, 24]) });
    }
    return out;
  }

  // ---------- Data contoh ----------
  const SCENES = {
    budi: (s, ery) => ({ crop: [20, 14, 190, 190], ulcer: { x: 87, y: 114, s }, ery, callus: true }),
    siti: () => ({ crop: [20, 8, 190, 190], necro: 0, ulcer: { x: 98, y: 118, s: 0.7 } }),
    hendra: () => ({ crop: [35, 222, 160, 150], ulcer: { x: 112, y: 318, s: 0.85 } }),
    agus: () => ({ crop: [40, 140, 170, 170], ulcer: { x: 150, y: 222, s: 0.75 } }),
    maria: () => ({ crop: [20, 14, 190, 190], callus: true }),
    dewi: () => ({ crop: [20, 14, 190, 190] }),
    rahmat: () => ({ crop: [20, 14, 190, 190], ulcer: { x: 120, y: 100, s: 0.6 } }),
    nur: () => ({ crop: [35, 222, 160, 150], callus: [112, 318] }),
  };

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
    const add = (pid, date, foot, site, scene, conf, area, status, extra = {}) => {
      const dets = sceneBoxes(scene, conf);
      const { wagner, priority } = assess(dets, area);
      scans.push({ id: 's' + (n++), patientId: pid, date, foot, site, image: { kind: 'scene', scene }, detections: dets, area, wagner, priority, status, sent: true, ms: 24 + (n * 7) % 19, ...extra });
    };
    // Riwayat Budi: luka mengecil tiap minggu
    const areas = [5.8, 5.4, 4.7, 4.1, 3.6];
    areas.forEach((a, i) => add('p2', at(35 - i * 7, 7, 30 + i), 'Kanan', 'Metatarsal I', SCENES.budi(+Math.sqrt(a / 3.2).toFixed(3), i < 2), { ulkus: 0.9, infeksi: 0.78, kalus: 0.74 }, a, 'Divalidasi'));
    // Antrean hari ini
    add('p1', at(0, 6, 58), 'Kiri', 'Ibu jari', SCENES.siti(), { nekrosis: 0.88, ulkus: 0.79 }, 1.6, 'Menunggu');
    add('p2', at(0, 7, 42), 'Kanan', 'Metatarsal I', SCENES.budi(1, true), { ulkus: 0.92, infeksi: 0.81, kalus: 0.76 }, 3.2, 'Menunggu');
    add('p3', at(0, 8, 10), 'Kanan', 'Tumit', SCENES.hendra(), { ulkus: 0.86 }, 2.3, 'Menunggu');
    add('p5', at(0, 8, 31), 'Kiri', 'Metatarsal V', SCENES.maria(), { kalus: 0.83 }, null, 'Menunggu');
    add('p4', at(0, 8, 47), 'Kiri', 'Plantar tengah', SCENES.agus(), { ulkus: 0.84 }, 1.9, 'Menunggu');
    add('p6', at(0, 9, 5), 'Kanan', 'Jari II', SCENES.dewi(), {}, null, 'Divalidasi');
    // Riwayat mingguan pasien lain (sudah divalidasi)
    const hist = [
      ['p1', 'Kiri', 'Ibu jari', 3, w => ({ s: SCENES.siti(), c: w >= 3 ? { ulkus: 0.8 } : { nekrosis: 0.7, ulkus: 0.78 }, a: +(1.6 - w * 0.15).toFixed(1) })],
      ['p3', 'Kanan', 'Tumit', 5, w => ({ s: SCENES.hendra(), c: { ulkus: 0.82 }, a: +(2.3 + w * 0.3).toFixed(1) })],
      ['p4', 'Kiri', 'Plantar tengah', 4, w => ({ s: SCENES.agus(), c: { ulkus: 0.8 }, a: +(1.9 + w * 0.25).toFixed(1) })],
      ['p5', 'Kiri', 'Metatarsal V', 3, () => ({ s: SCENES.maria(), c: { kalus: 0.8 }, a: null })],
      ['p6', 'Kanan', 'Jari II', 2, () => ({ s: SCENES.dewi(), c: {}, a: null })],
      ['p7', 'Kiri', 'Metatarsal III', 6, w => ({ s: SCENES.rahmat(), c: w >= 4 ? { ulkus: 0.84, infeksi: 0.72 } : { ulkus: 0.81 }, a: +(1.1 + w * 0.45).toFixed(1) })],
      ['p8', 'Kanan', 'Tumit', 4, () => ({ s: SCENES.nur(), c: { kalus: 0.79 }, a: null })],
    ];
    hist.forEach(([pid, foot, site, count, gen], k) => {
      for (let w = 1; w <= count; w++) {
        const g = gen(w);
        if (g.c.infeksi) g.s = { ...g.s, ery: true };
        add(pid, at(w * 7 + (k % 3), 8 + (k % 3), 5 + k * 6), foot, site, g.s, g.c, g.a, 'Divalidasi');
      }
    });

    return {
      v: 1,
      me: 'p2',
      patients,
      scans,
      notes: [
        { id: 'n1', patientId: 'p2', author: 'dr. Rina Pratiwi', text: 'Jaringan granulasi membaik. Lanjutkan balutan lembap, kurangi tekanan pada kaki kanan, dan kontrol sesuai jadwal.', date: at(1, 14, 20), read: true },
      ],
      referrals: [
        { id: 'r1', patientId: 'p7', scanId: null, hospital: 'RSUD Kota Sukamaju', urgency: 'Terjadwal', reason: 'Evaluasi vaskular (dugaan penyakit arteri perifer)', date: at(30, 10, 0), status: 'Selesai' },
      ],
      corrections: [
        { date: at(1, 15, 5), patientId: 'p5', from: 'Ulkus', to: 'Kalus' },
        { date: at(1, 15, 4), patientId: 'p8', from: 'Ulkus', to: 'Kalus' },
        { date: at(3, 10, 40), patientId: 'p7', from: '(tidak terdeteksi)', to: 'Tanda infeksi' },
      ],
      activity: [
        { icon: 'send', tone: 'teal', text: 'Kader Desa Mekarsari mengirim 2 pindaian', date: at(0, 8, 50) },
        { icon: 'check', tone: 'green', text: 'Pindaian Dewi Kartika divalidasi: tidak ada temuan', date: at(0, 9, 12) },
        { icon: 'edit', tone: 'violet', text: 'dr. Rina mengoreksi 2 label "Kalus"', date: at(1, 15, 5) },
      ],
      reminders: [
        { id: 'm1', text: 'Periksa kedua telapak kaki', time: '06.30', done: true },
        { id: 'm2', text: 'Ganti balutan luka', time: '16.00', done: false },
        { id: 'm3', text: 'Minum Metformin 500 mg', time: '19.00', done: false },
      ],
      vitals: { glucose: 168, glucoseAt: at(0, 6, 40), nextVisit: at(-8, 9, 0) },
      model: { version: 'YOLO11s-DFU v1.3', corrections: 46, threshold: 60, history: [
        { version: 'v1.3', date: at(21, 13, 0), note: 'Penambahan 312 citra lokal dari 4 Puskesmas' },
        { version: 'v1.2', date: at(63, 13, 0), note: 'Kelas "Nekrosis" dipisah dari "Ulkus"' },
      ] },
      prefs: { bigText: false, remind: true },
      seen: {},
    };
  }

  const HOSPITALS = ['RSUD Kota Sukamaju', 'RS Mitra Sehat', 'RS Bhakti Husada'];

  global.DS = { I, ic, CLASSES, assess, ADVICE, footScene, sceneBoxes, SCENES, seed, HOSPITALS };
})(window);
