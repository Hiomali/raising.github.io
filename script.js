// ========== SUPABASE КОНФИГУРАЦИЯ ==========
const SUPABASE_URL = "https://ggfpgupwjqusuizumfkz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZnBndXB3anF1c3VpenVtZmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3Mzg0NDgsImV4cCI6MjA5NjMxNDQ0OH0.jCzBwIdt5ZNWhyvVIwe6MN4rirEFJGTXHnWqq7YQcBA";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let pilotsData = [];
let currentFilter = "";
let sortColumn = "points";
let sortDirection = "desc";
let isAdmin = false;
let editingPilotId = null;
let heatsMap = {};
let adminPassword = "admin123";
let adminLogs = [];
let disqualHistory = [];
let pointsHistory = [];
let currentLang = "ru";
let customLogo = "PHOENIX RACING";
let customBg = "";
let chart = null;
let regCheckInterval = null;
let regTimerInterval = null;
let regSettings = { enabled: true, useTimer: false, openTime: null, closeTime: null };

// DOM элементы
const tbody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetSearchBtn");
const rowStatsSpan = document.getElementById("rowStats");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminModal = document.getElementById("adminModal");
const adminPanel = document.getElementById("adminPanel");
const adminPasswordInput = document.getElementById("adminPassword");
const submitAdminPass = document.getElementById("submitAdminPass");
const adminErrorSpan = document.getElementById("adminError");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const addPilotBtn = document.getElementById("addPilotBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editName = document.getElementById("editName");
const editCountryCode = document.getElementById("editCountryCode");
const editCountryName = document.getElementById("editCountryName");
const editBestLap = document.getElementById("editBestLap");
const editPoints = document.getElementById("editPoints");
const formMessage = document.getElementById("formMessage");
const pilotsAdminListDiv = document.getElementById("pilotsAdminList");
const heatsListDiv = document.getElementById("heatsList");
const heatsAssignmentDiv = document.getElementById("heatsAssignment");
const saveHeatsBtn = document.getElementById("saveHeatsBtn");
const randomHeatsBtn = document.getElementById("randomHeatsBtn");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordMessage = document.getElementById("passwordMessage");
const disqualListDiv = document.getElementById("disqualList");
const disqualHistoryDiv = document.getElementById("disqualHistoryList");
const adminLogsDiv = document.getElementById("adminLogsList");
const clearLogsBtn = document.getElementById("clearLogsBtn");
const registerBtn = document.getElementById("registerBtn");
const regName = document.getElementById("regName");
const regCountryCode = document.getElementById("regCountryCode");
const regCountryName = document.getElementById("regCountryName");
const regMessage = document.getElementById("regMessage");
const regTimerDiv = document.getElementById("regTimer");
const regEnabledCheckbox = document.getElementById("regEnabledCheckbox");
const useTimerCheckbox = document.getElementById("useTimerCheckbox");
const regOpenTimeInput = document.getElementById("regOpenTime");
const regCloseTimeInput = document.getElementById("regCloseTime");
const saveRegSettingsBtn = document.getElementById("saveRegSettingsBtn");
const regSettingsMessage = document.getElementById("regSettingsMessage");
const timerFieldsDiv = document.getElementById("timerFields");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const importCsvFile = document.getElementById("importCsvFile");
const importCsvBtn = document.getElementById("importCsvBtn");
const csvMessage = document.getElementById("csvMessage");
const customLogoText = document.getElementById("customLogoText");
const saveLogoBtn = document.getElementById("saveLogoBtn");
const customBgUrl = document.getElementById("customBgUrl");
const saveBgBtn = document.getElementById("saveBgBtn");
const customizeMsg = document.getElementById("customizeMsg");
const langRuBtn = document.getElementById("langRu");
const langEnBtn = document.getElementById("langEn");
const closeModalSpans = document.querySelectorAll(".close-modal");

// RotorHazard элементы
const lapTimeModal = document.getElementById("lapTimeModal");
const lapPilotNameSpan = document.getElementById("lapPilotName");
const lapTimeValue = document.getElementById("lapTimeValue");
const saveLapTimeBtn = document.getElementById("saveLapTimeBtn");
const lapTimeMessage = document.getElementById("lapTimeMessage");
let currentLapPilotId = null;

const rhServerUrl = document.getElementById("rhServerUrl");
const rhRaceId = document.getElementById("rhRaceId");
const importFromRHBtn = document.getElementById("importFromRHBtn");
const rhManualJson = document.getElementById("rhManualJson");
const importManualJsonBtn = document.getElementById("importManualJsonBtn");
const rhSyncMessage = document.getElementById("rhSyncMessage");

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ЗАГРУЗКА И СОХРАНЕНИЕ В SUPABASE ==========
async function loadAllData() {
    try {
        // 1. Пилоты
        const { data: pilots, error: pilotsErr } = await supabase.from('pilots').select('*');
        if (pilotsErr) throw pilotsErr;
        if (pilots && pilots.length) {
            pilotsData = pilots.map(p => ({
                ...p,
                bestLap: p.bestLap === undefined ? null : p.bestLap,
                points: p.points === undefined ? null : p.points
            }));
        } else {
            // начальные данные
            pilotsData = [
                { id: Date.now()+1, name: "Max Velocity", countryCode: "🇺🇸", countryName: "USA", bestLap: 42.687, points: 285, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+2, name: "Sara Storm", countryCode: "🇬🇧", countryName: "UK", bestLap: 43.124, points: 272, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+3, name: "Eagle Eye", countryCode: "🇩🇪", countryName: "Germany", bestLap: 41.992, points: 298, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+4, name: "Drone Phantom", countryCode: "🇯🇵", countryName: "Japan", bestLap: 44.357, points: 249, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+5, name: "Nitro Flash", countryCode: "🇦🇺", countryName: "Australia", bestLap: 42.205, points: 276, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+6, name: "Phoenix Ace", countryCode: "🇨🇦", countryName: "Canada", bestLap: 41.556, points: 305, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+7, name: "Shadow Drift", countryCode: "🇫🇷", countryName: "France", bestLap: 43.885, points: 258, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+8, name: "Thunder Rotor", countryCode: "🇳🇱", countryName: "Netherlands", bestLap: 44.112, points: 241, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+9, name: "Rocket Blade", countryCode: "🇧🇷", countryName: "Brazil", bestLap: 42.990, points: 263, disqualified: false, disqualificationReason: "" },
                { id: Date.now()+10, name: "Sky Sphinx", countryCode: "🇿🇦", countryName: "South Africa", bestLap: 45.203, points: 230, disqualified: false, disqualificationReason: "" }
            ];
            await savePilotsToSupabase();
        }

        // 2. heatsMap
        const { data: heats, error: heatsErr } = await supabase.from('heats').select('*');
        if (heatsErr) throw heatsErr;
        if (heats && heats.length) {
            heatsMap = {};
            heats.forEach(h => { heatsMap[h.pilot_id] = h.heat_number; });
        } else {
            heatsMap = {};
            pilotsData.forEach(p => { heatsMap[p.id] = 0; });
            await saveHeatsToSupabase();
        }

        // 3. regSettings
        const { data: reg, error: regErr } = await supabase.from('reg_settings').select('*').eq('id', 1).maybeSingle();
        if (regErr) throw regErr;
        if (reg) regSettings = reg;
        else {
            regSettings = { id: 1, enabled: true, useTimer: false, openTime: null, closeTime: null };
            await supabase.from('reg_settings').upsert(regSettings);
        }

        // 4. adminLogs
        const { data: logs, error: logsErr } = await supabase.from('admin_logs').select('*').order('id', { ascending: false }).limit(200);
        if (logsErr) throw logsErr;
        adminLogs = logs || [];

        // 5. disqualHistory
        const { data: discHist, error: discErr } = await supabase.from('disqual_history').select('*').order('id', { ascending: false }).limit(200);
        if (discErr) throw discErr;
        disqualHistory = discHist || [];

        // 6. pointsHistory
        const { data: pointsHist, error: pointsErr } = await supabase.from('points_history').select('*').order('id', { ascending: true });
        if (pointsErr) throw pointsErr;
        if (pointsHist && pointsHist.length) {
            pointsHistory = pointsHist.map(h => ({ date: h.date, points: h.points }));
        } else {
            capturePointsHistory();
        }

        // 7. customData
        const { data: custom, error: customErr } = await supabase.from('custom_data').select('*').eq('id', 1).maybeSingle();
        if (customErr) throw customErr;
        if (custom) {
            customLogo = custom.customLogo;
            customBg = custom.customBg;
        } else {
            await supabase.from('custom_data').insert({ id: 1, customLogo, customBg });
        }
        document.getElementById("customLogo").innerHTML = `<i class="fas fa-dragon"></i> ${customLogo}`;
        if (customBg) document.body.style.backgroundImage = `url(${customBg})`;

        // 8. adminPassword
        const { data: pass, error: passErr } = await supabase.from('admin_password').select('*').eq('id', 1).maybeSingle();
        if (passErr) throw passErr;
        if (pass) adminPassword = pass.value;
        else await supabase.from('admin_password').insert({ id: 1, value: adminPassword });

        // применить загруженные данные
        renderTable();
        renderHeatsList();
        updateTop3();
        renderPlayoff();
        updateChart();
        if (isAdmin) {
            renderAdminList();
            renderDisqualList();
            renderHeatsAssignment();
            renderLogs();
            renderDisqualHistory();
        }
        loadRegSettingsToUI();
        startRegistrationWatcher();
        startTimerDisplay();
    } catch (err) {
        console.error("Ошибка загрузки из Supabase:", err);
        alert("Ошибка подключения к Supabase. Проверьте интернет и настройки.");
    }
}

async function savePilotsToSupabase() {
    const { error } = await supabase.from('pilots').upsert(pilotsData, { onConflict: 'id' });
    if (error) console.error("Ошибка сохранения пилотов:", error);
}

async function saveHeatsToSupabase() {
    const heatsArray = Object.entries(heatsMap).map(([pilot_id, heat_number]) => ({ pilot_id: parseInt(pilot_id), heat_number }));
    const { error } = await supabase.from('heats').upsert(heatsArray, { onConflict: 'pilot_id' });
    if (error) console.error("Ошибка сохранения залётов:", error);
}

async function saveRegSettingsToSupabase() {
    const { error } = await supabase.from('reg_settings').upsert({ id: 1, ...regSettings });
    if (error) console.error("Ошибка сохранения настроек регистрации:", error);
}

async function addLogToSupabase(action, details) {
    const log = { timestamp: new Date().toLocaleString(), action, details };
    const { error } = await supabase.from('admin_logs').insert(log);
    if (error) console.error("Ошибка сохранения лога:", error);
    adminLogs.unshift(log);
    if (adminLogs.length > 200) adminLogs.pop();
    if (isAdmin) renderLogs();
}

async function addDisqualHistoryToSupabase(pilotName, reason, actionType) {
    const record = { date: new Date().toLocaleString(), pilotName, reason, actionType };
    const { error } = await supabase.from('disqual_history').insert(record);
    if (error) console.error("Ошибка сохранения истории дискв.:", error);
    disqualHistory.unshift(record);
    if (disqualHistory.length > 200) disqualHistory.pop();
    if (isAdmin) renderDisqualHistory();
}

async function capturePointsHistory() {
    const now = new Date().toLocaleDateString();
    const top5 = [...pilotsData].sort((a,b) => (b.points||0) - (a.points||0)).slice(0,5);
    const points = top5.map(p => p.points||0);
    const record = { date: now, points: JSON.stringify(points) };
    const { error } = await supabase.from('points_history').insert(record);
    if (error) console.error("Ошибка сохранения истории очков:", error);
    pointsHistory.push({ date: now, points });
    if (pointsHistory.length > 10) pointsHistory.shift();
    updateChart();
}

async function saveCustomToSupabase() {
    const { error } = await supabase.from('custom_data').upsert({ id: 1, customLogo, customBg });
    if (error) console.error("Ошибка сохранения кастомизации:", error);
}

async function saveAdminPasswordToSupabase() {
    const { error } = await supabase.from('admin_password').upsert({ id: 1, value: adminPassword });
    if (error) console.error("Ошибка сохранения пароля:", error);
}

// ========== ОСНОВНАЯ ТАБЛИЦА ==========
function filterAndSortData() {
    let filtered = [...pilotsData];
    if (currentFilter.trim()) {
        const low = currentFilter.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(low) || p.countryName.toLowerCase().includes(low));
    }
    filtered.sort((a,b) => {
        let valA, valB;
        switch(sortColumn) {
            case "pilot": valA = a.name; valB = b.name; break;
            case "country": valA = a.countryName; valB = b.countryName; break;
            case "bestLap": valA = a.bestLap; valB = b.bestLap; break;
            case "points": valA = a.points; valB = b.points; break;
            default: return 0;
        }
        if (sortColumn === "bestLap" || sortColumn === "points") {
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;
            return sortDirection === "asc" ? valA - valB : valB - valA;
        } else {
            return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
    });
    return filtered;
}

function updateSortIndicators() {
    document.querySelectorAll("#racingTable th[data-sort]").forEach(th => {
        const col = th.getAttribute("data-sort");
        const icon = th.querySelector(".sort-icon");
        if (!icon) return;
        if (col === sortColumn) {
            icon.className = `fas fa-sort-${sortDirection==="asc"?"up":"down"} sort-icon`;
            icon.style.color = "#ffaa55";
        } else {
            icon.className = "fas fa-sort sort-icon";
            icon.style.color = "#b0c4de";
        }
    });
}

function renderTable() {
    const allSorted = filterAndSortData();
    const activePilots = allSorted.filter(p => !p.disqualified);
    rowStatsSpan.innerHTML = `🏁 ${allSorted.length} / ${pilotsData.length} пилотов | Активных: ${activePilots.length}`;
    if (!allSorted.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">🚁 Нет пилотов<\/td><\/tr>`;
        updateSortIndicators();
        return;
    }
    let html = "";
    allSorted.forEach(p => {
        const activeRank = activePilots.findIndex(ap => ap.id === p.id) + 1;
        const displayPos = p.disqualified ? "—" : activeRank;
        const statusHtml = p.disqualified
            ? `<span class="status-icon"><i class="fas fa-ban"></i></span> <span class="disqualified-text" title="Причина: ${escapeHtml(p.disqualificationReason) || 'не указана'}">Дискв.</span>`
            : `<span class="status-icon"><i class="fas fa-check-circle" style="color:#6fbf6f;"></i></span> Активен`;
        const rowClass = p.disqualified ? "disqualified-row" : "";
        const bestLapDisplay = (p.bestLap === null || p.bestLap === undefined) ? "—" : p.bestLap.toFixed(3) + " s";
        const pointsDisplay = (p.points === null || p.points === undefined) ? "—" : p.points;
        let actionsHtml = "";
        if (isAdmin) {
            actionsHtml = `<td>
                <button class="edit-pilot-btn" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-pilot-btn" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button>
                <button class="lap-btn" data-id="${p.id}" data-name="${escapeHtml(p.name)}"><i class="fas fa-stopwatch"></i> Засечь</button>
            <\/td>`;
        } else {
            actionsHtml = `<td><\/td>`;
        }
        html += `<tr class="${rowClass}">
            <td class="pos-cell">${displayPos}<\/td>
            <td><span class="pilot-name"><i class="fas fa-drone"></i> ${escapeHtml(p.name)}<\/span><\/td>
            <td><span class="country-flag">${p.countryCode}</span> ${escapeHtml(p.countryName)}<\/td>
            <td><span class="time-cell">⏱️ ${bestLapDisplay}<\/span><\/td>
            <td class="points-cell"><i class="fas fa-star"></i> ${pointsDisplay}<\/td>
            <td class="status-cell">${statusHtml}<\/td>
            ${actionsHtml}
        <\/tr>`;
    });
    tbody.innerHTML = html;
    updateSortIndicators();
    document.querySelectorAll(".edit-pilot-btn").forEach(btn => {
        btn.addEventListener("click", (e) => { e.stopPropagation(); startEditPilot(parseInt(btn.getAttribute("data-id"))); });
    });
    document.querySelectorAll(".delete-pilot-btn").forEach(btn => {
        btn.addEventListener("click", (e) => { e.stopPropagation(); if(confirm("Удалить пилота?")) deletePilotById(parseInt(btn.getAttribute("data-id"))); });
    });
    document.querySelectorAll(".lap-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.getAttribute("data-id"));
            const name = btn.getAttribute("data-name");
            openLapModal(id, name);
        });
    });
}

