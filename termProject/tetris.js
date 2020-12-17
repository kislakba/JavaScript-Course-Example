const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);
context.fillStyle = '#000';
context.fillRect(0,0, canvas.width, canvas.height);

const tetrisBlock = [
    [0,0,0],
    [1,1,1],
    [0,1,0],
];

function drawTetrisBlock(block){
    block.forEach((row ,y) => {
        row.forEach((value, x) => {
            if(value != 0) {
                context.fillStyle = 'purple';
                context.fillRect(x,y,1,1);
            }
        });
    });
}
drawTetrisBlock(tetrisBlock);