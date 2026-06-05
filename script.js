// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let pilotsData = [];
let currentFilter = "";
let sortColumn = "points";
let sortDirection = "desc";
let isAdmin = false;
let editingPilotId = null;
let heatsMap = {};
let adminPassword = "admin123";

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
const closeModalSpan = document.querySelector(".close-modal");
const heatsListDiv = document.getElementById("heatsList");
const heatsAssignmentDiv = document.getElementById("heatsAssignment");
const saveHeatsBtn = document.getElementById("saveHeatsBtn");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordMessage = document.getElementById("passwordMessage");
const disqualListDiv = document.getElementById("disqualList");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// регистрация команды
const registerBtn = document.getElementById("registerBtn");
const regName = document.getElementById("regName");
const regCountryCode = document.getElementById("regCountryCode");
const regCountryName = document.getElementById("regCountryName");
const regMessage = document.getElementById("regMessage");

// splash screen элементы
const splashScreen = document.getElementById("splashScreen");
const closeSplashBtn = document.getElementById("closeSplashBtn");

// ========== ФУНКЦИЯ ДЛЯ ПЕРВОГО ПОСЕЩЕНИЯ ==========
function checkAndShowSplash() {
    const hasVisited = localStorage.getItem("phoenixSplashSeen");
    if (!hasVisited) {
        // Показываем splash
        splashScreen.classList.remove("hide");
        // Автоматически скрыть через 3 секунды
        const timer = setTimeout(() => {
            hideSplashAndSave();
        }, 4000);
        // Кнопка закрытия
        closeSplashBtn.addEventListener("click", () => {
            clearTimeout(timer);
            hideSplashAndSave();
        });
    } else {
        splashScreen.classList.add("hide");
    }
}
function hideSplashAndSave() {
    splashScreen.classList.add("hide");
    localStorage.setItem("phoenixSplashSeen", "true");
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ПРОВЕРКА ЗАЛЁТОВ (не более 4 пилотов) ==========
function getHeatCounts() {
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
    pilotsData.forEach(pilot => {
        if (pilot.disqualified) return;
        const heat = heatsMap[pilot.id];
        if (heat >= 1 && heat <= 6) {
            counts[heat]++;
        }
    });
    return counts;
}

function isHeatAvailable(heatNumber, excludePilotId = null) {
    const counts = getHeatCounts();
    let currentCount = counts[heatNumber] || 0;
    if (excludePilotId !== null) {
        const pilotHeat = heatsMap[excludePilotId];
        if (pilotHeat === heatNumber) {
            currentCount--;
        }
    }
    return currentCount < 4;
}

function getAvailableHeats(excludePilotId = null) {
    const available = [];
    for (let i = 1; i <= 6; i++) {
        if (isHeatAvailable(i, excludePilotId)) {
            available.push(i);
        }
    }
    return available;
}

// ========== ЗАГРУЗКА / СОХРАНЕНИЕ ==========
function loadDataFromLocalStorage() {
    const stored = localStorage.getItem("phoenixRacingData");
    if (stored) {
        pilotsData = JSON.parse(stored);
        pilotsData.forEach(p => {
            if (p.disqualified === undefined) p.disqualified = false;
            if (p.disqualificationReason === undefined) p.disqualificationReason = "";
            if (p.bestLap === undefined || p.bestLap === null) p.bestLap = null;
            if (p.points === undefined || p.points === null) p.points = null;
        });
    } else {
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
        saveDataToLocalStorage();
    }
    const storedPass = localStorage.getItem("adminPassword");
    if (storedPass) adminPassword = storedPass;
    const storedHeats = localStorage.getItem("heatsAssignment");
    if (storedHeats) {
        heatsMap = JSON.parse(storedHeats);
    } else {
        heatsMap = {};
        pilotsData.forEach(p => { heatsMap[p.id] = 0; });
        saveHeatsToLocalStorage();
    }
}
function saveDataToLocalStorage() {
    localStorage.setItem("phoenixRacingData", JSON.stringify(pilotsData));
}
function saveHeatsToLocalStorage() {
    localStorage.setItem("heatsAssignment", JSON.stringify(heatsMap));
}

// ========== ОСНОВНАЯ ТАБЛИЦА (с учётом null) ==========
function filterAndSortData() {
    let filtered = [...pilotsData];
    if (currentFilter.trim()) {
        const low = currentFilter.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(low) ||
            p.countryName.toLowerCase().includes(low)
        );
    }
    filtered.sort((a, b) => {
        let valA, valB;
        switch(sortColumn) {
            case "pilot":   valA = a.name; valB = b.name; break;
            case "country": valA = a.countryName; valB = b.countryName; break;
            case "bestLap": valA = a.bestLap; valB = b.bestLap; break;
            case "points":  valA = a.points; valB = b.points; break;
            default: return 0;
        }
        if (sortColumn === "bestLap" || sortColumn === "points") {
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;
            if (sortDirection === "asc") return valA - valB;
            else return valB - valA;
        } else {
            if (sortDirection === "asc") return valA.localeCompare(valB);
            else return valB.localeCompare(valA);
        }
    });
    return filtered;
}
function updateSortIndicators(){
    document.querySelectorAll("#racingTable th[data-sort]").forEach(th=>{
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
function renderTable(){
    const allSorted = filterAndSortData();
    const activePilots = allSorted.filter(p => !p.disqualified);
    rowStatsSpan.innerHTML = `🏁 ${allSorted.length} / ${pilotsData.length} пилотов | Активных: ${activePilots.length}`;
    if (!allSorted.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">🚁 Нет пилотов</td></tr>`;
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
        html += `<tr class="${rowClass}">
            <td class="pos-cell">${displayPos}</td>
            <td><span class="pilot-name"><i class="fas fa-drone"></i> ${escapeHtml(p.name)}</span></td>
            <td><span class="country-flag">${p.countryCode}</span> ${escapeHtml(p.countryName)}</td>
            <td><span class="time-cell">⏱️ ${bestLapDisplay}</span></td>
            <td class="points-cell"><i class="fas fa-star"></i> ${pointsDisplay}</td>
            <td class="status-cell">${statusHtml}</td>
        </tr>`;
    });
    tbody.innerHTML = html;
    updateSortIndicators();
}

// ========== ПУБЛИЧНЫЕ ЗАЛЁТЫ ==========
function renderPublicHeats(){
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

// ========== АДМИНКА: ПИЛОТЫ ==========
function renderAdminList(){
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
        btn.addEventListener("click", (e) => { e.stopPropagation(); deletePilotById(parseInt(btn.getAttribute("data-id"))); });
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
function addOrUpdatePilot(){
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
        }
        editingPilotId = null;
    } else {
        const newId = Date.now();
        pilotsData.push({
            id: newId, name, countryCode: cc, countryName: cn,
            bestLap: lap, points: pts, disqualified: false, disqualificationReason: ""
        });
        heatsMap[newId] = 0;
        formMessage.innerHTML = "✅ Пилот добавлен";
    }
    saveDataToLocalStorage();
    saveHeatsToLocalStorage();
    cancelEdit();
    renderTable();
    if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
    renderPublicHeats();
}
function deletePilotById(id){
    if (confirm("Удалить пилота?")){
        pilotsData = pilotsData.filter(p => p.id !== id);
        delete heatsMap[id];
        saveDataToLocalStorage();
        saveHeatsToLocalStorage();
        renderTable();
        if (isAdmin) { renderAdminList(); renderDisqualList(); renderHeatsAssignment(); }
        renderPublicHeats();
        cancelEdit();
    }
}

// ========== АДМИНКА: ДИСКВАЛИФИКАЦИИ ==========
function renderDisqualList(){
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
function disqualifyPilot(id, reason){
    const pilot = pilotsData.find(p => p.id === id);
    if (pilot && !pilot.disqualified){
        pilot.disqualified = true;
        pilot.disqualificationReason = reason;
        saveDataToLocalStorage();
        renderTable();
        renderDisqualList();
        renderPublicHeats();
        if (isAdmin) { renderAdminList(); renderHeatsAssignment(); }
        formMessage.innerHTML = `⛔ ${pilot.name} дисквалифицирован. Причина: ${reason}`;
    }
}
function restorePilot(id){
    const pilot = pilotsData.find(p => p.id === id);
    if (pilot && pilot.disqualified){
        pilot.disqualified = false;
        pilot.disqualificationReason = "";
        saveDataToLocalStorage();
        renderTable();
        renderDisqualList();
        renderPublicHeats();
        if (isAdmin) { renderAdminList(); renderHeatsAssignment(); }
        formMessage.innerHTML = `✅ ${pilot.name} восстановлен.`;
    }
}

// ========== АДМИНКА: ЗАЛЁТЫ (с ограничением 4) ==========
function renderHeatsAssignment(){
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
function saveHeatsDistribution(){
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
    saveHeatsToLocalStorage();
    renderPublicHeats();
    formMessage.innerHTML = "✅ Распределение по залётам сохранено!";
    setTimeout(() => { if(formMessage) formMessage.innerHTML = ""; }, 2000);
}

// ========== СМЕНА ПАРОЛЯ ==========
function changeAdminPassword(){
    const newPass = newPasswordInput.value;
    const confirm = confirmPasswordInput.value;
    if (!newPass || newPass.length < 4){
        passwordMessage.innerHTML = "Пароль должен быть не менее 4 символов";
        return;
    }
    if (newPass !== confirm){
        passwordMessage.innerHTML = "Пароли не совпадают";
        return;
    }
    adminPassword = newPass;
    localStorage.setItem("adminPassword", adminPassword);
    passwordMessage.innerHTML = "✅ Пароль успешно изменён!";
    setTimeout(() => { passwordMessage.innerHTML = ""; }, 2000);
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
}

// ========== АДМИН ВХОД/ВЫХОД ==========
function showAdminModal(){ adminModal.style.display = "flex"; adminPasswordInput.value = ""; adminErrorSpan.innerText = ""; }
function closeAdminModal(){ adminModal.style.display = "none"; }
function loginAdmin(){
    if (adminPasswordInput.value === adminPassword){
        isAdmin = true;
        closeAdminModal();
        adminPanel.style.display = "block";
        renderAdminList();
        renderDisqualList();
        renderHeatsAssignment();
        cancelEdit();
        document.querySelector(".tab-btn[data-tab='pilotsTab']").click();
    } else {
        adminErrorSpan.innerText = "Неверный пароль!";
    }
}
function logoutAdmin(){
    isAdmin = false;
    adminPanel.style.display = "none";
}

// ========== РЕГИСТРАЦИЯ КОМАНДЫ (прочерк + случайный доступный залёт) ==========
function registerNewPilot() {
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
        id: newId,
        name: name,
        countryCode: cc,
        countryName: cn,
        bestLap: null,
        points: null,
        disqualified: false,
        disqualificationReason: ""
    };
    pilotsData.push(newPilot);
    heatsMap[newId] = assignedHeat;
    saveDataToLocalStorage();
    saveHeatsToLocalStorage();
    regName.value = "";
    regCountryCode.value = "";
    regCountryName.value = "";
    let message = `✅ Команда "${name}" зарегистрирована!`;
    if (assignedHeat !== 0) {
        message += ` Назначен залёт №${assignedHeat}.`;
    } else {
        message += ` Не назначен в залёт (все залёты заполнены). Администратор может назначить позже.`;
    }
    message += ` Лучший круг и очки будут добавлены позже администратором.`;
    regMessage.innerHTML = message;
    setTimeout(() => { regMessage.innerHTML = ""; }, 5000);
    renderTable();
    renderPublicHeats();
    if (isAdmin) {
        renderAdminList();
        renderDisqualList();
        renderHeatsAssignment();
    }
}

// ========== ВКЛАДКИ ==========
function switchTab(tabId){
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    tabBtns.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add("active");
    if (tabId === "heatsTab") renderHeatsAssignment();
    if (tabId === "pilotsTab") renderAdminList();
    if (tabId === "disqualTab") renderDisqualList();
}

// ========== СОРТИРОВКА ==========
function attachSortListeners(){
    document.querySelectorAll("#racingTable th[data-sort]").forEach(th => {
        const key = th.getAttribute("data-sort");
        if (key === "pos") return;
        th.addEventListener("click", () => {
            if (sortColumn === key) {
                sortDirection = sortDirection === "asc" ? "desc" : "asc";
            } else {
                sortColumn = key;
                sortDirection = (key === "points" || key === "bestLap") ? "desc" : "asc";
            }
            renderTable();
        });
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function init(){
    loadDataFromLocalStorage();
    renderTable();
    attachSortListeners();
    renderPublicHeats();
    searchInput.addEventListener("input", () => { currentFilter = searchInput.value; renderTable(); });
    resetBtn.addEventListener("click", () => { searchInput.value = ""; currentFilter = ""; renderTable(); });
    adminLoginBtn.addEventListener("click", showAdminModal);
    closeModalSpan.addEventListener("click", closeAdminModal);
    window.addEventListener("click", (e) => { if (e.target === adminModal) closeAdminModal(); });
    submitAdminPass.addEventListener("click", loginAdmin);
    logoutAdminBtn.addEventListener("click", logoutAdmin);
    addPilotBtn.addEventListener("click", addOrUpdatePilot);
    cancelEditBtn.addEventListener("click", cancelEdit);
    saveHeatsBtn.addEventListener("click", saveHeatsDistribution);
    changePasswordBtn.addEventListener("click", changeAdminPassword);
    registerBtn.addEventListener("click", registerNewPilot);
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchTab(tabId);
        });
    });
    // Показать приветственный экран, если первый раз
    checkAndShowSplash();
}
document.addEventListener("DOMContentLoaded", init);