// ========== ТОП-3 И ГРАФИК ==========
function updateTop3() {
    const top3Div = document.getElementById("top3List");
    if (!top3Div) return;
    const sorted = [...pilotsData].filter(p => !p.disqualified).sort((a,b) => (b.points||0) - (a.points||0)).slice(0,3);
    if (sorted.length === 0) {
        top3Div.innerHTML = "Нет данных";
        return;
    }
    top3Div.innerHTML = sorted.map((p, idx) => `
        <div class="top3-item">
            <span class="top3-name">${idx+1}. ${escapeHtml(p.name)} (${p.countryCode})</span>
            <span class="top3-points">${p.points !== null ? p.points : "—"} очков</span>
        </div>
    `).join("");
}

function updateChart() {
    const ctx = document.getElementById("pointsChart");
    if (!ctx) return;
    const labels = pointsHistory.map(h => h.date);
    const datasets = [];
    for (let i = 0; i < 5; i++) {
        const data = pointsHistory.map(h => (Array.isArray(h.points) ? h.points[i] : 0) || 0);
        datasets.push({ label: `Пилот ${i+1}`, data, borderColor: `hsl(${i*60}, 70%, 60%)`, fill: false, tension: 0.1 });
    }
    if (chart) chart.destroy();
    chart = new Chart(ctx, { type: 'line', data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: true } });
}

