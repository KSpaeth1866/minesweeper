const $ = window.$;

const getState = () => {
  return JSON.parse(localStorage.getItem('state'));
};

const saveState = (state) => {
  localStorage.setItem('state', JSON.stringify(state));
};

const genSq = (row, col) => {
  return `
    <div
      class="sq"
      id=sq${row}-${col}
    ></div>
  `;
};

const genNumSq = (row, col, num) => {
  const color = ['', 'blue', 'green', 'red', 'navy', 'maroon', 'teal', 'yellow', 'black'][num];
  return `
    <div
      class="sq revealedNotBomb ${color}"
      id=sq${row}-${col}
    >${num ? num : ""}</div>
  `;
};

const genFlaggedSq = (row, col) => {
  return `
    <img
      class="sq"
      src="./resources/flag.png"
      id=sq${row}-${col}
    ></img>
  `;
};

const genRevealedBomb = (row, col, didWin) => {
  const revealed = didWin ? "revealedBombWin" : "revealedBombLose";
  return `
    <img
      class="sq ${revealed}"
      src="./resources/mine.png"
      id=sq${row}-${col}
    ></img>
  `;
};

const genRow = (rowNum) => {
  return `
    <div class="row" id=row${rowNum}></div>
  `;
};

const genGameEndMessage = (didWin) => {
  return `
    <div id="gameEnd" class="message">${didWin ? "You won :)" : "You lost :("}</div>
  `;
};

const genEmptyMessage = (messageType) => {
  return `
    <div id=${messageType} class="message hide"></div>
  `;
};

const genNewBoard = (rows, cols, nBombs) => {
  const sqs = {};

  $('#boardAnchor').empty();
  for (let r = 0; r < rows; r++) {
    $('#boardAnchor').append(genRow(r));
    for (let c = 0; c < cols; c++) {
      const id = `${r}-${c}`;
      sqs[id] = {
        isBomb: false,
        isSelected: false,
        isFlagged: false,
      };
      $(`#row${r}`).append(genSq(r, c));
    }
  }

  const state = {
    rows,
    cols,
    nBombs,
    sqs,
    numFlagged: 0,
    isGameOver: false,
    areBombsSet: false,
    isGameStarted: false,
    startTime: null,
    timerId: null,
  };
  saveState(state);
};

// TODO: create existing board from state
// const genExistingBoard = () => {
// };

const setUpBombs = (id) => {
  const state = getState();
  const bombs = {};
  while (Object.keys(bombs).length < parseInt(state.nBombs)) {
    const row = Math.floor(Math.random() * parseInt(state.rows));
    const col = Math.floor(Math.random() * parseInt(state.cols));
    if (id !== `${row}-${col}`) bombs[`${row}-${col}`] = true;
  }

  for (const bId in bombs) {
    if (bombs.hasOwnProperty(bId)) {
      state.sqs[bId].isBomb = true;
    }
  }
  state.areBombsSet = true;
  saveState(state);
};

const toggleFlag = (id) => {
  const state = getState();
  const [r, c] = id.split('-').map((num) => parseInt(num));
  if (state.sqs[id].isSelected) return;

  if (state.sqs[id].isFlagged) $(`#sq${id}`).replaceWith(genSq(r, c));
  else $(`#sq${id}`).replaceWith(genFlaggedSq(r, c));
  state.sqs[id].isFlagged = !state.sqs[id].isFlagged;
  saveState(state);
};

