

class Game {
    time;
    squads;
    spawnPos;

    constructor() {
        this.time = 0;
        this.squads = [];
        this.spawnPos = {x: 400, y: 300};
    }

    addSquad(id) {
        this.squads.push(new Squad(id, this.spawnPos));
    }

    removeSquad(id) {

    }

    update() {
        this.squads.forEach((squad) => {
            squad.update();
        });

        this.time += 1;
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
    pos;
    targetPos;
    units;
    speed;

    constructor(id, spawnPos) {
        this.id = id;
        this.pos = {x: spawnPos.x, y: spawnPos.y};
        this.targetPos = {x: spawnPos.x, y: spawnPos.y};
        this.units = [new Unit()];
        this.speed = 3;
    }

    update() {
        this.pos.x += 2;
        this.pos.y += 1;
    }
}

class Unit {
    hp;

    constructor() {
        this.hp = 10;
    }
}



let mainGame;
let connectionCount;


const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });



wss.on('connection', (ws) => {
    console.log('プレイヤーが接続しました。接続人数' + wss.clients.size + '人');
    mainGame.addSquad(connectionCount);
    ws.id = connectionCount;
    connectionCount++;

    ws.on('message', (message) => {

    });

    //   ws.on('message', (message) => {
    //     wss.clients.forEach((client) => {
    //         client.send("hoge");
    //     });
    //   });

    ws.on('close', () => {
        console.log('プレイヤーが切断しました。接続人数' + wss.clients.size + '人');
    });
});

function mainloop() {
    console.log('time: ' + mainGame.time);

    mainGame.update();

    let state = mainGame.getState();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(state));
    });
}

function init() {
    mainGame = new Game();
    connectionCount = 0;

    setInterval(mainloop, 1000);
}

init();