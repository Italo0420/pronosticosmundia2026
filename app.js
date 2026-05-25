/* ============================================================
   2026 FIFA World Cup Prediction Game - app.js (Modificado)
   ============================================================ */

const LEADERBOARD_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDbPhOej3DnN_bdvrCQ5R0T6HZg6bBaxKdH17J_Pc3oGOkKkd9V83BUDYlBSCevOrqYK2XQuA7ZMCx/pub?gid=1633860364&single=true&output=csv';
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdiF0qsK65DcaadNKRzDbue8xtkzAIIev-7yqUqAH3srhEAQg/formResponse';

// Sistema de puntuación unificado
const SCORING_SYSTEM = {
  group_exact: 3,
  group_outcome: 1,
  knockout_exact: 3,
  knockout_outcome: 1
};

let currentTab = 'predict';
let state = {
  user: '',
  groupMatches: {},
  knockout: {
    userScores: {}
  }
};

let userGroupMatches = {};
let userKnockout = { userScores: {} };

// Inicialización de listeners básicos
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initToolbar();
  renderGroups();
  renderBracket();
  restoreLocalPrediction();
});

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = `tab-${btn.getAttribute('data-tab')}`;
      document.getElementById(tabId).classList.add('active');
      currentTab = btn.getAttribute('data-tab');
    });
  });
}

function initToolbar() {
  const btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Seguro que quieres borrar todas tus predicciones? No hay vuelta atrás.')) {
        localStorage.removeItem('worldCup2026_myPrediction');
        userGroupMatches = {};
        userKnockout = { userScores: {} };
        state.knockout.userScores = {};
        renderGroups();
        renderBracket();
        showToast('Todo limpio. Vuelve a empezar.');
      }
    });
  }

  const btnScoringHelp = document.getElementById('btnScoringHelp');
  if (btnScoringHelp) {
    btnScoringHelp.addEventListener('click', () => {
      alert('Sistema de Puntos:\n\n- Marcador exacto (Grupos y Knockouts): 3 puntos\n- Acertar ganador o empate: 1 punto');
    });
  }

  document.getElementById('btnSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'block';
  });

  document.getElementById('cancelNameSubmit').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
  });

  document.getElementById('confirmNameSubmit').addEventListener('click', () => {
    const name = document.getElementById('playerNameInput').value.trim();
    if (!name) {
      showToast('Por favor, introduce tu nombre', true);
      return;
    }
    submitPrediction(name);
  });
}

function renderGroups() {
  const grid = document.getElementById('groupsGrid');
  if (!grid || typeof RESULTS === 'undefined') return;
  grid.innerHTML = '';

  Object.keys(RESULTS.groups).forEach(groupId => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';
    groupCard.innerHTML = `<h3>Grupo ${groupId}</h3>`;
    
    // Aquí se renderizarían los partidos dinámicamente según RESULTS de results.js
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'group-matches';
    
    const teams = RESULTS.groups[groupId];
    // Simulación de renderizado rápido basado en combinaciones
    let matchIdx = 0;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const t1 = teams[i];
        const t2 = teams[j];
        const matchKey = `${t1}__${t2}`;
        const currentHome = userGroupMatches[matchKey]?.home ?? '';
        const currentAway = userGroupMatches[matchKey]?.away ?? '';

        const mRow = document.createElement('div');
        mRow.className = 'match-row';
        mRow.innerHTML = `
          <div class="team-lbl"><span>${t1}</span></div>
          <input type="number" class="score-input" min="0" value="${currentHome}" oninput="handleGroupScoreChange('${matchKey}', 'home', this.value)">
          <span class="vs">vs</span>
          <input type="number" class="score-input" min="0" value="${currentAway}" oninput="handleGroupScoreChange('${matchKey}', 'away', this.value)">
          <div class="team-lbl"><span>${t2}</span></div>
        `;
        matchesContainer.appendChild(mRow);
      }
    }
    groupCard.appendChild(matchesContainer);
    grid.appendChild(groupCard);
  });
}

function handleGroupScoreChange(matchKey, side, value) {
  if (!userGroupMatches[matchKey]) {
    userGroupMatches[matchKey] = { home: null, away: null };
  }
  userGroupMatches[matchKey][side] = value !== '' ? parseInt(value, 10) : null;
  saveLocalPredictionSoon();
}

