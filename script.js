let boardData = [];
let activeCellId = '0_0'; // Inicio en la primera casilla (Fila 1, Columna 1)
let previousCellId = null; 
let completedCells = new Set();
let visitedPaths = [];

// Constantes del tablero de 5x5 (Índices de 0 a 4)
const START_ID = '0_0';     // Fila 1, Columna 1
const TREASURE_ID = '4_4';  // Fila 5, Columna 5 (Última casilla)

// Lista de mensajes contextuales/divertidos asignados a las casillas
const MENSAJES_CASILLAS = [
  "📜 La capibara perezosa se despierta y navega en su barco pirata.",
  "🍫 Cruzamos el mar de chocolate, todos quieren lanzarse, pero ¿quien manejara el barco?.",
  "🦨 Pasamos por la isla de las mofetas. Una mofeta se une a la tripulacion.",
  "🏝️ Preguntaron a las medusas donde queda la isla del pangolin, pero se dieron cuenta que las medusas no tienen cerebro.",
  "🐔 Llegamos a una jungla a buscar un loro como mascota, pero nadie quiso, solo un pollo que no puede volar.",
  "🧭 Llegamos a la isla de las marmotas. Una marmota se une a la tripulacion.",
  "🦈 Pasamos por un grupo de tiburones, le lanzamos bananas y los tiburones se echan a reir.",
  "🥥 Llegamos a otra jungla y nos encontramos con leones. Vaya suerte que los leones eran vegetarianos.",
  "🥥 Pasamos a un lado del mar de chicle, sino nos quedamos pegados.",
  "🗺️ La isla del pangolin donde el pangolin nos da consejos de como llegar al punto final.",
  "⛵ Llegamos a la isla de algodon, donde los arboles son algodon de azucar... a comer.",
  "🎂 Pasamos por el estrecho de pastelandia, y llevamos trozos de pastel de ambos lados.",
  "🍦 Llegamos a un lugar frio, donde hay tempanos de helados con chocochip.",
  "🐹 Llegamos a la isla de los hamsters. Un hamster se une a la tripulacion.",
  "🍬 Despierta capibara, que viene una tormenta. Lluvia de caramelos, aprovecha la oportunidad.",
  "🧀 Pasamos por la costa de queso, aun no descubierta por el capitan raton.",
  "🛡️ Pasamos por las olas de soda, lo llaman gaseosa tambien?.",
  "🌅 Pasamos por la isla de los castores. Un castor nos ayuda a reparar la nave.",
  "🐟 Peces voladores saltan cerca de la nave y uno lo tumba al capitan Capibara.",
  "🪙 Encontramos un grupo de tortugas, que nos indican ir en direccion del viento",
  "🌿 La capibara se frustra al no ver las estrellas para seguir la ruta. Pero alguien le dijo que aun es de dia.",
  "🍪 Llegamos a galletalandia a coger muchas galletas para el camino.",
  "🍟 La lluvia de papas fritas nos indica que el tesoro esta cerca.",
  "⛺ La capibara grita Tierra!! y le dijeron en donde? y la capibara responde que habia tierra en su ojo."
];

// --- FUNCIONES PARA EL MODAL / POPUP ---
function showModal(title, message) {
  const titleEl = document.getElementById('modal-title');
  const messageEl = document.getElementById('modal-message');
  const modalEl = document.getElementById('popup-modal');
  
  if (titleEl && messageEl && modalEl) {
    titleEl.textContent = title;
    messageEl.textContent = message;
    modalEl.classList.add('show');
  }
}

function closeModal() {
  const modalEl = document.getElementById('popup-modal');
  if (modalEl) {
    modalEl.classList.remove('show');
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition() {
  const num1 = getRandomInt(10, 50);
  const num2 = getRandomInt(10, 49);
  return {
    text: `${num1}+${num2}`,
    ans: num1 + num2
  };
}

// Obtiene los vecinos adyacentes permitidos
function getNeighbors(row, col) {
  const neighbors = [];
  const directions = [
    { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }, // Ortogonales
    { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 } // Diagonales
  ];

  directions.forEach(dir => {
    const nr = row + dir.r;
    const nc = col + dir.c;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      const id = `${nr}_${nc}`;
      // Excluye la celda previa y cualquier celda ya completada
      if (id !== previousCellId && !completedCells.has(id)) {
        neighbors.push({ id, row: nr, col: nc });
      }
    }
  });

  return neighbors;
}

function generateBoardData() {
  boardData = [];
  
  // Clonamos y mezclamos los mensajes para que cambien en cada partida
  let mensajesDisponibles = [...MENSAJES_CASILLAS];
  mensajesDisponibles.sort(() => Math.random() - 0.5);

  let msgIndex = 0;

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const id = `${r}_${c}`;
      
      if (id === TREASURE_ID) {
        boardData.push({ 
          id, 
          row: r, 
          col: c, 
          isTreasure: true,
          mensaje: "¡Felicidades, Capitán! Has guiado a la tripulación hasta el tesoro oculto."
        });
      } else {
        const addition = generateAddition();
        const esStart = (id === START_ID);
        
        boardData.push({
          id,
          row: r,
          col: c,
          text: addition.text,
          ans: addition.ans,
          isStart: esStart,
          // Asigna un mensaje único a esta casilla
          mensaje: esStart 
            ? "¡El galeón levanta anclas e inicia la gran aventura pirata!" 
            : mensajesDisponibles[msgIndex++]
        });
      }
    }
  }
}