// ========== ЗАЛЁТЫ (ОГРАНИЧЕНИЕ 4) ==========
function getHeatCounts() {
    const counts = {1:0,2:0,3:0,4:0,5:0,6:0};
    pilotsData.forEach(pilot => {
        if (pilot.disqualified) return;
        const heat = heatsMap[pilot.id];
        if (heat >= 1 && heat <= 6) counts[heat]++;
    });
    return counts;
}

function isHeatAvailable(heatNumber, excludePilotId = null) {
    const counts = getHeatCounts();
    let currentCount = counts[heatNumber] || 0;
    if (excludePilotId !== null && heatsMap[excludePilotId] === heatNumber) currentCount--;
    return currentCount < 4;
}

function getAvailableHeats(excludePilotId = null) {
    const available = [];
    for (let i = 1; i <= 6; i++) {
        if (isHeatAvailable(i, excludePilotId)) available.push(i);
    }
    return available;
}

function renderHeatsList() {
    if (!heatsListDiv) return;
    const groups = {};
    pilotsData.forEach(pilot => {
        if (pilot.disqualified) return;
        const heat = heatsMap[pilot.id] || 0;
        if (heat !== 0) {
            if (!groups[heat]) groups[heat] = [];
            groups[heat].push(pilot);
        }
    });
    if (Object.keys(groups).length === 0) {
        heatsListDiv.innerHTML = "<p>Нет активных залётов.</p>";
        return;
    }
    let html = "";
    for (let heatNum in groups) {
        html += `<div class="heat-card"><h4><i class="fas fa-flag-checkered"></i> Залёт №${heatNum}</h4><ul class="heat-pilot-list">`;
        groups[heatNum].forEach(p => {
            const ptsDisplay = (p.points === null || p.points === undefined) ? "—" : p.points;
            html += `<li>🏁 ${escapeHtml(p.name)} (${p.countryCode}) – ${ptsDisplay} очков</li>`;
        });
        html += `</ul></div>`;
    }
    heatsListDiv.innerHTML = html;
}

