
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
    enemySpawnTimer;
    targetSearchTimer;
    enemyIdCounter;

    squads;
    attacks;
    effects;

    constructor() {
        this.width = 800;
        this.height = 600;
        this.spawnPos = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.time = 0;
        this.enemySpawnTimer = 0;
        this.targetSearchTimer = 0;
        this.enemyIdCounter = 0;

        this.squads = [];
        this.attacks = [];
        this.effects = [];
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
            { type: UNIT.GOBLIN, count: 10 }
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
            { type: UNIT.GOBLIN, count: 4 }
        ];

        this.addSquad({
            id: `enemy-${this.enemyIdCounter}`,
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
        if (this.enemySpawnTimer < 5) {
            return;
        }
        const enemyCount = this.squads.filter(squad => squad.faction === FACTION.ENEMY).length;
        if (enemyCount >= 5) {
            return;
        }

        this.addEnemy();
        this.enemyIdCounter++;
        this.enemySpawnTimer = 0;

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
        if (this.targetSearchTimer < 1) {
            return;
        }

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

        this.targetSearchTimer = 0;
    }

    getAttackableEnemySquads({squad}) {
        return this.squads.filter((targetSquad) => {
            if (targetSquad.faction === squad.faction) {
                return false;
            }

            const dx = targetSquad.pos.x - squad.pos.x;
            const dy = targetSquad.pos.y - squad.pos.y;

            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            return (distance <= squad.attackRange);
        });
    }

    getRandomElement(array) {
        if (array.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    updateAttacks({dt}) {
        this.squads.forEach((squad) => {
            squad.attackTimer += dt;

            if (squad.attackTimer < squad.attackCooldownTime) {
                return;
            }

            const targetSquads = this.getAttackableEnemySquads({
                squad: squad
            });

            const targetSquad = this.getRandomElement(targetSquads);

            if (!targetSquad) {
                return;
            }

            this.attacks.push(
                new Attack({
                    attackerSquad: squad, 
                    targetSquad: targetSquad
                })
            );

            squad.attackTimer = 0;
        });
    }

    update({ dt }) {
        this.time += dt;
        this.enemySpawnTimer += dt;
        this.targetSearchTimer += dt;

        this.squads.forEach((squad) => {
            squad.update({ dt: dt });
        });

        this.updateAttacks({dt: dt});

        this.attacks.forEach((attack) => {
            const result = attack.update({dt: dt});

            if (result?.effect) {
                this.effects.push(result.effect);
            }
        });

        this.attacks = this.attacks.filter(
            attack => !attack.finished
        );

        this.spawnEnemy();
        this.updateEnemyTargets();
    }

    getState() {
        return {
            time: this.time,
            squads: this.squads, 
            attacks: this.attacks
        };
    }
}

class Squad {
    id;
    faction;
    pos;
    targetPos;

    targetSquad;
    attackTimer;
    attackCooldownTime;
    attackRange;

    units;

    speed;

    constructor({ id, faction, spawnPos, unitList }) {
        this.id = id;
        this.faction = faction;
        this.pos = { x: spawnPos.x, y: spawnPos.y };
        this.targetPos = { x: spawnPos.x, y: spawnPos.y };

        this.targetSquad = null;
        this.attackTimer = 0;
        this.attackCooldownTime = 6;
        this.attackRange = 100;

        this.units = [];
        unitList.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
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
    maxHp;
    hp;
    attack;
    speed;

    constructor({ maxHp, attack, speed }) {
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.speed = speed;
    }
}

class Goblin extends Unit {
    constructor() {
        super({
            maxHp: 30,
            attack: 3,
            speed: 20
        });
    }
}

class Horse extends Unit {
    constructor() {
        super({
            maxHp: 50,
            attack: 5,
            speed: 40
        });
    }
}

class Attack {
    attackerSquad;
    targetSquad;
    startPos;
    targetPos;

    time;
    travelTime;
    finished;

    constructor({ attackerSquad, targetSquad}) {
        this.attackerSquad = attackerSquad;
        this.targetSquad = targetSquad;

        this.startPos = {
            x: attackerSquad.pos.x, 
            y: attackerSquad.pos.y
        };

        this.targetPos = {
            x: targetSquad.pos.x, 
            y: targetSquad.pos.y
        };
        
        this.time = 0;
        this.travelTime = 2;
        this.finished = false;
    }

    update({dt}) {
        this.time += dt;

        if (this.time >= this.travelTime) {
            const effect = this.hit();

            return {effect: effect};
        }

        return null;
    }

    hit() {
        //回避判定
        //ダメージ処理
        //ExplosionEffect生成

        const effect = new ExplosionEffect({
            pos: this.targetPos
        });

        this.finished = true;

        return effect;
    }
}

class ExplosionEffect {
    pos;

    constructor({pos}) {
        this.pos = {
            x: pos.x, 
            y: pos.y
        };
    }
}



let mainGame;
let lastTime;
let broadcastTimer;
let connectionCount;


const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath;

    if (req.url === '/') {
        filePath = path.join(__dirname, '..', 'client', 'index.html');
    } else if (req.url === '/index.js') {
        filePath = path.join(__dirname, '..', 'client', 'index.js');
    } else {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
        }

        const contentType =
            req.url === '/index.js'
                ? 'text/javascript'
                : 'text/html';

        res.writeHead(200, {
            'Content-Type': contentType
        });

        res.end(data);
    });
});

const wss = new WebSocketServer({ server });

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});


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

    broadcastTimer += dt;

    mainGame.update({ dt: dt });

    

    if (broadcastTimer >= 0.2) {
        broadcastTimer = 0;

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
    broadcastTimer = 0;
    connectionCount = 0;

    setInterval(mainloop, 50);
}

init();