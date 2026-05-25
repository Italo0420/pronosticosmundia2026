/* ============================================================
   2026 FIFA World Cup Prediction Game - results.js
   Base de datos oficial de Grupos, Equipos y Llaves de Eliminación
   ============================================================ */

const RESULTS = {
  // Configuración de los 12 grupos del Mundial (4 equipos por grupo)
  "groups": {
   "A": ["México", "Sudáfrica", "República Checa", "Corea del Sur"],
    "B": ["Suiza", "Canadá", "Qatar", "Bosnia y Herzegovina"],
    "C": ["Brasil", "Escocia", "Marruecos", "Haití"],
    "D": ["Turquía", "Paraguay", "EE.UU.", "Australia"],
    "E": ["Costa de Marfil", "Curazao", "Ecuador", "Alemania"],
    "F": ["Países Bajos", "Japón", "Suecia", "Túnez"],
    "G": ["Egipto", "Bélgica", "Nueva Zelanda", "Irán"],
    "H": ["Uruguay", "Cabo Verde", "España", "Arabia Saudita"],
    "I": ["Noruega", "Francia", "Irak", "Senegal"],
    "J": ["Jordania", "Argentina", "Argelia", "Austria"],
    "K": ["RD Congo", "Portugal", "Colombia", "Uzbekistán"],
    "L": ["Ghana", "Panamá", "Croacia", "Inglaterra"]
  },

  // Estructura de la Fase Eliminatoria (Knockouts)
  // Cuando empiece la Fase 2, tú editarás los nombres reales aquí
  "knockout": {
    "matches": {
      "round32": [
        { "match": 73, "team1": "canada", "team2": "Canada" },
        { "match": 74, "team1": "Ivory Coast", "team2": "Spain" },
        { "match": 75, "team1": "Netherlands", "team2": "Scotland" },
        { "match": 76, "team1": "Brazil", "team2": "Japan" },
        { "match": 77, "team1": "Norway", "team2": "New Zealand" },
        { "match": 78, "team1": "Curaçao", "team2": "France" },
        { "match": 79, "team1": "Mexico", "team2": "Sweden" },
        { "match": 80, "team1": "Ghana", "team2": "Algeria" },
        { "match": 81, "team1": "Turkey", "team2": "Colombia" },
        { "match": 82, "team1": "Egypt", "team2": "Morocco" },
        { "match": 83, "team1": "Portugal", "team2": "Panama" },
        { "match": 84, "team1": "Uruguay", "team2": "Argentina" },
        { "match": 85, "team1": "Switzerland", "team2": "Iraq" },
        { "match": 86, "team1": "Jordan", "team2": "Cape Verde" },
        { "match": 87, "team1": "DR Congo", "team2": "Ecuador" },
        { "match": 88, "team1": "Paraguay", "team2": "Belgium" }
      ],
      "round16": [
        { "match": 89, "team1": "Ganador 73", "team2": "Ganador 75" },
        { "match": 90, "team1": "Ganador 74", "team2": "Ganador 77" }
      ],
      "quarterfinals": [
        { "match": 97, "team1": "Ganador 89", "team2": "Ganador 90" }
      ],
      "semifinals": [
        { "match": 101, "team1": "Ganador 97", "team2": "Ganador 98" }
      ],
      "thirdPlace": [
        { "match": 103, "team1": "Perdedor 101", "team2": "Perdedor 102" }
      ],
      "final": [
        { "match": 104, "team1": "Ganador 101", "team2": "Ganador 102" }
      ]
    }
  }
};
