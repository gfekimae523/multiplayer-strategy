

const ws = new WebSocket('ws://localhost:8080');

let mainCanvas;
let ctx;

let gameState;



ws.onmessage = (event) => {
    gameState = event.data;
};



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(150, 255, 150)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let squads = gameState.squads;
    squads.forEach((squad) => {
        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.fillRect(squad.pos.x - 5, squad.pos.y - 5, 10, 10);
    });

}

function mainloop() {
    draw();
}

function init() {
    mainCanvas = document.querySelector('.mainCanvas');
    ctx = mainCanvas.getContext('2d');

    gameState = {
        time: null,
        squads: []
    };

    setInterval(mainloop, 1000);
}

document.addEventListener('DOMContentLoaded', init);