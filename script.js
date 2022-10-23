
const singleSize = 32;

const width = 20;
const height = 12;

const boardCanvasWidth = width * singleSize;
const boardCanvasHeight = height * singleSize;

let pieceImage = new Image();
let boardArray = new Array();
let highlightedArray = new Array();
let undos = new Array();
let score = 0;
let situation = 0; // 0: Playable, 1: No Move, 2: Perfect
let finding = false;

let lastMoveX = -1;
let lastMoveY = -1;

onload = function() {
    init();
    loadImage();
    newGame();

    let boardCanvas = document.getElementById("board");
    boardCanvas.addEventListener('mousedown', function(event) {
        boardCanvasMouseDown(event);
        event.preventDefault();
    });
    boardCanvas.addEventListener('mousemove', function(event) {
        boardCanvasMouseMove(event);
    });
    boardCanvas.addEventListener('mouseout', function(event) {
        boardCanvasMouseOut(event);
    });

    document.getElementById('new').addEventListener('click', function(event){
        newGame(event.altKey);
    });

    document.getElementById('undo').addEventListener('click', function(event){
        undo();
    });

    document.getElementById('retry').addEventListener('click', function(event){
        retry();
    });

    document.getElementById('find').addEventListener('click', function(event){
        if (finding) {
            unfind();
        } else {
            findAll();
        }
    });
};

function hightlightIfAbleToVanish(x, y) {
    if (boardArray[x][y] == 0) {
        return false;
    }
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return false;
    }
    if (highlightedArray[x][y] == 1) {
        return false;
    }

    if (x > 0 && boardArray[x][y] == boardArray[x - 1][y]) {
        highlightedArray[x][y] = 1;
        hightlightIfAbleToVanish(x - 1, y);
    }
    if (x < width - 1 && boardArray[x][y] == boardArray[x + 1][y]) {
        highlightedArray[x][y] = 1;
        hightlightIfAbleToVanish(x + 1, y);
    }
    if (y > 0 && boardArray[x][y] == boardArray[x][y - 1]) {
        highlightedArray[x][y] = 1;
        hightlightIfAbleToVanish(x, y - 1);
    }
    if (y < height - 1 && boardArray[x][y] == boardArray[x][y + 1]) {
        highlightedArray[x][y] = 1;
        hightlightIfAbleToVanish(x, y + 1);
    }
}

function boardCanvasMouseMove(event) {
    if (finding) {
        return;
    }
    let x = Math.floor(event.offsetX / singleSize);
    let y = Math.floor(event.offsetY / singleSize);
    if (x == lastMoveX && y == lastMoveY) {
        return;
    }
    resetHighlight();
    hightlightIfAbleToVanish(x, y);
    drawCanvas();
    lastMoveX = x;
    lastMoveY = y;
}

function boardCanvasMouseOut(event) {
    if (finding) {
        return;
    }
    lastMoveX = -1;
    lastMoveY = -1;
    resetHighlight();
    drawCanvas();
}

function resetHighlight() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            highlightedArray[x][y] = 0;
        }
    }
}

function findAll() {
    finding = true;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (ableToVanish(x, y)) {
                highlightedArray[x][y] = 1;
            } else {
                highlightedArray[x][y] = 0;
            }
        }
    }
    drawCanvas();
}

function unfind() {
    finding = false;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            highlightedArray[x][y] = 0;
        }
    }
    drawCanvas();
}

function init() {
    boardArray = new Array(width);
    highlightedArray = new Array(width);
    for (let i = 0; i < width; i++) {
        boardArray[i] = new Array(height);
        highlightedArray[i] = new Array(height);
    }
    undos = new Array();
    score = 0;
    finding = false;
}

function newGame(magic) {
    finding = false;
    if (magic) {
        tidy();
    } else {
        randomize();
    }
    drawCanvas();
    updateCountLabels();
}

function undo() {
    let lastUndo = undos.pop();
    if (lastUndo != undefined) {
        unfind();
        boardArray = JSON.parse(lastUndo.boardArrayJSON);
        score = lastUndo.score;
        situation = 0;
        drawCanvas();
        updateCountLabels();
    }
}

function retry() {
    if (undos.length >= 1) {
        unfind();
        situation = 0;
        boardArray = JSON.parse(undos[0].boardArrayJSON);
        score = undos[0].score;
        undos = new Array();
        drawCanvas();
        updateCountLabels();
    }
}

function updateCountLabels() {
    let counts = [0, 0, 0, 0, 0, 0];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            counts[boardArray[x][y]]++;
        }
    }

    for (let i = 1; i <= 5; i++) {
        let countLabelName = "count_" + i;
        let countLabel = document.getElementById(countLabelName);
        countLabel.innerText = "" + counts[i];
    }

    document.getElementById("score").innerText = score;
}

function loadImage() {
    pieceImage = new Image();
    pieceImage.src = ("./macigame.png");
    pieceImage.onload = function() {
        drawCanvas();
    };
    pieceImage.onerror = function() {
        drawCanvas();
    };
}

function tidy() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            boardArray[x][y] = (x % 5) + 1;
            highlightedArray[x][y] = 0;
        }
    }
    undos = new Array();
    situation = 0;
    score = 0;
}

function randomize() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            boardArray[x][y] = Math.floor(Math.random() * 5) + 1;
            highlightedArray[x][y] = 0;
        }
    }
    undos = new Array();
    situation = 0;
    score = 0;
}

