/* ============================================================
   2026 FIFA World Cup Prediction Game - app.js
   ============================================================ */

let userGroupMatches = {};
let state = { user: '', knockout: { userScores: {} } };

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización
    initTabs();
    initToolbar();
    restoreLocalPrediction();
    renderGroups();
    if (typeof renderBracket === 'function') renderBracket();
});

/* --- LÓGICA DE CALCULO DE PUNTOS --- */
function calculateGroupStandings(groupMatches, teams) {
    let standings = teams.map(team => ({ name: team, pts: 0, played: 0 }));
    
    Object.keys(groupMatches).forEach(matchKey => {
        const [t1, t2] = matchKey.split('__');
        // Solo contar si el partido es de este grupo
        if (!teams.includes(t1) || !teams.includes(t2)) return;
        
        const { home, away } = groupMatches[matchKey];
        if (home !== null && away !== null) {
            const idx1 = standings.findIndex(s => s.name === t1);
            const idx2 = standings.findIndex(s => s.name === t2);
            standings[idx1].played++;
            standings[idx2].played++;
            
            if (home > away) standings[idx1].pts += 3;
            else if (home < away) standings[idx2].pts += 3;
            else { standings[idx1].pts += 1; standings[idx2].pts += 1; }
        }
    });
    return standings.sort((a, b) => b.pts - a.pts);
}

/* --- RENDERIZADO --- */
function renderGroups() {
    const grid = document.getElementById('groupsGrid');
    if (!grid || typeof RESULTS === 'undefined') return;
    grid.innerHTML = '';

    Object.keys(RESULTS.groups).forEach(groupId => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `<h3>Grupo ${groupId}</h3>`;
        
        const teams = RESULTS.groups[groupId];
        const matchesContainer = document.createElement('div');
        matchesContainer.className = 'group-matches';
        
        // 1. Renderizar Partidos
        const groupMatches = RESULTS.matches.filter(m => teams.includes(m.team1) || teams.includes(m.team2));
        groupMatches.forEach(match => {
            const matchKey = `${match.team1}__${match.team2}`;
            const score = userGroupMatches[matchKey] || { home: null, away: null };
            
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-row';
            matchDiv.innerHTML = `
                <span class="team-name">${match.team1}</span>
                <input type="number" min="0" value="${score.home !== null ? score.home : ''}" 
                    onchange="handleGroupScoreChange('${matchKey}', 'home', this.value)">
                <span class="vs">vs</span>
                <input type="number" min="0" value="${score.away !== null ? score.away : ''}" 
                    onchange="handleGroupScoreChange('${matchKey}', 'away', this.value)">
                <span class="team-name">${match.team2}</span>
            `;
            matchesContainer.appendChild(matchDiv);
        });

        // 2. Renderizar Tabla de Puntos
        const tableData = calculateGroupStandings(userGroupMatches, teams);
        const tableHtml = document.createElement('table');
        tableHtml.className = 'group-table';
        tableHtml.innerHTML = `
            <thead><tr><th>Equipo</th><th>Pts</th></tr></thead>
            <tbody>
                ${tableData.map(row => `<tr><td>${row.name}</td><td>${row.pts}</td></tr>`).join('')}
            </tbody>
        `;
        matchesContainer.appendChild(tableHtml);

        groupCard.appendChild(matchesContainer);
        grid.appendChild(groupCard);
    });
}

function handleGroupScoreChange(matchKey, side, value) {
    if (!userGroupMatches[matchKey]) {
        userGroupMatches[matchKey] = { home: null, away: null };
    }
    userGroupMatches[matchKey][side] = value !== '' ? parseInt(value, 10) : null;
    
    // Guardar
    localStorage.setItem('worldCup2026_myPrediction', JSON.stringify({ groupMatches: userGroupMatches }));
    
    // Re-renderizar solo la vista para actualizar tabla
    renderGroups();
}

/* --- UTILIDADES --- */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
}

function initToolbar() {
    const btn = document.getElementById('btnReset');
    if(btn) {
        btn.addEventListener('click', () => {
            if(confirm('¿Seguro? Se borrarán todos tus pronósticos.')) {
                userGroupMatches = {};
                localStorage.removeItem('worldCup2026_myPrediction');
                renderGroups();
            }
        });
    }
}

function restoreLocalPrediction() {
    const saved = localStorage.getItem('worldCup2026_myPrediction');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            userGroupMatches = parsed.groupMatches || {};
            renderGroups();
        } catch(e) { console.error(e); }
    }
}
