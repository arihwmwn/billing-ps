const TOTAL_UNITS = 7;
const timers = {};
const baseStart = {};
const startTs = {};
const pausedElapsed = {};

function renderUnits() {
    const container = document.getElementById('units');
    for (let i = 1; i <= TOTAL_UNITS; i++) {
        const div = document.createElement('div');
        div.className = 'unit';
        div.id = 'unit' + i;
        div.innerHTML = `
      <div class="header" id="header${i}">PS <span id="name${i}">${i}</span> — Tersedia</div>

      <label>Ganti Nama Unit:</label>
      <input type="text" id="rename${i}" placeholder="Masukkan nama baru" onkeyup="renameUnit(${i})" />

      <label>Harga per Jam (Rp):</label>
      <input type="number" id="harga${i}" value="5000" />

      <label>Jam Mulai (HH:MM) — manual:</label>
      <input type="time" id="mulai${i}" />

      <div style="margin-top:10px; font-size:13px; font-weight:bold;">Paket Waktu:</div>
      <div class="controls">
        <button class="btn-paket" onclick="paket(${i},1)">1 Jam</button>
        <button class="btn-paket" onclick="paket(${i},2)">2 Jam</button>
        <button class="btn-paket" onclick="paket(${i},3)">3 Jam</button>
        <button class="btn-paket" onclick="paket(${i},5)">5 Jam</button>
      </div>

      <div class="info" id="info${i}">Masukkan jam mulai atau pilih paket.</div>

      <div class="controls">
        <button class="btn-start" onclick="start(${i})">MULAI</button>
        <button class="btn-pause" onclick="pause(${i})">PAUSE</button>
        <button class="btn-resume" onclick="resume(${i})">RESUME</button>
        <button class="btn-reset" onclick="reset(${i})">RESET</button>
        <button class="btn-stop" onclick="stop(${i})">BERHENTI</button>
      </div>

      <small class="note">Dapat memakai stopwatch manual atau paket otomatis.</small>
    `;
        container.appendChild(div);
        timers[i] = null; baseStart[i] = null; startTs[i] = null; pausedElapsed[i] = 0;
    }
}

function paket(id, jam) {
    const harga = Number(document.getElementById('harga' + id).value) || 0;
    const biaya = harga * jam;
    const now = new Date();

    baseStart[id] = now;
    const end = new Date(now.getTime() + jam * 3600000);

    document.getElementById('info' + id).innerHTML = `
    Paket <b>${jam} jam</b><br>
    Dimulai: <b>${formatTime(now)}</b><br>
    Selesai: <b>${formatTime(end)}</b><br>
    Total Bayar: <b>Rp ${biaya.toLocaleString()}</b>`;

    const head = document.getElementById('header' + id);
    head.classList.remove('status-running');
    head.textContent = `PS ${id} — Paket ${jam} Jam`;

    if (timers[id]) clearInterval(timers[id]);
    timers[id] = null; startTs[id] = null; pausedElapsed[id] = 0;
}

function start(id) {
    if (startTs[id]) { document.getElementById('info' + id).innerHTML = 'Sesi sudah berjalan.'; return; }

    const input = document.getElementById('mulai' + id).value;
    if (!input) { document.getElementById('info' + id).innerHTML = 'Masukkan jam mulai (HH:MM).'; return; }

    const [hh, mm] = input.split(':').map(Number);
    const now = new Date();
    baseStart[id] = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);

    if (!pausedElapsed[id]) pausedElapsed[id] = 0;
    startTs[id] = Date.now();

    if (timers[id]) clearInterval(timers[id]);
    timers[id] = setInterval(() => updateDisplay(id), 1000);

    const h = document.getElementById('header' + id);
    h.classList.add('status-running');
    h.textContent = `PS ${id} — Berjalan`;

    document.getElementById('info' + id).innerHTML =
        `Dimulai: <b>${formatTime(baseStart[id])}</b><br>Waktu berjalan: <b>0 jam 0 menit 0 detik</b>`;
}

function updateDisplay(id) {
    const running = startTs[id] ? (Date.now() - startTs[id]) : 0;
    const elapsedMs = (pausedElapsed[id] || 0) + running;

    const h = Math.floor(elapsedMs / 3600000);
    const m = Math.floor((elapsedMs % 3600000) / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);

    const end = baseStart[id] ? new Date(baseStart[id].getTime() + elapsedMs) : null;

    document.getElementById('info' + id).innerHTML =
        `Dimulai: <b>${formatTime(baseStart[id])}</b><br>` +
        `Waktu berjalan: <b>${h} jam ${m} menit ${s} detik</b>` +
        (end ? `<br>Selesai: <b>${formatTime(end)}</b>` : '');
}

function pause(id) {
    if (!startTs[id]) return;
    pausedElapsed[id] += Date.now() - startTs[id];
    startTs[id] = null;
    if (timers[id]) { clearInterval(timers[id]); timers[id] = null; }
    document.getElementById('info' + id).innerHTML += '<br><b>PAUSED</b>';
}

function resume(id) {
    if (startTs[id] || !baseStart[id]) return;
    startTs[id] = Date.now();
    if (timers[id]) clearInterval(timers[id]);
    timers[id] = setInterval(() => updateDisplay(id), 1000);
    document.getElementById('info' + id).innerHTML += '<br><b>RESUME</b>';
}

function reset(id) {
    if (timers[id]) { clearInterval(timers[id]); timers[id] = null; }
    startTs[id] = null; pausedElapsed[id] = 0; baseStart[id] = null;

    const h = document.getElementById('header' + id);
    h.classList.remove('status-running');
    h.textContent = `PS ${id} — Tersedia`;

    document.getElementById('info' + id).innerHTML = 'Masukkan jam mulai atau pilih paket.';
}

function stop(id) {
    const running = startTs[id] ? (Date.now() - startTs[id]) : 0;
    const elapsedMs = (pausedElapsed[id] || 0) + running;
    if (!baseStart[id]) {
        document.getElementById('info' + id).innerHTML = 'Belum ada jam mulai.';
        return;
    }
    if (timers[id]) { clearInterval(timers[id]); timers[id] = null; }
    startTs[id] = null;
    pausedElapsed[id] = 0;

    const harga = Number(document.getElementById('harga' + id).value) || 0;
    const totalMinutes = Math.floor(elapsedMs / 60000);
    const pricePerMinute = harga / 60;
    const totalBayar = Math.round(totalMinutes * pricePerMinute);
    const end = new Date(baseStart[id].getTime() + elapsedMs);

    const h = document.getElementById('header' + id);
    h.classList.remove('status-running');
    h.textContent = `PS ${id} — Selesai`;

    document.getElementById('info' + id).innerHTML =
        `Dimulai: <b>${formatTime(baseStart[id])}</b><br>` +
        `Selesai: <b>${formatTime(end)}</b><br>` +
        `Total: <b>${Math.floor(elapsedMs / 3600000)} jam ${Math.floor((elapsedMs % 3600000) / 60000)} menit</b><br>` +
        `Bayar: <b>Rp ${totalBayar.toLocaleString()}</b>`;

    baseStart[id] = null;
}

function formatTime(d) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

renderUnits();

function renameUnit(id) {
    const val = document.getElementById('rename' + id).value.trim();
    document.getElementById('name' + id).textContent = val || id;
}
