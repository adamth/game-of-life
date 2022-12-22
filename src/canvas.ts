const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
let width: number;
let height: number;
let rows: number;
let cols: number;
const cellSize = 10;
const offset = 80;

const state: { board: Array<0 | 1>; generation: number; isRunning: boolean; isMouseDown: boolean } = {
  board: [],
  generation: 0,
  isRunning: false,
  isMouseDown: false,
};

export const setup = () => {
  resize();
  canvas.id = 'gameOfLife';
  canvas.style.border = '1px solid #727272';
  canvas.style.position = 'absolute';
  context!.font = '30px Arial';
  const body = document.getElementsByTagName('body')[0];
  body.appendChild(canvas);
  canvas.addEventListener('mousedown', () => (state.isMouseDown = true));
  canvas.addEventListener('mouseup', () => (state.isMouseDown = false));
  canvas.addEventListener('mousemove', handleCanvasDrag);
  rows = Math.floor((window.innerHeight * 2) / cellSize);
  cols = Math.floor((window.innerWidth - 2) / cellSize);
  const cells = rows * cols;

  state.board = Array(cells).fill(0, 0, cells);
};

const handleCanvasDrag = (e: MouseEvent) => {
  const coord = {
    x: Math.floor(e.clientX / cellSize) + 1,
    y: Math.floor((e.clientY - offset + cellSize / 2) / cellSize),
  };
  if (state.isMouseDown) {
    awakenCell(coord);
  }
};

const awakenCell = (coord: Coordinate) => {
  const index = getIndex(coord);
  state.board[index] = 1;
};

document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    state.isRunning = !state.isRunning;
  }
});

const resize = function () {
  width = window.innerWidth - 2;
  height = window.innerHeight - 2;
  canvas.width = width;
  canvas.height = height;
};
window.onresize = resize;

const update = (prevState: typeof state) => {
  state.generation = prevState.generation + 1;

  state.board = state.board.map((cell, index) => {
    return cell ? checkLive(index) : checkDead(index);
  });
};

const getLiveNeighbourCount = (index: number): number =>
  Object.values(getExtendedCoords(index))
    .filter(Boolean)
    .reduce((acc, coord) => {
      return acc + state.board[getIndex(coord!)];
    }, 0);

const checkLive = (index: number): 0 | 1 => {
  return [2, 3].includes(getLiveNeighbourCount(index)) ? 1 : 0;
};
const checkDead = (index: number): 0 | 1 => {
  return getLiveNeighbourCount(index) === 3 ? 1 : 0;
};

type Coordinate = { x: number; y: number };

const getIndex = (coord: Coordinate): number => {
  return coord.x + coord.y * cols;
};

const getCoords = (index: number): Coordinate => {
  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
};

const getExtendedCoords = (
  index: number
): {
  up: Coordinate | null;
  upL: Coordinate | null;
  upR: Coordinate | null;
  downL: Coordinate | null;
  downR: Coordinate | null;
  down: Coordinate | null;
  left: Coordinate | null;
  right: Coordinate | null;
} => {
  const { x, y } = getCoords(index);

  return {
    up: y > 0 ? { x, y: y - 1 } : null,
    upL: x > 0 && y > 0 ? { x: x - 1, y: y - 1 } : null,
    upR: x < cols && y > 0 ? { x: x + 1, y: y - 1 } : null,
    down: y < rows ? { x, y: y + 1 } : null,
    downR: x < cols && y < rows ? { x: x + 1, y: y + 1 } : null,
    downL: x > 0 && y < rows ? { x: x - 1, y: y + 1 } : null,
    left: x > 0 ? { x: x - 1, y } : null,
    right: x < cols ? { x: x + 1, y } : null,
  };
};

const draw = () => {
  context!.clearRect(0, 0, width, height);
  context!.fillText(`Generation: ${state.generation}`, 10, 50);

  state.board.forEach((cell, i) => {
    if (cell) {
      const { x, y } = getCoords(i);
      context!.fillStyle = '#000000';
      context!.fillRect(Math.floor(x - 1) * cellSize, Math.floor(y - 1) * cellSize + offset, cellSize, cellSize);
    }
  });
};

const loop = () => {
  if (state.isRunning) {
    update(state);
  }
  draw();

  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);