const revealSq = (id) => {
  const state = getState();
  const stack = [id];
  const visited = {};
  visited[id] = true;

  while (stack.length > 0) {

    let countAdjBombs = 0;
    const curId = stack.pop();
    const [r, c] = curId.split('-').map((num) => parseInt(num));
    const nonBombNeighbors = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (
          r+i < 0 || r+i >= parseInt(state.rows) ||
          c+j < 0 || c+j >= parseInt(state.cols)
        ) continue;
        const neighborId = `${r+i}-${c+j}`;
        if (visited[neighborId]) continue;
        if (state.sqs[neighborId].isBomb) countAdjBombs++;
        else nonBombNeighbors.push(neighborId);
      }
    }

    $(`#sq${r}-${c}`).replaceWith(genNumSq(r, c, countAdjBombs));
    state.sqs[`${r}-${c}`].isSelected = true;

    if (countAdjBombs === 0) {
      nonBombNeighbors.forEach((n) => {
        stack.push(n);
        visited[n] = true;
      });
    }
  }

  let countSqsUncovered = 0;
  for (const sqId in state.sqs) {
    if (state.sqs.hasOwnProperty(id)) {
      if (state.sqs[sqId].isSelected) countSqsUncovered++;
    }
  }

  saveState(state);
  if (countSqsUncovered + parseInt(state.nBombs) === parseInt(state.rows*state.cols)) endGame(true);
};

const endGame = (didWin) => {
  const state = getState();
  state.isGameOver = true;
  clearInterval(state.timerId);
  displayGameEndMessage(didWin);
  revealBombs(didWin);
  saveState(state);
};

const displayGameEndMessage = (didWin) => {
  $('#gameEnd').replaceWith(genGameEndMessage(didWin));
};

const clearMessages = () => {
  $('#gameEnd').replaceWith(genEmptyMessage('gameEnd'));
};

const revealBombs = (didWin) => {
  const state = getState();
  for (let r = 0; r < parseInt(state.rows); r++) {
    for (let c = 0; c < parseInt(state.cols); c++) {
      if (state.sqs[`${r}-${c}`].isBomb) {
        $(`#sq${r}-${c}`).replaceWith(genRevealedBomb(r, c, didWin));
      }
    }
  }
};

const startGameTimer = () => {
  console.log('starting game timer');
  const state = getState();
  const startTime = new Date().getTime();
  const timerId = setInterval(setTimer, 1000);
  state.startTime = startTime;
  state.timerId = timerId;
  state.isGameStarted = true;
  saveState(state);
};

const setTimer = () => {
  const state = getState();
  const timeElapsed = Math.round((new Date().getTime() - state.startTime)/1000);
  console.log('setting time', timeElapsed);
};

const clearTimer = (timerId) => {
  if (!timerId) {
    const state = getState();
    clearInterval(state.timerId);
  }
  else clearInterval(timerId);
};

$(document).ready(() => {

  // localStorage.clear();
  let state = getState();
  if (state) genNewBoard(parseInt(state.rows), parseInt(state.cols), parseInt(state.nBombs));

  let hoverSqId = null;

  $('#newGameButton').click((e) => {
    e.preventDefault();
    const rows = $('#rowsInput').val() ? $('#rowsInput').val() : 10;
    const cols = $('#colsInput').val() ? $('#colsInput').val() : 10;
    const nBombs = $('#bombsInput').val() ? $('#bombsInput').val() : 20;
    clearMessages();
    clearTimer();
    genNewBoard(rows, cols, nBombs);
  });

  $('#boardAnchor').delegate('.sq', 'click', (e) => {
    e.preventDefault();
    state = getState();
    const id = e.target.id.slice(2);
    if (!state.areBombsSet) setUpBombs(id);
    if (!state.isGameStarted) startGameTimer();
    if (state.isGameOver) return;
    else if (state.sqs[id].isSelected) return;
    else if (state.sqs[id].isFlagged) return;
    else if (state.sqs[id].isBomb) endGame(false);
    else revealSq(id);
  });

  $('#boardAnchor').delegate('.sq', 'mouseenter', (e) => {
    e.preventDefault();
    hoverSqId = e.target.id.slice(2);
  });

  $('#boardAnchor').delegate('.sq', 'mouseleave', (e) => {
    e.preventDefault();
    hoverSqId = null;
  });

  $('body').on('keydown', (e) => {
    if (e.keyCode !== 32 || !hoverSqId) return;
    e.preventDefault();
    toggleFlag(hoverSqId);
  });

});
