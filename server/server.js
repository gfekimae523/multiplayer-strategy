

class Game {
    time;
    squads;

    constructor() {
        this.time = 0;
        this.squads = [new Squad(0, 0)];
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
    pos;
    targetPos;
    units;

    constructor(x, y) {
        this.pos = {x: x, y: y};
        this.targetPos = {x: x, y: y};
        this.units = [new Unit()];
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


const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });



wss.on('connection', (ws) => {
    console.log('プレイヤーが接続しました。接続人数' + wss.clients.size + '人');

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
    console.log("time: " + mainGame.time);

    mainGame.update();

    let state = mainGame.getState();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(state));
    });
}

function init() {
    mainGame = new Game();
    setInterval(mainloop, 1000);
}

init();