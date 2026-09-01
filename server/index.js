

class Game {
    squads;
    constructor() {
        this.squads = [new Squad(0, 0)];
    }

    update() {
        this.squads.forEach((squad) => {
            squad.update();
        });
    }

    draw() {
        this.squads.forEach((squad) => {
            squad.draw();
        });
    }
}

class Squad {
    x;
    y;
    units;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.units = [new Unit()];
    }

    update() {
        this.x += 2;
        this.y += 1;
    }

    draw() {
        console.log("(" + this.x + ", " + this.y + ")");
    }
}

class Unit {
    constructor() {
        this.hp = 10;
    }
}



let time = 0;

let mainGame;



const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('プレイヤーが接続しました');

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
        client.send("hoge");
    });
  });

  ws.on('close', () => {
    console.log('プレイヤーが切断しました');
  });
});


function mainloop() {
    console.log(time);

    //mainGame.update();
    //mainGame.draw();

    time += 1;
}

function init() {
    mainGame = new Game();
    setInterval(mainloop, 1000);
}

init();