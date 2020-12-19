const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const tetrisBlock = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];
const player = {
    pos: { x: 5, y: 5 },
    tetrosoid: tetrisBlock,
}
const arena = createMatrix(12, 20);
context.scale(20, 20);

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
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

function playerDown(){
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0;
    }
    dropCounter = 0;
}
function playerRightLeft(direction){
    player.pos.x += direction;
    if(collide(arena,player)){
        player.pos.x -= direction;
    }
}


function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawTetrisBlock(arena,{x:0, y:0});
    drawTetrisBlock(player.tetrosoid, player.pos);
}

function drawTetrisBlock(block, offset) {
    block.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value != 0) {
                context.fillStyle = 'purple';
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

document.addEventListener('keydown', event => {
    const keyName = event.key;
    if (keyName == 'ArrowRight') {
        playerRightLeft(+1);
    } else if (keyName == 'ArrowLeft') {
        playerRightLeft(-1);
    } else if (keyName == 'ArrowDown') {
        playerDown();
    }

}
)

update();