function renderHeatsAssignment() {
    if (!heatsAssignmentDiv) return;
    let html = `<div style="font-weight:bold; margin-bottom:8px;">Выберите номер залёта для каждого пилота (0 – не участвует, максимум 4 пилота на залёт)</div>`;
    pilotsData.forEach(pilot => {
        if (pilot.disqualified) return;
        const currentHeat = heatsMap[pilot.id] || 0;
        const availableHeats = getAvailableHeats(pilot.id);
        const options = [];
        options.push(`<option value="0">Залёт — не назначен</option>`);
        for (let i = 1; i <= 6; i++) {
            if (availableHeats.includes(i) || currentHeat === i) {
                options.push(`<option value="${i}" ${currentHeat === i ? 'selected' : ''}>Залёт ${i}</option>`);
            }
        }
        html += `<div class="pilot-heat-row">
            <span><strong>${escapeHtml(pilot.name)}</strong> (${pilot.countryCode})</span>
            <select data-id="${pilot.id}" class="heat-select">
                ${options.join('')}
            </select>
        </div>`;
    });
    heatsAssignmentDiv.innerHTML = html;
    document.querySelectorAll(".heat-select").forEach(sel => {
        sel.addEventListener("change", (e) => {
            const pilotId = parseInt(sel.getAttribute("data-id"));
            const newHeat = parseInt(sel.value);
            const currentPilotHeat = heatsMap[pilotId];
            if (newHeat !== 0 && newHeat !== currentPilotHeat) {
                const currentCounts = getHeatCounts();
                let targetCount = currentCounts[newHeat] || 0;
                if (targetCount >= 4) {
                    alert(`Залёт №${newHeat} уже заполнен (максимум 4 пилота). Выберите другой залёт.`);
                    sel.value = currentPilotHeat;
                    return;
                }
            }
            heatsMap[pilotId] = newHeat;
        });
    });
}

async function saveHeatsDistribution() {
    const counts = getHeatCounts();
    let overflow = false;
    for (let i = 1; i <= 6; i++) {
        if (counts[i] > 4) {
            overflow = true;
            formMessage.innerHTML = `❌ Ошибка: в залёте №${i} ${counts[i]} пилотов, а максимум 4. Исправьте распределение.`;
            break;
        }
    }
    if (overflow) return;
    await saveHeatsToSupabase();
    renderHeatsList();
    formMessage.innerHTML = "✅ Распределение по залётам сохранено!";
    setTimeout(() => { if(formMessage) formMessage.innerHTML = ""; }, 2000);
    addLogToSupabase("Залёты", "Распределение сохранено");
}

async function randomizeHeats() {
    const active = pilotsData.filter(p => !p.disqualified);
    const heats = [[],[],[],[],[],[]];
    for (let p of active) {
        let placed = false;
        for (let h = 0; h < 6; h++) {
            if (heats[h].length < 4) {
                heats[h].push(p.id);
                heatsMap[p.id] = h+1;
                placed = true;
                break;
            }
        }
        if (!placed) heatsMap[p.id] = 0;
    }
    await saveHeatsToSupabase();
    renderHeatsList();
    if (isAdmin) renderHeatsAssignment();
    addLogToSupabase("Жеребьёвка", "Случайное распределение по залётам");
    alert("Жеребьёвка выполнена!");
}

// ========== ПЛЕЙ-ОФФ ==========
function renderPlayoff() {
    const container = document.getElementById("playoffBracket");
    if (!container) return;
    const activePilots = pilotsData.filter(p => !p.disqualified);
    if (activePilots.length < 2) {
        container.innerHTML = "Недостаточно данных для плей-офф (нужно минимум 2 пилота)";
        return;
    }
    const heats = {};
    activePilots.forEach(p => {
        const heat = heatsMap[p.id];
        if (heat >= 1 && heat <= 6) {
            if (!heats[heat]) heats[heat] = [];
            heats[heat].push(p);
        }
    });
    const winners = [];
    for (let h=1; h<=6; h++) {
        if (heats[h] && heats[h].length) {
            const best = heats[h].reduce((a,b) => (a.points||0) > (b.points||0) ? a : b);
            winners.push(best);
        }
    }
    if (winners.length < 2) {
        container.innerHTML = "Недостаточно победителей залётов для сетки";
        return;
    }
    let bracketHtml = `<div class="playoff-bracket">`;
    for (let i=0; i<winners.length; i+=2) {
        const p1 = winners[i];
        const p2 = winners[i+1];
        bracketHtml += `<div class="playoff-match"><strong>Матч ${Math.floor(i/2)+1}</strong><br>`;
        bracketHtml += `${escapeHtml(p1.name)} (${p1.countryCode}) — ${p1.points||"—"} очков<br>`;
        if (p2) bracketHtml += `vs ${escapeHtml(p2.name)} (${p2.countryCode}) — ${p2.points||"—"} очков`;
        else bracketHtml += `— свободен —`;
        bracketHtml += `</div>`;
    }
    bracketHtml += `</div>`;
    container.innerHTML = bracketHtml;
}

