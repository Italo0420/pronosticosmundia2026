/* ============================================================
   2026 FIFA World Cup Prediction Game - app.js (Versión Actualizada)
   ============================================================ */

// Inicialización de variables de estado
let userGroupMatches = {};
let state = { user: '', knockout: { userScores: {} } };

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  restoreLocalPrediction();
  renderGroups();
});

/* --- LOGICA DE CALCULO DE PUNTOS --- */
function calculateGroupStandings(groupMatches, teams) {
  let standings = teams.map(team => ({ name: team, pts: 0, played: 0 }));

  Object.keys(groupMatches).forEach(matchKey => {
    const [t1, t2] = matchKey.split('__');
    
    // Solo procesar si el partido pertenece a este grupo
    if (!teams.includes(t1) || !teams.includes(t2)) return;

    const { home, away } = groupMatches[matchKey];

    if (home !== null && away !== null) {
      const idx1 = standings.findIndex(s => s.name === t1);
      const idx2 = standings.findIndex(s => s.name === t2);
      
      standings[idx1].played++;
      standings[idx2].played++;

      if (home > away) standings[idx1].pts += 3;
      else if (home < away) standings[idx2].pts += 3;
      else {
        standings[idx1].pts += 1;
        standings[idx2].pts += 1;
      }
    }
  });

  return standings.sort((a, b) => b.pts - a.pts);
}

function renderGroups() {
  const grid = document.getElementById('groupsGrid');
  if (!grid || typeof RESULTS === 'undefined') return;
  
  // Limpiamos grid para redibujar
  grid.innerHTML = '';

  Object.keys(RESULTS.groups).forEach(groupId => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    groupCard.innerHTML = `<h3>Grupo ${groupId}</h3>`;
    
    const teams = RESULTS.groups[groupId];
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'group-matches';
    
    // (Tu lógica actual de renderizado de inputs debe ir aquí)
    // ...
    
    // Inyección de Tabla Dinámica
    const tableData = calculateGroupStandings(userGroupMatches, teams);
    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = `
      <table class="group-table" style="width:100%; border-collapse:collapse; margin-top:10px; color:white;">
        <thead><tr><th>Equipo</th><th>Pts</th></tr></thead>
        <tbody>
          ${tableData.map(row => `<tr><td>${row.name}</td><td>${row.pts}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    matchesContainer.appendChild(tableDiv);

    groupCard.appendChild(matchesContainer);
    grid.appendChild(groupCard);
  });
}

function handleGroupScoreChange(matchKey, side, value) {
  if (!userGroupMatches[matchKey]) {
    userGroupMatches[matchKey] = { home: null, away: null };
  }
  userGroupMatches[matchKey][side] = value !== '' ? parseInt(value, 10) : null;
  
  // Guardar y refrescar vista
  localStorage.setItem('worldCup2026_myPrediction', JSON.stringify({ groupMatches: userGroupMatches }));
  renderGroups(); 
}

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