function initGame() {
  generateBoardData();
  activeCellId = START_ID;
  previousCellId = null;
  completedCells.clear();
  visitedPaths = [];

  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  boardData.forEach(cell => {
    const div = document.createElement('div');
    div.id = `cell-${cell.id}`;
    div.className = 'cell';
    
    if (cell.isStart) {
      div.classList.add('start-cell');
      div.innerHTML = `
        <div class="ship-badge">⛵🏴‍☠️</div>
        <span class="label">START</span>
        <span>${cell.text}</span>
      `;
    } else if (cell.isTreasure) {
      div.classList.add('treasure-cell');
      div.innerHTML = `
        <div class="treasure-badge">👑💎</div>
        <span class="treasure-img">🏴‍☠️💰</span>
      `;
    } else {
      div.textContent = cell.text;
    }

    boardEl.appendChild(div);
  });

  document.getElementById('status').textContent = '¡Empieza en la casilla START con el Galeón Pirata!';
  document.getElementById('status').style.color = '#f8fafc';
  
  setTimeout(updateBoardState, 50);
}

function updateBoardState() {
  boardData.forEach(cell => {
    const el = document.getElementById(`cell-${cell.id}`);
    if (!el) return;

    el.classList.remove('active', 'completed');

    if (completedCells.has(cell.id)) {
      el.classList.add('completed');
    } else if (cell.id === activeCellId) {
      el.classList.add('active');
    }
  });

  drawSVGPaths();
  renderPaths();
}

function drawSVGPaths() {
  const svg = document.getElementById('svg-paths');
  svg.innerHTML = '';
  const containerRect = document.getElementById('game-container').getBoundingClientRect();

  // Historial de caminos recorridos
  visitedPaths.forEach(path => {
    const lineOuter = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineOuter.setAttribute('x1', path.x1);
    lineOuter.setAttribute('y1', path.y1);
    lineOuter.setAttribute('x2', path.x2);
    lineOuter.setAttribute('y2', path.y2);
    lineOuter.setAttribute('class', 'path-line path-visited-outer');

    const lineInner = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineInner.setAttribute('x1', path.x1);
    lineInner.setAttribute('y1', path.y1);
    lineInner.setAttribute('x2', path.x2);
    lineInner.setAttribute('y2', path.y2);
    lineInner.setAttribute('class', 'path-line-inner path-visited-inner');

    svg.appendChild(lineOuter);
    svg.appendChild(lineInner);
  });

  // Caminos disponibles desde la celda activa
  const currentCell = boardData.find(c => c.id === activeCellId);
  if (!currentCell || currentCell.isTreasure) return;

  const [r, c] = activeCellId.split('_').map(Number);
  const validNeighbors = getNeighbors(r, c);
  const fromEl = document.getElementById(`cell-${activeCellId}`);
  if (!fromEl) return;

  const fromRect = fromEl.getBoundingClientRect();
  const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;

  validNeighbors.forEach(n => {
    const toEl = document.getElementById(`cell-${n.id}`);
    if (!toEl) return;

    const toRect = toEl.getBoundingClientRect();
    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
    const y2 = toRect.top + toRect.height / 2 - containerRect.top;

    const lineOuter = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineOuter.setAttribute('x1', x1);
    lineOuter.setAttribute('y1', y1);
    lineOuter.setAttribute('x2', x2);
    lineOuter.setAttribute('y2', y2);
    lineOuter.setAttribute('class', 'path-line');

    const lineInner = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineInner.setAttribute('x1', x1);
    lineInner.setAttribute('y1', y1);
    lineInner.setAttribute('x2', x2);
    lineInner.setAttribute('y2', y2);
    lineInner.setAttribute('class', 'path-line-inner');

    svg.appendChild(lineOuter);
    svg.appendChild(lineInner);
  });
}