// ========== АДМИНКА: ПИЛОТЫ ==========
function renderAdminList() {
    pilotsAdminListDiv.innerHTML = "";
    pilotsData.forEach(pilot => {
        const bestLapText = (pilot.bestLap === null || pilot.bestLap === undefined) ? "—" : pilot.bestLap.toFixed(3) + "s";
        const pointsText = (pilot.points === null || pilot.points === undefined) ? "—" : pilot.points;
        const card = document.createElement("div");
        card.className = "pilot-card";
        card.innerHTML = `
            <div><strong>${escapeHtml(pilot.name)}</strong> (${pilot.countryCode})<br>
            <small>🏆 ${pointsText} pts | ⏱️ ${bestLapText} ${pilot.disqualified ? '| ⛔ ДИСКВ.' : ''}</small></div>
            <div class="pilot-actions">
                <button class="edit-pilot" data-id="${pilot.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-pilot" data-id="${pilot.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        pilotsAdminListDiv.appendChild(card);
    });
    document.querySelectorAll(".edit-pilot").forEach(btn => {
        btn.addEventListener("click", (e) => { e.stopPropagation(); startEditPilot(parseInt(btn.getAttribute("data-id"))); });
    });
    document.querySelectorAll(".delete-pilot").forEach(btn => {
        btn.addEventListener("click", (e) => { e.stopPropagation(); if(confirm("Удалить пилота?")) deletePilotById(parseInt(btn.getAttribute("data-id"))); });
    });
}

function startEditPilot(id){
    const p = pilotsData.find(p => p.id === id);
    if (!p) return;
    editingPilotId = id;
    editName.value = p.name;
    editCountryCode.value = p.countryCode;
    editCountryName.value = p.countryName;
    editBestLap.value = (p.bestLap === null || p.bestLap === undefined) ? "" : p.bestLap;
    editPoints.value = (p.points === null || p.points === undefined) ? "" : p.points;
    addPilotBtn.innerHTML = '<i class="fas fa-pen"></i> Сохранить';
    cancelEditBtn.style.display = "inline-block";
    formMessage.innerHTML = "Редактирование: " + p.name;
}

function cancelEdit(){
    editingPilotId = null;
    addPilotBtn.innerHTML = '<i class="fas fa-save"></i> Добавить';
    cancelEditBtn.style.display = "none";
    editName.value = editCountryCode.value = editCountryName.value = editBestLap.value = editPoints.value = "";
    formMessage.innerHTML = "";
}

async function addOrUpdatePilot(){
    const name = editName.value.trim();
    const cc = editCountryCode.value.trim();
    const cn = editCountryName.value.trim();
    let lap = editBestLap.value.trim() === "" ? null : parseFloat(editBestLap.value);
    let pts = editPoints.value.trim() === "" ? null : parseInt(editPoints.value);
    if (!name || !cc || !cn) { formMessage.innerHTML = "❌ Заполните имя, эмодзи и страну!"; return; }
    if (lap !== null && isNaN(lap)) { formMessage.innerHTML = "❌ Лучший круг должен быть числом (или оставьте пустым)"; return; }
    if (pts !== null && isNaN(pts)) { formMessage.innerHTML = "❌ Очки должны быть числом (или оставьте пустым)"; return; }
    if (editingPilotId !== null){
        const idx = pilotsData.findIndex(p => p.id === editingPilotId);
        if (idx !== -1){
            pilotsData[idx] = { ...pilotsData[idx], name, countryCode: cc, countryName: cn, bestLap: lap, points: pts };
            formMessage.innerHTML = "✅ Пилот обновлён";
            await addLogToSupabase("Редактирование", `Пилот ${name} обновлён`);
        }
        editingPilotId = null;
    } else {
        const newId = Date.now();
        pilotsData.push({ id: newId, name, countryCode: cc, countryName: cn, bestLap: lap, points: pts, disqualified: false, disqualificationReason: "" });
        heatsMap[newId] = 0;
        formMessage.innerHTML = "✅ Пилот добавлен";
        await addLogToSupabase("Добавление", `Новый пилот ${name}`);
    }
    await savePilotsToSupabase();
    await saveHeatsToSupabase();
    cancelEdit();
    renderTable();
    updateTop3();
    renderPlayoff();
    if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
    renderHeatsList();
}

async function deletePilotById(id){
    const pilot = pilotsData.find(p => p.id === id);
    if (pilot) await addLogToSupabase("Удаление", `Пилот ${pilot.name} удалён`);
    pilotsData = pilotsData.filter(p => p.id !== id);
    delete heatsMap[id];
    await savePilotsToSupabase();
    await saveHeatsToSupabase();
    renderTable();
    updateTop3();
    renderPlayoff();
    if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
    renderHeatsList();
    cancelEdit();
}

// ========== ЗАСЕЧКА ВРЕМЕНИ ==========
function openLapModal(pilotId, pilotName) {
    currentLapPilotId = pilotId;
    lapPilotNameSpan.innerText = pilotName;
    lapTimeValue.value = "";
    lapTimeMessage.innerHTML = "";
    lapTimeModal.style.display = "flex";
}

async function saveLapTime() {
    const time = parseFloat(lapTimeValue.value);
    if (isNaN(time) || time <= 0) {
        lapTimeMessage.innerHTML = "❌ Введите корректное положительное время (секунды)";
        return;
    }
    const pilot = pilotsData.find(p => p.id === currentLapPilotId);
    if (!pilot) return;
    const oldBest = pilot.bestLap;
    if (oldBest === null || time < oldBest) {
        pilot.bestLap = time;
        await savePilotsToSupabase();
        renderTable();
        updateTop3();
        renderPlayoff();
        await addLogToSupabase("Засечка времени", `${pilot.name} – новый лучший круг: ${time.toFixed(3)}с (предыдущий: ${oldBest !== null ? oldBest.toFixed(3) : "—"})`);
        lapTimeMessage.innerHTML = "✅ Время сохранено!";
        setTimeout(() => lapTimeModal.style.display = "none", 1000);
    } else {
        lapTimeMessage.innerHTML = `⚠️ Время ${time.toFixed(3)}с не улучшает рекорд (текущий лучший: ${oldBest.toFixed(3)}с). Не сохранено.`;
    }
}

// ========== ROTORHAZARD ИМПОРТ ==========
async function importFromRotorHazard() {
    const url = rhServerUrl.value.trim();
    const raceId = rhRaceId.value.trim();
    if (!url || !raceId) {
        rhSyncMessage.innerHTML = "❌ Укажите URL сервера и ID гонки";
        return;
    }
    rhSyncMessage.innerHTML = "⏳ Загрузка данных...";
    try {
        const response = await fetch(`${url}/api/race/${raceId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        let pilotsArray = null;
        if (Array.isArray(data)) pilotsArray = data;
        else if (data.pilots && Array.isArray(data.pilots)) pilotsArray = data.pilots;
        else throw new Error("Неизвестный формат ответа. Используйте ручной ввод JSON.");
        let updated = 0;
        for (const item of pilotsArray) {
            const pilotName = item.name || item.pilot_name || item.callsign;
            const bestLap = item.best_lap || item.fastest_lap || item.bestLap;
            if (pilotName && bestLap) {
                const pilot = pilotsData.find(p => p.name.toLowerCase() === pilotName.toLowerCase());
                if (pilot) {
                    if (pilot.bestLap === null || bestLap < pilot.bestLap) {
                        pilot.bestLap = bestLap;
                        updated++;
                        await addLogToSupabase("RotorHazard импорт", `${pilot.name} – лучший круг обновлён до ${bestLap.toFixed(3)}с`);
                    }
                }
            }
        }
        await savePilotsToSupabase();
        renderTable();
        updateTop3();
        renderPlayoff();
        rhSyncMessage.innerHTML = `✅ Импорт завершён. Обновлено пилотов: ${updated}`;
    } catch (err) {
        rhSyncMessage.innerHTML = `❌ Ошибка: ${err.message}. Попробуйте ручной ввод JSON.`;
    }
}

async function importManualJson() {
    const jsonText = rhManualJson.value.trim();
    if (!jsonText) {
        rhSyncMessage.innerHTML = "❌ Вставьте JSON данные";
        return;
    }
    try {
        const data = JSON.parse(jsonText);
        let pilotsArray = null;
        if (Array.isArray(data)) pilotsArray = data;
        else if (data.pilots && Array.isArray(data.pilots)) pilotsArray = data.pilots;
        else throw new Error("Массив не найден в JSON");
        let updated = 0;
        for (const item of pilotsArray) {
            const pilotName = item.name || item.pilot_name || item.callsign;
            const bestLap = item.best_lap || item.fastest_lap || item.bestLap;
            if (pilotName && bestLap) {
                const pilot = pilotsData.find(p => p.name.toLowerCase() === pilotName.toLowerCase());
                if (pilot) {
                    if (pilot.bestLap === null || bestLap < pilot.bestLap) {
                        pilot.bestLap = bestLap;
                        updated++;
                        await addLogToSupabase("RotorHazard ручной импорт", `${pilot.name} – новый лучший круг ${bestLap.toFixed(3)}с`);
                    }
                }
            }
        }
        await savePilotsToSupabase();
        renderTable();
        updateTop3();
        renderPlayoff();
        rhSyncMessage.innerHTML = `✅ Импорт из JSON завершён. Обновлено пилотов: ${updated}`;
    } catch (err) {
        rhSyncMessage.innerHTML = `❌ Ошибка парсинга JSON: ${err.message}`;
    }
}

// ========== ДИСКВАЛИФИКАЦИИ ==========
function renderDisqualList() {
    if (!disqualListDiv) return;
    disqualListDiv.innerHTML = "";
    pilotsData.forEach(pilot => {
        const item = document.createElement("div");
        item.className = "disqual-item";
        item.innerHTML = `
            <div class="disqual-info">
                <strong>${escapeHtml(pilot.name)}</strong> (${pilot.countryCode})<br>
                <small>Текущий статус: ${pilot.disqualified ? '⛔ ДИСКВАЛИФИЦИРОВАН' : '✅ Активен'}</small>
                ${pilot.disqualified ? `<br><small>Причина: ${escapeHtml(pilot.disqualificationReason) || 'не указана'}</small>` : ''}
            </div>
            <div class="disqual-actions">
                ${!pilot.disqualified ?
                    `<input type="text" id="reason_${pilot.id}" class="disqual-reason-input" placeholder="Причина дискв.">
                     <button class="disqualify-btn" data-id="${pilot.id}">Дисквалифицировать</button>` :
                    `<button class="restore-btn" data-id="${pilot.id}">Восстановить</button>`
                }
            </div>
        `;
        disqualListDiv.appendChild(item);
    });
    document.querySelectorAll(".disqualify-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.getAttribute("data-id"));
            const reasonInput = document.getElementById(`reason_${id}`);
            const reason = reasonInput ? reasonInput.value.trim() : "";
            disqualifyPilot(id, reason || "Нарушение регламента");
        });
    });
    document.querySelectorAll(".restore-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.getAttribute("data-id"));
            restorePilot(id);
        });
    });
}

