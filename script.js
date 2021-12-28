
const singleSize = 32;

const width = 20;
const height = 10;

const canvasWidth = width * singleSize;
const canvasHeight = height * singleSize;

let board = new Array();


onload = function() {
    init();
    randomize();
    drawCanvas();

    let canvas = document.getElementById("canvas");
    canvas.onmousedown = function(event) {
        canvasMouseDown(event);
    };

    document.getElementById('new').addEventListener('click', function(event){
        randomize();
        drawCanvas();
    });
};

function init() {
    board = new Array(width);
    for (let i = 0; i < width; i++) {
        board[i] = new Array(height);
    }
}

function randomize() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            board[x][y] = Math.floor(Math.random() * 5) + 1;
        }
    }
}

function drawCanvas() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            switch (board[x][y]) {
                case 1:
                    context.fillStyle = "red";
                    break;
                case 2:
                    context.fillStyle = "green";
                    break;
                case 3:
                    context.fillStyle = "blue";
                    break;
                case 4:
                    context.fillStyle = "orange";
                    break;
                case 5:
                    context.fillStyle = "purple";
                    break;
                default:
                    context.fillStyle = "white";
                    break;
            }
            context.fillRect(x * singleSize, y * singleSize, (x + 1) * singleSize, (y + 1) * singleSize);
        }
    }

}

function canvasMouseDown(event) {
    let x = Math.floor(event.offsetX / singleSize);
    let y = Math.floor(event.offsetY / singleSize);
    if (ableToVanish(x, y)) {
        vanish(x, y, board[x][y]);
        grave();
    }
    drawCanvas();
}

function ableToVanish(x, y) {
    if (board[x][y] == 0) {
        return false;
    }

    if (x > 0 && board[x][y] == board[x - 1][y]) {
        return true;
    }
    if (y > 0 && board[x][y] == board[x][y - 1]) {
        return true;
    }
    if (x < width - 1 && board[x][y] == board[x + 1][y]) {
        return true;
    }
    if (y < height - 1 && board[x][y] == board[x][y + 1]) {
        return true;
    }
    return false;
}

function vanish(x, y, color) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return;
    }
    if (board[x][y] != color) {
        return;
    }
    board[x][y] = 0;
    vanish(x - 1, y, color);
    vanish(x + 1, y, color);
    vanish(x, y - 1, color);
    vanish(x, y + 1, color);
}

function grave() {
    for (x = 0; x < width; x++) {
        for (y = height - 1; y > 0; y--) {
            if (board[x][y] == 0 && board[x][y - 1] != 0) {
                board[x][y] = board[x][y - 1];
                board[x][y - 1] = 0;

                y = height;
            }
        }
    }

    for (x = 0; x < width - 1; x++) {
        let rowIsBlank = true;
        for (y = 0; y < height; y++) {
            if (board[x][y] != 0) {
                rowIsBlank = false;
                break;
            }
        }
        let nextRowIsBlank = true;
        for (y = 0; y < height; y++) {
            if (board[x + 1][y] != 0) {
                nextRowIsBlank = false;
                break;
            }
        }
        if (rowIsBlank && !nextRowIsBlank) {
            for (y = 0; y < height; y++) {
                board[x][y] = board[x + 1][y];
                board[x + 1][y] = 0;
            }
            x = -1;
        }
    }
}