
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



function drawMySquadStatus() {
    if (!gameState) return;

    const squad = gameState.squads.find(
        squad => squad.playerId === gameState.playerId
    );

    if (!squad) return;

    const x = 20;
    let y = 30;

    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';

    squad.units.forEach((unit, index) => {
        // 名前
        ctx.fillText(
            `${unit.name} ${Math.ceil(unit.hp)} / ${unit.maxHp}`,
            x,
            y
        );

        // HPバー
        const barWidth = 150;
        const barHeight = 10;

        const hpRate = unit.hp / unit.maxHp;

        ctx.fillStyle = 'gray';
        ctx.fillRect(
            x,
            y + 5,
            barWidth,
            barHeight
        );

        ctx.fillStyle = 'green';
        ctx.fillRect(
            x,
            y + 5,
            barWidth * hpRate,
            barHeight
        );

        ctx.fillStyle = 'black';

        y += 35;
    });
}

function drawEnemySquadStatus() {
    if (!gameState) return;

    gameState.squads.forEach((squad) => {
        if (squad.faction !== FACTION.ENEMY) {
            return;
        }

        // 部隊の総HPを計算
        let hp = 0;
        let maxHp = 0;

        squad.units.forEach((unit) => {
            hp += unit.hp;
            maxHp += unit.maxHp;
        });

        const x = squad.pos.x - 40;
        const y = squad.pos.y - 25;

        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'black';

        ctx.fillText(
            `HP ${Math.ceil(hp)} / ${maxHp}`,
            x,
            y
        );

        // HPバー
        const barWidth = 80;
        const barHeight = 6;

        const hpRate = maxHp > 0 ? hp / maxHp : 0;

        ctx.fillStyle = 'gray';
        ctx.fillRect(
            x,
            y + 4,
            barWidth,
            barHeight
        );

        ctx.fillStyle = 'red';
        ctx.fillRect(
            x,
            y + 4,
            barWidth * hpRate,
            barHeight
        );
    });
}

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

    drawMySquadStatus();
    drawEnemySquadStatus();
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