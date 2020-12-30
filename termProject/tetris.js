const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
class Swipe {
    constructor(element) {
        this.xDown = null;
        this.yDown = null;
        this.element = typeof (element) === 'string' ? document.querySelector(element) : element;

        this.element.addEventListener('touchstart', function (evt) {
            this.xDown = evt.touches[0].clientX;
            this.yDown = evt.touches[0].clientY;
        }.bind(this), false);

    }

    onLeft(callback) {
        this.onLeft = callback;

        return this;
    }

    onRight(callback) {
        this.onRight = callback;

        return this;
    }

    onUp(callback) {
        this.onUp = callback;

        return this;
    }

    onDown(callback) {
        this.onDown = callback;

        return this;
    }

    handleTouchMove(evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        this.xDiff = this.xDown - xUp;
        this.yDiff = this.yDown - yUp;

        if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // Most significant.
            if (this.xDiff > 0) {
                this.onLeft();
            } else {
                this.onRight();
            }
        } else {
            if (this.yDiff > 0) {
                this.onUp();
            } else {
                this.onDown();
            }
        }

        // Reset values.
        this.xDown = null;
        this.yDown = null;
    }

    run() {
        this.element.addEventListener('touchmove', function (evt) {
            this.handleTouchMove(evt);
        }.bind(this), false);
    }
}

context.scale(20, 20);

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}
function createTetrosoid(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}
function collide(arena, player) {
    const m = player.tetrosoid;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.tetrosoid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function tetrisoidRotate(dir) {
    let offset = 1;
    rotateMatrix(player.tetrosoid, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.tetrosoid[0].length) {
            rotateMatrix(player.tetrosoid, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
function playerReset() {
    const pieces = 'TJLOSZI';
    player.tetrosoid = createTetrosoid(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.tetrosoid[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over \nYour score : " + player.score);
        player.score = 0;
        scoreUpdate();
    }
}
function rotateMatrix(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDown() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0;
        playerReset();
        arenaSweep();
        scoreUpdate();
    }
    dropCounter = 0;
}
function playerRightLeft(direction) {
    player.pos.x += direction;
    if (collide(arena, player)) {
        player.pos.x -= direction;
    }
}


function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawTetrisBlock(arena, { x: 0, y: 0 });
    drawTetrisBlock(player.tetrosoid, player.pos);
}

function drawTetrisBlock(block, offset) {
    block.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value != 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

let dropCounter = 0;
let dropTime = 1000; //msec its equally nearly 1 sec
let lastTime = 0;

function update(time = 0) {
    const differenceTime = time - lastTime;
    lastTime = time;
    dropCounter += differenceTime;
    if (dropCounter > dropTime) {
        playerDown();
    }
    draw();
    requestAnimationFrame(update);
}

function scoreUpdate() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowRight':
            playerRightLeft(+1);
            break;
        case 'ArrowLeft':
            playerRightLeft(-1);
            break;
        case 'ArrowDown':
            playerDown();
            break;
        case 'ArrowUp':
            tetrisoidRotate();
            break;
        default:
            break;
    }
}
);
const colors = [
    null,
    'red',
    'orange',
    'blue',
    'green',
    'brown',
    'violet',
    'purple',
];

const player = {
    pos: { x: 5, y: 5 },
    tetrosoid: null,
    score: 0,
}
var swiper = new Swipe(document.getElementById('tetris'));
swiper.onLeft(function () {
    playerRightLeft(-1);
});
swiper.onRight(function () {
    playerRightLeft(+1);
});
swiper.onDown(function () { playerDown(); });
swiper.onUp(function () { tetrisoidRotate(); });
swiper.run();
const arena = createMatrix(12, 20);

playerReset()
scoreUpdate();
update();