function drawCanvas() {
    for (let i = 1; i <= 5; i++) {
        let pieceCanvas = document.getElementById('piece_' + i);
        let pieceContext = pieceCanvas.getContext('2d');
        pieceContext.drawImage(pieceImage, (i - 1) * singleSize, 0, singleSize, singleSize, 0, 0, 22, 22); 
    }

    var boardCanvas = document.getElementById('board');
    var boardContext = boardCanvas.getContext('2d');
    boardContext.clearRect(0, 0, boardCanvasWidth, boardCanvasHeight);

    boardContext.fillStyle = "white";
    boardContext.fillRect(0, 0, boardCanvasWidth, boardCanvasHeight);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let highlight = highlightedArray[x][y];
            switch (boardArray[x][y]) {
                case 1:
                    boardContext.drawImage(pieceImage, 0 * singleSize, highlight * singleSize, singleSize, singleSize,
                        x * singleSize, y * singleSize, singleSize, singleSize);
                    break;
                case 2:
                    boardContext.drawImage(pieceImage, 1 * singleSize, highlight * singleSize, singleSize, singleSize,
                        x * singleSize, y * singleSize, singleSize, singleSize);
                    break;
                case 3:
                    boardContext.drawImage(pieceImage, 2 * singleSize, highlight * singleSize, singleSize, singleSize,
                        x * singleSize, y * singleSize, singleSize, singleSize);
                    break;
                case 4:
                    boardContext.drawImage(pieceImage, 3 * singleSize, highlight * singleSize, singleSize, singleSize,
                        x * singleSize, y * singleSize, singleSize, singleSize);
                    break;
                case 5:
                    boardContext.drawImage(pieceImage, 4 * singleSize, highlight * singleSize, singleSize, singleSize,
                        x * singleSize, y * singleSize, singleSize, singleSize);
                    break;
                default:
                    break;
            }
        }
    }

    if (situation == 1) { // No Move
        boardContext.font = "36px sans-serif";
        boardContext.strokeStyle = "black";
        boardContext.fillStyle = "black";
        boardContext.textAlign = "center";
        boardContext.fillText("No Move", boardCanvasWidth / 2, boardCanvasHeight * 1 / 4);
    }
    if (situation == 2) { // Prefect
        boardContext.font = "36px sans-serif";
        boardContext.strokeStyle = "black";
        boardContext.fillStyle = "black";
        boardContext.textAlign = "center";
        boardContext.fillText("Perfect!", boardCanvasWidth / 2, boardCanvasHeight * 1 / 4);
    }
}

function boardCanvasMouseDown(event) {
    let x = Math.floor(event.offsetX / singleSize);
    let y = Math.floor(event.offsetY / singleSize);
    if (ableToVanish(x, y)) {
        undos.push({boardArrayJSON: JSON.stringify(boardArray), score: score});
        let addedScore = vanish(x, y, boardArray[x][y]);
        score += addedScore;
        grave();
        lastMoveX = -1;
        lastMoveY = -1;
        situation = checkSituation();
        if (situation == 2) {
            score += 1000;
        }
        updateCountLabels();
    }
    unfind();
    drawCanvas();
}

function ableToVanish(x, y) {
    if (boardArray[x][y] == 0) {
        return false;
    }

    if (x > 0 && boardArray[x][y] == boardArray[x - 1][y]) {
        return true;
    }
    if (y > 0 && boardArray[x][y] == boardArray[x][y - 1]) {
        return true;
    }
    if (x < width - 1 && boardArray[x][y] == boardArray[x + 1][y]) {
        return true;
    }
    if (y < height - 1 && boardArray[x][y] == boardArray[x][y + 1]) {
        return true;
    }
    return false;
}

function countRemains() {
    let remains = 0;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (boardArray[x][y] != 0) {
                remains++;
            }
        }
    }
    return remains;
}

function vanish(x, y, color) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return;
    }
    if (boardArray[x][y] != color) {
        return;
    }
    let remainsBefore = countRemains();
    boardArray[x][y] = 0;
    vanish(x - 1, y, color);
    vanish(x + 1, y, color);
    vanish(x, y - 1, color);
    vanish(x, y + 1, color);
    let remainsAfter = countRemains();
    return (remainsBefore - remainsAfter - 2) * (remainsBefore - remainsAfter - 2);
}

function grave() {
    for (x = 0; x < width; x++) {
        for (y = height - 1; y > 0; y--) {
            if (boardArray[x][y] == 0 && boardArray[x][y - 1] != 0) {
                boardArray[x][y] = boardArray[x][y - 1];
                boardArray[x][y - 1] = 0;

                y = height;
            }
        }
    }

    for (x = 0; x < width - 1; x++) {
        let rowIsBlank = true;
        for (y = 0; y < height; y++) {
            if (boardArray[x][y] != 0) {
                rowIsBlank = false;
                break;
            }
        }
        let nextRowIsBlank = true;
        for (y = 0; y < height; y++) {
            if (boardArray[x + 1][y] != 0) {
                nextRowIsBlank = false;
                break;
            }
        }
        if (rowIsBlank && !nextRowIsBlank) {
            for (y = 0; y < height; y++) {
                boardArray[x][y] = boardArray[x + 1][y];
                boardArray[x + 1][y] = 0;
            }
            x = -1;
        }
    }
}

function checkSituation() {
    let remains = 0;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (boardArray[x][y] == 0) {
                continue;
            }
            remains++;
            if (x > 0 && boardArray[x][y] == boardArray[x - 1][y]) {
                return 0;
            }
            if (x < width - 1 && boardArray[x][y] == boardArray[x + 1][y]) {
                return 0;
            }
            if (y > 0 && boardArray[x][y] == boardArray[x][y - 1]) {
                return 0;
            }
            if (y < height - 1 && boardArray[x][y] == boardArray[x][y + 1]) {
                return 0;
            }
        }
    }
    if (remains == 0) {
        return 2; // Perfect
    } else {
        return 1; // No Move
    }
}
