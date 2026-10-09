
const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};


const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${location.host}`);


let mainCanvas;
let ctx;


let world = {
    width: 800,
    height: 600
};

let camera = {
    zoom: 2,
    centerPos: {
        x: 400,
        y: 300
    },
    moveSpeed: 5
};

let playerId;
let gameState;
let squads;
let attacks;
let effects;

let pressedKeys = {};



ws.onmessage = (event) => {
    gameState = JSON.parse(event.data);
    playerId = gameState.playerId;
    squads = gameState.squads;
    attacks = gameState.attacks;
    effects = gameState.effects;
};

function updateCamera() {
    if (pressedKeys['w']) {
        camera.centerPos.y -= camera.moveSpeed;
    }

    if (pressedKeys['s']) {
        camera.centerPos.y += camera.moveSpeed;
    }

    if (pressedKeys['a']) {
        camera.centerPos.x -= camera.moveSpeed;
    }

    if (pressedKeys['d']) {
        camera.centerPos.x += camera.moveSpeed;
    }
}

function drawMySquadStatus() {
    if (!squads) return;
    if (!playerId) return;

    const squad = squads.find(
        squad => squad.playerId === playerId
    );

    if (!squad) return;

    const x = 20;
    let y = 30;

    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';

    squad.units.forEach((unit) => {
        // 名前
        ctx.fillText(
            `${unit.name} ${Math.ceil(unit.hp)} / ${unit.data.maxHp}`,
            x,
            y
        );

        // HPバー
        const barWidth = 150;
        const barHeight = 10;

        const hpRate = unit.hp / unit.data.maxHp;

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
    if (!squads) return;

    squads.forEach((squad) => {
        if (squad.faction !== FACTION.ENEMY) {
            return;
        }

        // 部隊の総HPを計算
        let hp = 0;
        let maxHp = 0;

        squad.units.forEach((unit) => {
            hp += unit.hp;
            maxHp += unit.data.maxHp;
        });

        const posV = convertPosWToV(squad.pos);

        const x = posV.x - 40;
        const y = posV.y - 25;

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

    squads.forEach((squad) => {
        const posV = convertPosWToV(squad.pos);

        if (squad.playerId === playerId) {
            ctx.fillStyle = 'rgb(0, 200, 0)';
        } else if (squad.faction === FACTION.PLAYER) {
            ctx.fillStyle = 'rgb(0, 0, 200)';
        } else if (squad.faction === FACTION.ENEMY) {
            ctx.fillStyle = 'rgb(200, 0, 0)';
        }
        ctx.fillRect(
            posV.x - 5,
            posV.y - 5,
            10,
            10
        );
    });

    attacks.forEach((attack) => {
        const posV = convertPosWToV(attack.pos);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.beginPath();
        ctx.arc(posV.x, posV.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    drawMySquadStatus();
    drawEnemySquadStatus();
}

function bindEvents() {
    mainCanvas.addEventListener('click', (event) => {
        const rect = mainCanvas.getBoundingClientRect();

        const posV = {
            x: (event.clientX - rect.left) * mainCanvas.width / rect.width,
            y: (event.clientY - rect.top) * mainCanvas.height / rect.height
        };

        const posW = convertPosVToW(posV);

        ws.send(JSON.stringify({
            type: 'move',
            targetPos: posW
        }));
    });

    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (['w', 'a', 's', 'd'].includes(key)) {
            event.preventDefault();
            pressedKeys[key] = true;
        }
    });

    window.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        pressedKeys[key] = false;
    });

    window.addEventListener('blur', () => {
        pressedKeys = {};
    });
}

function mainloop() {
    console.log(playerId);
    updateCamera();
    draw();

    requestAnimationFrame(mainloop);
}

function init() {
    mainCanvas = document.querySelector('.mainCanvas');
    ctx = mainCanvas.getContext('2d');

    playerId = null;
    gameState = null;
    squads = [];
    attacks = [];
    effects = [];

    bindEvents();

    requestAnimationFrame(mainloop);
}

function convertPosWToV(posW) {
    const posV = {
        x: (posW.x - camera.centerPos.x) * camera.zoom + mainCanvas.width / 2,
        y: (posW.y - camera.centerPos.y) * camera.zoom + mainCanvas.height / 2
    };
    return posV;
}

function convertPosVToW(posV) {
    const posW = {
        x: (posV.x - mainCanvas.width / 2) / camera.zoom + camera.centerPos.x,
        y: (posV.y - mainCanvas.height / 2) / camera.zoom + camera.centerPos.y
    };
    return posW;
}

document.addEventListener('DOMContentLoaded', init);