async function disqualifyPilot(id, reason){
    const pilot = pilotsData.find(p => p.id === id);
    if (pilot && !pilot.disqualified){
        pilot.disqualified = true;
        pilot.disqualificationReason = reason;
        await savePilotsToSupabase();
        renderTable();
        renderDisqualList();
        renderHeatsList();
        updateTop3();
        renderPlayoff();
        if (isAdmin) { renderAdminList(); renderHeatsAssignment(); }
        await addLogToSupabase("Дисквалификация", `${pilot.name} - ${reason}`);
        await addDisqualHistoryToSupabase(pilot.name, reason, "дисквалифицирован");
        formMessage.innerHTML = `⛔ ${pilot.name} дисквалифицирован. Причина: ${reason}`;
    }
}

async function restorePilot(id){
    const pilot = pilotsData.find(p => p.id === id);
    if (pilot && pilot.disqualified){
        pilot.disqualified = false;
        pilot.disqualificationReason = "";
        await savePilotsToSupabase();
        renderTable();
        renderDisqualList();
        renderHeatsList();
        updateTop3();
        renderPlayoff();
        if (isAdmin) { renderAdminList(); renderHeatsAssignment(); }
        await addLogToSupabase("Восстановление", `${pilot.name} восстановлен`);
        await addDisqualHistoryToSupabase(pilot.name, "", "восстановлен");
        formMessage.innerHTML = `✅ ${pilot.name} восстановлен.`;
    }
}

function renderDisqualHistory() {
    if (!disqualHistoryDiv) return;
    if (disqualHistory.length === 0) {
        disqualHistoryDiv.innerHTML = "<p>История пуста</p>";
        return;
    }
    disqualHistoryDiv.innerHTML = disqualHistory.map(h => `
        <div class="log-item">
            <strong>${h.date}</strong> — ${h.pilotName} — <span style="color:#ffaa77;">${h.actionType}</span>${h.reason ? ` (${h.reason})` : ''}
        </div>
    `).join("");
}

function renderLogs() {
    if (!adminLogsDiv) return;
    if (adminLogs.length === 0) {
        adminLogsDiv.innerHTML = "<p>Логи пусты</p>";
        return;
    }
    adminLogsDiv.innerHTML = adminLogs.map(log => `
        <div class="log-item">
            <strong>${log.timestamp}</strong> — ${log.action}: ${log.details}
        </div>
    `).join("");
}

// ========== УПРАВЛЕНИЕ РЕГИСТРАЦИЕЙ ==========
function loadRegSettingsToUI() {
    if (isAdmin) {
        if (regEnabledCheckbox) regEnabledCheckbox.checked = regSettings.enabled;
        if (useTimerCheckbox) useTimerCheckbox.checked = regSettings.useTimer;
        if (regOpenTimeInput) regOpenTimeInput.value = regSettings.openTime || "";
        if (regCloseTimeInput) regCloseTimeInput.value = regSettings.closeTime || "";
        toggleTimerFields(regSettings.useTimer);
    }
    updateRegistrationUI();
    startTimerDisplay();
}

function saveRegSettingsToStorage() {
    saveRegSettingsToSupabase();
    updateRegistrationUI();
    startTimerDisplay();
    if (isAdmin && regSettingsMessage) {
        regSettingsMessage.innerHTML = "✅ Настройки сохранены";
        setTimeout(() => { if (regSettingsMessage) regSettingsMessage.innerHTML = ""; }, 2000);
    }
    addLogToSupabase("Регистрация", `Настройки обновлены: enabled=${regSettings.enabled}, useTimer=${regSettings.useTimer}`);
}

function toggleTimerFields(show) {
    if (timerFieldsDiv) timerFieldsDiv.style.display = show ? "flex" : "none";
}

function isRegistrationOpen() {
    if (!regSettings.enabled) return false;
    if (!regSettings.useTimer) return true;
    const now = new Date();
    let open = regSettings.openTime ? new Date(regSettings.openTime) : null;
    let close = regSettings.closeTime ? new Date(regSettings.closeTime) : null;
    if (open && close) return (now >= open && now <= close);
    if (open && !close) return now >= open;
    if (!open && close) return now <= close;
    return true;
}

function updateRegistrationUI() {
    const registerSection = document.getElementById("registerSection");
    const closedMsgDiv = document.getElementById("registrationClosedMsg");
    const nextOpenSpan = document.getElementById("nextOpenTime");
    if (!registerSection) return;
    const isOpen = isRegistrationOpen();
    if (isOpen) {
        registerSection.style.display = "block";
        if (closedMsgDiv) closedMsgDiv.style.display = "none";
    } else {
        registerSection.style.display = "none";
        if (closedMsgDiv) {
            closedMsgDiv.style.display = "block";
            let nextTime = null;
            const now = new Date();
            if (regSettings.useTimer) {
                if (regSettings.openTime && new Date(regSettings.openTime) > now) {
                    nextTime = new Date(regSettings.openTime);
                } else if (regSettings.closeTime && new Date(regSettings.closeTime) > now) {
                    nextTime = new Date(regSettings.closeTime);
                }
            }
            if (nextTime) {
                nextOpenSpan.innerText = nextTime.toLocaleString();
            } else {
                nextOpenSpan.innerText = "регистрация отключена администратором";
            }
        }
    }
}