function renderBracket() {
  const container = document.getElementById('bracketContainer');
  if (!container || typeof RESULTS === 'undefined') return;
  container.innerHTML = '';

  const rounds = [
    { key: 'round32', name: 'Dieciseisavos' },
    { key: 'round16', name: 'Octavos' },
    { key: 'quarterfinals', name: 'Cuartos' },
    { key: 'semifinals', name: 'Semifinales' },
    { key: 'thirdPlace', name: '3º Puesto' },
    { key: 'final', name: 'Final' }
  ];

  rounds.forEach(round => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'bracket-round';
    
    const title = document.createElement('h3');
    title.innerText = round.name;
    roundDiv.appendChild(title);

    const matchesInRound = RESULTS.knockout.matches[round.key] || [];

    matchesInRound.forEach((m) => {
      const matchBox = document.createElement('div');
      matchBox.className = 'matchup-box';

      const t1Name = m.team1 || `Prov. ${m.match}A`;
      const t2Name = m.team2 || `Prov. ${m.match}B`;

      const currentHomeScore = state.knockout.userScores?.[m.match]?.home ?? '';
      const currentAwayScore = state.knockout.userScores?.[m.match]?.away ?? '';

      matchBox.innerHTML = `
        <div class="match-number">Partido ${m.match}</div>
        <div class="team-input-row">
          <span class="team-name-bracket">${t1Name}</span>
          <input 
            type="number" 
            class="match-score-input" 
            min="0" 
            placeholder="0" 
            value="${currentHomeScore}"
            oninput="handleKnockoutScoreChange(${m.match}, 'home', this.value)"
          >
        </div>
        <div class="team-input-row">
          <span class="team-name-bracket">${t2Name}</span>
          <input 
            type="number" 
            class="match-score-input" 
            min="0" 
            placeholder="0" 
            value="${currentAwayScore}"
            oninput="handleKnockoutScoreChange(${m.match}, 'away', this.value)"
          >
        </div>
      `;
      roundDiv.appendChild(matchBox);
    });
    container.appendChild(roundDiv);
  });
}

function handleKnockoutScoreChange(matchId, side, value) {
  if (!state.knockout.userScores) {
    state.knockout.userScores = {};
  }
  if (!state.knockout.userScores[matchId]) {
    state.knockout.userScores[matchId] = { home: null, away: null };
  }
  state.knockout.userScores[matchId][side] = value !== '' ? parseInt(value, 10) : null;
  userKnockout.userScores = state.knockout.userScores;
  saveLocalPredictionSoon();
}

function submitPrediction(playerName) {
  showLoading(true, "Sentando cátedra en el sistema...");

  // Identificamos dinámicamente si el usuario rellenó grupos o eliminatorias
  const tieneGrupos = Object.keys(userGroupMatches).length > 0;
  const tieneKnockouts = Object.keys(state.knockout.userScores).length > 0;
  const faseActiva = tieneKnockouts && !tieneGrupos ? 'FASE_ELIMINATORIA' : 'FASE_DE_GRUPOS';

  const payload = {
    user: playerName,
    fase: faseActiva,
    groupMatches: userGroupMatches,
    knockout: state.knockout.userScores
  };

  const formData = new FormData();
  // CAMBIA ESTOS IDs CON LOS DE TU GOOGLE FORM (RECUERDA ASIGNARLOS EN GOOGLE FORMS)
  formData.append("entry.496944209", playerName); 
  formData.append("entry.111222333", faseActiva);
  formData.append("entry.987654321", JSON.stringify(payload.groupMatches));
  formData.append("entry.444555666", JSON.stringify(payload.knockout));

  fetch(FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
  .then(() => {
    showLoading(false);
    document.getElementById('nameModal').style.display = 'none';
    localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
    showToast(`¡Pronóstico de ${faseActiva} enviado con éxito!`);
    triggerConfetti();
  })
  .catch(err => {
    showLoading(false);
    console.error(err);
    showToast("Error al enviar el pronóstico. Inténtalo de nuevo.", true);
  });
}

function saveLocalPredictionSoon() {
  const payload = {
    user: state.user,
    groupMatches: userGroupMatches,
    knockout: state.knockout.userScores
  };
  localStorage.setItem('worldCup2026_myPrediction', JSON.stringify(payload));
}

function restoreLocalPrediction() {
  const saved = localStorage.getItem('worldCup2026_myPrediction');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      userGroupMatches = parsed.groupMatches || {};
      state.knockout.userScores = parsed.knockout || {};
      userKnockout.userScores = state.knockout.userScores;
    } catch(e) {
      console.error(e);
    }
  }
}

function showLoading(show, text = 'Cargando...') {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  document.getElementById('loadingText').innerText = text;
  overlay.style.display = show ? 'flex' : 'none';
}

function showToast(msg, isError = false) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function triggerConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '🎉⚽🎉⚽🎉 ¡CÁTEDRA SENTADA! ⚽🎉⚽🎉⚽';
  setTimeout(() => container.innerHTML = '', 5000);
