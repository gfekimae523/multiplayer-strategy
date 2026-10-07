
const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${location.host}`);

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
        if (squad.playerId === gameState.playerId) {
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

    gameState.attacks.forEach((attack) => {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.beginPath();
        ctx.arc(attack.pos.x, attack.pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
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
        squads: [], 
        attacks: []
    };

    bindEvents();

    requestAnimationFrame(mainloop);
}

document.addEventListener('DOMContentLoaded', init);