function startRegistrationWatcher() {
    if (regCheckInterval) clearInterval(regCheckInterval);
    regCheckInterval = setInterval(() => { updateRegistrationUI(); }, 60000);
}

function startTimerDisplay() {
    if (regTimerInterval) clearInterval(regTimerInterval);
    function updateTimer() {
        if (!regTimerDiv) return;
        if (!regSettings.enabled || !regSettings.useTimer || !regSettings.closeTime) {
            regTimerDiv.innerHTML = "";
            return;
        }
        const now = new Date();
        const closeDate = new Date(regSettings.closeTime);
        if (closeDate <= now) {
            regTimerDiv.innerHTML = "⏰ Регистрация закрыта";
            return;
        }
        const diff = closeDate - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        regTimerDiv.innerHTML = `🕒 До конца регистрации: ${hours}ч ${minutes}м ${seconds}с`;
    }
    updateTimer();
    regTimerInterval = setInterval(updateTimer, 1000);
}

// ========== РЕГИСТРАЦИЯ НОВОГО ПИЛОТА ==========
async function registerNewPilot() {
    if (!isRegistrationOpen()) {
        regMessage.innerHTML = "❌ Регистрация в данный момент закрыта";
        return;
    }
    const name = regName.value.trim();
    const cc = regCountryCode.value.trim();
    const cn = regCountryName.value.trim();
    if (!name || !cc || !cn) {
        regMessage.innerHTML = "❌ Заполните все поля!";
        return;
    }
    if (pilotsData.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        regMessage.innerHTML = "❌ Пилот с таким именем уже существует!";
        return;
    }
    const newId = Date.now();
    const available = getAvailableHeats();
    let assignedHeat = 0;
    if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        assignedHeat = available[randomIndex];
    } else {
        regMessage.innerHTML = "⚠️ Все залёты заполнены (максимум 4 пилота в каждом). Пилот добавлен без залёта. Администратор может позже назначить.";
        assignedHeat = 0;
    }
    const newPilot = {
        id: newId, name, countryCode: cc, countryName: cn,
        bestLap: null, points: null, disqualified: false, disqualificationReason: ""
    };
    pilotsData.push(newPilot);
    heatsMap[newId] = assignedHeat;
    await savePilotsToSupabase();
    await saveHeatsToSupabase();
    regName.value = "";
    regCountryCode.value = "";
    regCountryName.value = "";
    let message = `✅ Команда "${name}" зарегистрирована!`;
    if (assignedHeat !== 0) message += ` Назначен залёт №${assignedHeat}.`;
    else message += ` Не назначен в залёт (все залёты заполнены). Администратор может назначить позже.`;
    message += ` Лучший круг и очки будут добавлены позже администратором.`;
    regMessage.innerHTML = message;
    setTimeout(() => { regMessage.innerHTML = ""; }, 5000);
    renderTable();
    renderHeatsList();
    updateTop3();
    renderPlayoff();
    if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
    await addLogToSupabase("Регистрация", `Новая команда: ${name}`);
}

// ========== CSV ==========
function exportToCSV() {
    const csvRows = [["id","name","countryCode","countryName","bestLap","points","disqualified","disqualificationReason"]];
    for (let p of pilotsData) {
        csvRows.push([p.id, p.name, p.countryCode, p.countryName, p.bestLap ?? "", p.points ?? "", p.disqualified, p.disqualificationReason]);
    }
    const csv = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], {type: "text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pilots.csv";
    a.click();
    addLogToSupabase("Экспорт", "CSV выгружен");
}

async function importFromCSV(file) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const rows = text.split("\n").map(row => row.split(","));
        const newPilots = [];
        for (let i=1; i<rows.length; i++) {
            if (rows[i].length < 7) continue;
            const id = parseInt(rows[i][0]) || Date.now()+i;
            const name = rows[i][1];
            const countryCode = rows[i][2];
            const countryName = rows[i][3];
            const bestLap = rows[i][4] === "" ? null : parseFloat(rows[i][4]);
            const points = rows[i][5] === "" ? null : parseInt(rows[i][5]);
            const disqualified = rows[i][6] === "true";
            const disqualificationReason = rows[i][7] || "";
            if (name && countryCode && countryName) {
                newPilots.push({ id, name, countryCode, countryName, bestLap, points, disqualified, disqualificationReason });
            }
        }
        if (newPilots.length) {
            pilotsData = newPilots;
            heatsMap = {};
            pilotsData.forEach(p => { heatsMap[p.id] = 0; });
            await savePilotsToSupabase();
            await saveHeatsToSupabase();
            renderTable();
            renderHeatsList();
            updateTop3();
            renderPlayoff();
            if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
            csvMessage.innerHTML = `✅ Импортировано ${newPilots.length} пилотов`;
            await addLogToSupabase("Импорт", `CSV импортирован, ${newPilots.length} записей`);
        } else {
            csvMessage.innerHTML = "❌ Не найдено валидных данных в CSV";
        }
    };
    reader.readAsText(file);
}

// ========== КАСТОМИЗАЦИЯ ==========
async function saveCustomLogo() {
    const newLogo = customLogoText.value.trim();
    if (newLogo) {
        customLogo = newLogo;
        await saveCustomToSupabase();
        const logoElem = document.getElementById("customLogo");
        if (logoElem) logoElem.innerHTML = `<i class="fas fa-dragon"></i> ${customLogo}`;
        customizeMsg.innerHTML = "Логотип сохранён";
        setTimeout(() => customizeMsg.innerHTML = "", 2000);
        await addLogToSupabase("Оформление", `Логотип изменён на ${customLogo}`);
    }
}

async function saveCustomBg() {
    const bgUrl = customBgUrl.value.trim();
    customBg = bgUrl;
    await saveCustomToSupabase();
    document.body.style.backgroundImage = bgUrl ? `url(${bgUrl})` : "";
    customizeMsg.innerHTML = "Фон применён";
    setTimeout(() => customizeMsg.innerHTML = "", 2000);
    await addLogToSupabase("Оформление", `Фоновое изображение изменено`);
}

// ========== АДМИН ВХОД/ВЫХОД ==========
function showAdminModal() { adminModal.style.display = "flex"; adminPasswordInput.value = ""; adminErrorSpan.innerText = ""; }
function closeAdminModal() { adminModal.style.display = "none"; }
function loginAdmin() {
    if (adminPasswordInput.value === adminPassword) {
        isAdmin = true;
        closeAdminModal();
        adminPanel.style.display = "block";
        renderAdminList();
        renderDisqualList();
        renderHeatsAssignment();
        renderLogs();
        renderDisqualHistory();
        addLogToSupabase("Вход", "Администратор вошёл в панель");
    } else {
        adminErrorSpan.innerText = "Неверный пароль!";
    }
}
function logoutAdmin() {
    isAdmin = false;
    adminPanel.style.display = "none";
    addLogToSupabase("Выход", "Администратор вышел");
}