function renderPaths() {
  const pathsLayer = document.getElementById('paths-layer');
  pathsLayer.innerHTML = '';

  const currentCell = boardData.find(c => c.id === activeCellId);
  if (!currentCell || currentCell.isTreasure) return;

  const [r, c] = activeCellId.split('_').map(Number);
  const validNeighbors = getNeighbors(r, c);
  if (validNeighbors.length === 0) return;

  // Si el tesoro está entre los vecinos disponibles, se asegura de que haya un camino hacia él
  let correctNeighborIndex = validNeighbors.findIndex(n => n.id === TREASURE_ID);
  if (correctNeighborIndex === -1) {
    correctNeighborIndex = getRandomInt(0, validNeighbors.length - 1);
  }

  const fromEl = document.getElementById(`cell-${activeCellId}`);
  if (!fromEl) return;
  const fromRect = fromEl.getBoundingClientRect();
  const containerRect = document.getElementById('game-container').getBoundingClientRect();
  const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;

  validNeighbors.forEach((n, index) => {
    const toEl = document.getElementById(`cell-${n.id}`);
    if (!toEl) return;

    const isCorrectPath = (index === correctNeighborIndex);
    let pathValue;

    if (isCorrectPath) {
      pathValue = currentCell.ans;
    } else {
      let offset = getRandomInt(1, 8) * (Math.random() < 0.5 ? 1 : -1);
      pathValue = Math.max(10, currentCell.ans + offset);
      if (pathValue === currentCell.ans) pathValue += 2;
    }

    const toRect = toEl.getBoundingClientRect();
    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
    const y2 = toRect.top + toRect.height / 2 - containerRect.top;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const btn = document.createElement('button');
    btn.className = 'path-btn';
    btn.textContent = pathValue;
    btn.style.left = `${midX}px`;
    btn.style.top = `${midY}px`;

    btn.onclick = () => handlePathClick(n.id, pathValue, currentCell, btn);

    pathsLayer.appendChild(btn);
  });
}

function handlePathClick(targetCellId, value, currentCell, btnEl) {
  if (value === currentCell.ans) {
    btnEl.classList.add('correct');
    completedCells.add(currentCell.id);

    const containerRect = document.getElementById('game-container').getBoundingClientRect();
    const fromEl = document.getElementById(`cell-${currentCell.id}`);
    const toEl = document.getElementById(`cell-${targetCellId}`);
    
    if (fromEl && toEl) {
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      visitedPaths.push({
        x1: fromRect.left + fromRect.width / 2 - containerRect.left,
        y1: fromRect.top + fromRect.height / 2 - containerRect.top,
        x2: toRect.left + toRect.width / 2 - containerRect.left,
        y2: toRect.top + toRect.height / 2 - containerRect.top
      });
    }

    const statusEl = document.getElementById('status');
    statusEl.textContent = `¡Correcto! ${currentCell.text} = ${currentCell.ans}. ¡Avanzas!`;
    statusEl.style.color = '#4ade80';

    setTimeout(() => {
      previousCellId = activeCellId;
      activeCellId = targetCellId;

      const nextCell = boardData.find(c => c.id === activeCellId);

      if (nextCell) {
        if (nextCell.isTreasure) {
          statusEl.textContent = "🏆 ¡FELICIDADES! ¡Has guiado al galeón hasta el tesoro pirata! 🎉";
          statusEl.style.color = "#fbbf24";
          document.getElementById(`cell-${activeCellId}`).classList.add('completed');
          
          showModal("🎉 ¡TESORO ENCONTRADO! 💎", nextCell.mensaje);
        } else {
          // Muestra el popup con el mensaje exclusivo de esta celda
          showModal(`⚓ Isla/Casilla (${nextCell.row + 1}, ${nextCell.col + 1})`, nextCell.mensaje);
        }
      }

      updateBoardState();
    }, 500);

  } else {
    btnEl.classList.add('wrong');
    const statusEl = document.getElementById('status');
    statusEl.textContent = `Inténtalo de nuevo. ${currentCell.text} NO es ${value}.`;
    statusEl.style.color = '#f87171';
  }
}

function resetGame() {
  initGame();
}

window.addEventListener('resize', () => {
  drawSVGPaths();
  renderPaths();
});

window.onload = initGame;
