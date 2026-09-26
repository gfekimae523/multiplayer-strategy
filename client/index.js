
const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const ws = new WebSocket('ws://localhost:8080');

let mainCanvas;
let ctx;

let gameState;



ws.onmessage = (event) => {
    gameState = JSON.parse(event.data);
};





function draw() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    ctx.fillStyle = 'rgb(210, 255, 150)';
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    if (!gameState) {
        return;
    }

    gameState.squads.forEach((squad) => {
        if (squad.id === gameState.playerId) {
            ctx.fillStyle = 'rgb(0, 200, 0)';
        } else if (squad.faction === FACTION.PLAYER) {
            ctx.fillStyle = 'rgb(0, 0, 200)';
        } else if (squad.faction === FACTION.ENEMY) {
            ctx.fillStyle = 'rgb(200, 0, 0)';
        }
        ctx.fillRect(
            squad.pos.x - 5,
            squad.pos.y - 5,
            10,
            10
        );
    });

}

function bindEvents() {
    mainCanvas.addEventListener('click', (event) => {
        const rect = mainCanvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) * mainCanvas.width / rect.width;
        const y = (event.clientY - rect.top) * mainCanvas.height / rect.height;

        ws.send(JSON.stringify({
            type: 'move',
            targetPos: {
                x: x,
                y: y
            }
        }));
    });
}

function mainloop() {
    draw();
    requestAnimationFrame(mainloop);
}

function init() {
    mainCanvas = document.querySelector('.mainCanvas');
    ctx = mainCanvas.getContext('2d');

    gameState = {
        time: null,
        squads: []
    };

    bindEvents();

    requestAnimationFrame(mainloop);
}

document.addEventListener('DOMContentLoaded', init);