// ========== МУЛЬТИЯЗЫЧНОСТЬ ==========
const translations = {
    ru: {
        top3Title: "🏆 Топ-3 пилотов",
        chartTitle: "📈 Динамика очков (топ-5)",
        regTitle: "Регистрация новой команды / пилота",
        regNameLabel: "Имя пилота",
        regCodeLabel: "Эмодзи страны",
        regCountryLabel: "Страна",
        regBtnText: "Зарегистрировать",
        closedMsgText: "Регистрация временно закрыта. Следующее открытие:"
    },
    en: {
        top3Title: "🏆 Top-3 pilots",
        chartTitle: "📈 Points dynamics (top-5)",
        regTitle: "New team / pilot registration",
        regNameLabel: "Pilot name",
        regCodeLabel: "Country emoji",
        regCountryLabel: "Country",
        regBtnText: "Register",
        closedMsgText: "Registration is temporarily closed. Next opening:"
    }
};

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    const top3TitleElem = document.getElementById("top3Title");
    if (top3TitleElem) top3TitleElem.innerText = t.top3Title;
    const chartTitleElem = document.getElementById("chartTitle");
    if (chartTitleElem) chartTitleElem.innerText = t.chartTitle;
    const regTitleElem = document.getElementById("regTitle");
    if (regTitleElem) regTitleElem.innerText = t.regTitle;
    const regNameLabelElem = document.getElementById("regNameLabel");
    if (regNameLabelElem) regNameLabelElem.innerText = t.regNameLabel;
    const regCodeLabelElem = document.getElementById("regCodeLabel");
    if (regCodeLabelElem) regCodeLabelElem.innerText = t.regCodeLabel;
    const regCountryLabelElem = document.getElementById("regCountryLabel");
    if (regCountryLabelElem) regCountryLabelElem.innerText = t.regCountryLabel;
    const regBtnTextSpan = document.querySelector("#registerBtn span");
    if (regBtnTextSpan) regBtnTextSpan.innerText = t.regBtnText;
    const closedMsgTextSpan = document.getElementById("closedMsgText");
    if (closedMsgTextSpan) closedMsgTextSpan.innerText = t.closedMsgText;
    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
    if (lang === "ru") langRuBtn.classList.add("active");
    else langEnBtn.classList.add("active");
}

// ========== СОРТИРОВКА ==========
function attachSortListeners() {
    document.querySelectorAll("#racingTable th[data-sort]").forEach(th => {
        const key = th.getAttribute("data-sort");
        if (key === "pos") return;
        th.addEventListener("click", () => {
            if (sortColumn === key) sortDirection = sortDirection === "asc" ? "desc" : "asc";
            else { sortColumn = key; sortDirection = (key === "points" || key === "bestLap") ? "desc" : "asc"; }
            renderTable();
        });
    });
}

// ========== ВКЛАДКИ ==========
function switchTab(tabId) {
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach(tc => tc.classList.remove("active"));
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    if (tabId === "heatsTab") renderHeatsAssignment();
    if (tabId === "pilotsTab") renderAdminList();
    if (tabId === "disqualTab") renderDisqualList();
    if (tabId === "disqualHistoryTab") renderDisqualHistory();
    if (tabId === "logsTab") renderLogs();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
async function init() {
    await loadAllData();
    attachSortListeners();

    searchInput.addEventListener("input", () => { currentFilter = searchInput.value; renderTable(); });
    resetBtn.addEventListener("click", () => { searchInput.value = ""; currentFilter = ""; renderTable(); });
    adminLoginBtn.addEventListener("click", showAdminModal);
    closeModalSpans.forEach(span => span.addEventListener("click", function() { this.closest(".modal").style.display = "none"; }));
    window.addEventListener("click", (e) => { if (e.target === adminModal) closeAdminModal(); if (e.target === lapTimeModal) lapTimeModal.style.display = "none"; });
    submitAdminPass.addEventListener("click", loginAdmin);
    logoutAdminBtn.addEventListener("click", logoutAdmin);
    addPilotBtn.addEventListener("click", addOrUpdatePilot);
    cancelEditBtn.addEventListener("click", cancelEdit);
    saveHeatsBtn.addEventListener("click", saveHeatsDistribution);
    randomHeatsBtn.addEventListener("click", randomizeHeats);
    changePasswordBtn.addEventListener("click", async () => {
        const newPass = newPasswordInput.value;
        const confirm = confirmPasswordInput.value;
        if (!newPass || newPass.length < 4) { passwordMessage.innerHTML = "Пароль должен быть не менее 4 символов"; return; }
        if (newPass !== confirm) { passwordMessage.innerHTML = "Пароли не совпадают"; return; }
        adminPassword = newPass;
        await saveAdminPasswordToSupabase();
        passwordMessage.innerHTML = "✅ Пароль успешно изменён!";
        setTimeout(() => passwordMessage.innerHTML = "", 2000);
        await addLogToSupabase("Безопасность", "Пароль администратора изменён");
    });
    registerBtn.addEventListener("click", registerNewPilot);
    if (saveRegSettingsBtn) {
        saveRegSettingsBtn.addEventListener("click", () => {
            regSettings.enabled = regEnabledCheckbox.checked;
            regSettings.useTimer = useTimerCheckbox.checked;
            regSettings.openTime = regOpenTimeInput.value || null;
            regSettings.closeTime = regCloseTimeInput.value || null;
            saveRegSettingsToStorage();
        });
    }
    if (useTimerCheckbox) useTimerCheckbox.addEventListener("change", (e) => toggleTimerFields(e.target.checked));
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportToCSV);
    if (importCsvBtn) importCsvBtn.addEventListener("click", () => { if (importCsvFile.files[0]) importFromCSV(importCsvFile.files[0]); else csvMessage.innerText = "Выберите файл"; });
    if (saveLogoBtn) saveLogoBtn.addEventListener("click", saveCustomLogo);
    if (saveBgBtn) saveBgBtn.addEventListener("click", saveCustomBg);
    if (clearLogsBtn) clearLogsBtn.addEventListener("click", async () => { adminLogs = []; await supabase.from('admin_logs').delete().neq('id', 0); renderLogs(); await addLogToSupabase("Очистка", "Логи удалены"); });
    if (saveLapTimeBtn) saveLapTimeBtn.addEventListener("click", saveLapTime);
    if (importFromRHBtn) importFromRHBtn.addEventListener("click", importFromRotorHazard);
    if (importManualJsonBtn) importManualJsonBtn.addEventListener("click", importManualJson);
    
    const tabBtnsAll = document.querySelectorAll(".tab-btn");
    tabBtnsAll.forEach(btn => {
        btn.addEventListener("click", () => { switchTab(btn.getAttribute("data-tab")); });
    });
    langRuBtn.addEventListener("click", () => setLanguage("ru"));
    langEnBtn.addEventListener("click", () => setLanguage("en"));
    setLanguage("ru");
}
init();