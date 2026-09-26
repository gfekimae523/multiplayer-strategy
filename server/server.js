
const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const UNIT = {
    GOBLIN: "goblin",
    HORSE: "horse"
}


class Game {
    width;
    height;
    spawnPos;

    time;
    lastSpawnTime;
    lastTargetTime;
    enemyCount;

    squads;


    constructor() {
        this.width = 800;
        this.height = 600;
        this.spawnPos = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.time = 0;
        this.lastSpawnTime = 0;
        this.lastTargetTime = 0;
        this.enemyCount = 0;

        this.squads = [];
    }

    addSquad({ id, faction, spawnPos, unitList }) {
        this.squads.push(
            new Squad({
                id: id,
                faction: faction,
                spawnPos: spawnPos,
                unitList: unitList
            })
        );
    }

    removeSquad({ id }) {
        this.squads = this.squads.filter(squad => squad.id !== id);
    }

    addPlayer({ id }) {
        const defaultUnitList = [
            { type: UNIT.GOBLIN, num: 10 }
        ];
        this.addSquad({
            id: id,
            faction: FACTION.PLAYER,
            spawnPos: this.spawnPos,
            unitList: defaultUnitList
        });
    }

    addEnemy() {
        const spawnPos = {
            x: Math.random() * this.width,
            y: 0
        };

        const unitList = [
            { type: UNIT.GOBLIN, num: 3 }
        ];

        this.addSquad({
            id: `enemy-${this.enemyCount}`,
            faction: FACTION.ENEMY,
            spawnPos: spawnPos,
            unitList: unitList
        });
    }

    setTargetPos({ id, targetPos }) {
        const squad = this.squads.find(squad => squad.id === id);
        if (!squad) return;

        squad.setTargetPos(targetPos);
    }

    spawnEnemy() {
        if (this.time - this.lastSpawnTime < 5) {
            return;
        }
        const enemyCount = this.squads.filter(squad => squad.faction === FACTION.ENEMY).length;
        if (enemyCount >= 5) {
            return;
        }

        this.addEnemy();
        this.enemyCount++;
        this.lastSpawnTime = this.time;

    }

    getNearestPlayerSquad({ pos }) {
        const playerSquads = this.squads.filter(
            squad => squad.faction === FACTION.PLAYER
        );

        if (playerSquads.length === 0) {
            return null;
        }

        let nearestSquad = null;
        let nearestDistance = Infinity;

        playerSquads.forEach((squad) => {
            const dx = squad.pos.x - pos.x;
            const dy = squad.pos.y - pos.y;

            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestSquad = squad;
            }
        });

        return nearestSquad;
    }

    updateEnemyTargets() {
        if (this.time - this.lastTargetTime < 1) {
            return;
        }

        this.lastTargetTime = this.time;

        const enemySquads = this.squads.filter(
            squad => squad.faction === FACTION.ENEMY
        );

        enemySquads.forEach((enemySquad) => {
            const targetSquad = this.getNearestPlayerSquad({
                pos: enemySquad.pos
            });

            if (!targetSquad) {
                return;
            }

            enemySquad.setTargetPos(targetSquad.pos);
        });
    }

    update({ dt }) {
        this.time += dt;

        this.squads.forEach((squad) => {
            squad.update({ dt: dt });
        });

        this.spawnEnemy();
        this.updateEnemyTargets();
    }

    getState() {
        return {
            time: this.time,
            squads: this.squads
        };
    }
}

class Squad {
    id;
    faction;
    pos;
    targetPos;
    units;
    speed;

    constructor({ id, faction, spawnPos, unitList }) {
        this.id = id;
        this.faction = faction;
        this.pos = { x: spawnPos.x, y: spawnPos.y };
        this.targetPos = { x: spawnPos.x, y: spawnPos.y };
        this.units = [];
        unitList.forEach(({ type, num }) => {
            for (let i = 0; i < num; i++) {
                let unit;
                switch (type) {
                    case UNIT.GOBLIN:
                        unit = new Goblin();
                        break;
                    case UNIT.HORSE:
                        unit = new Horse();
                        break;
                    default:
                        console.log('不明なユニットです：' + type);
                }
                this.units.push(unit);
            }
        });
        let minSpeed = (this.units.length > 0) ? Infinity : 0;
        for (let i = 0; i < this.units.length; i++) {
            minSpeed = Math.min(this.units[i].speed, minSpeed);
        }
        this.speed = (Number.isFinite(minSpeed)) ? minSpeed : 0;
    }

    setTargetPos(targetPos) {
        this.targetPos = {
            x: targetPos.x,
            y: targetPos.y
        };
    }

    update({ dt }) {
        const diff = {
            x: this.targetPos.x - this.pos.x,
            y: this.targetPos.y - this.pos.y
        };
        const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
        const moveDistance = this.speed * dt;

        if (distance <= moveDistance) {
            this.pos.x = this.targetPos.x;
            this.pos.y = this.targetPos.y;
        } else {
            const rad = Math.atan2(diff.y, diff.x);
            this.pos.x += Math.cos(rad) * moveDistance;
            this.pos.y += Math.sin(rad) * moveDistance;
        }

    }
}


class Unit {
    hp;
    attack;
    speed;

    constructor({ hp, attack, speed }) {
        this.hp = hp;
        this.attack = attack;
        this.speed = speed;
    }
}

class Goblin extends Unit {
    constructor() {
        super({
            hp: 30,
            attack: 3,
            speed: 20
        });
    }
}

class Horse extends Unit {
    constructor() {
        super({
            hp: 50,
            attack: 5,
            speed: 40
        });
    }
}



let mainGame;
let lastTime;
let lastSendTime;
let connectionCount;


const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });



wss.on('connection', (ws) => {
    console.log('プレイヤーが接続しました。');
    console.log('接続人数' + wss.clients.size + '人');
    mainGame.addPlayer({
        id: connectionCount
    });
    ws.id = connectionCount;
    connectionCount++;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'move':
                mainGame.setTargetPos({
                    id: ws.id,
                    targetPos: data.targetPos
                });
                break;
        }
    });

    ws.on('close', () => {
        console.log('プレイヤーが切断しました。');
        console.log('接続人数' + wss.clients.size + '人');
        mainGame.removeSquad({ id: ws.id });
    });
});

function mainloop() {
    const now = Date.now();

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    mainGame.update({ dt: dt });

    if (now - lastSendTime >= 200) {
        lastSendTime = now;

        const gameState = mainGame.getState();
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    playerId: client.id,
                    ...gameState
                }));
            }
        });
    }
}

function init() {
    mainGame = new Game();
    lastTime = Date.now();
    lastSendTime = lastTime;
    connectionCount = 0;

    setInterval(mainloop, 50);
}

init();