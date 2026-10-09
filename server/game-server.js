
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const Game = require('./game/game.js');

const PORT = process.env.PORT || 8080;

class GameServer {
    game;
    httpServer;
    webSocketServer;

    lastTime;
    broadcastTimer;
    connectionCounter;

    constructor() {
        this.game = new Game();

        this.httpServer = http.createServer((req, res) => {
            let filePath;

            if (req.url === '/') {
                filePath = path.join(__dirname, '..', 'client', 'index.html');
            } else if (req.url === '/index.js') {
                filePath = path.join(__dirname, '..', 'client', 'index.js');
            } else if (req.url === '/style.css') {
                filePath = path.join(__dirname, '..', 'client', 'style.css');
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

                const ext = path.extname(filePath);

                const contentTypes = {
                    '.html': 'text/html; charset=utf-8',
                    '.js': 'text/javascript; charset=utf-8',
                    '.css': 'text/css; charset=utf-8'
                };

                const contentType = contentTypes[ext] || 'application/octet-stream';

                res.writeHead(200, {
                    'Content-Type': contentType
                });

                res.end(data);
            });
        });

        this.webSocketServer = new WebSocketServer({
            server: this.httpServer
        });

        this.lastTime = Date.now();
        this.broadcastTimer = 0;
        this.connectionCounter = 0;

        this.setupWebSocket();
    }

    start() {
        this.httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server started on port ${PORT}`);
        });

        setInterval(() => {
            this.update();
        }, 50);
    }

    update() {
        const now = Date.now();

        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.broadcastTimer += dt;

        this.game.update({ dt: dt });

        if (this.broadcastTimer >= 0.2) {
            this.broadcastTimer = 0;
            this.broadcast();
        }
    }

    broadcast() {
        const gameState = this.game.getState();

        this.webSocketServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    playerId: client.playerId,
                    ...gameState
                }));
            }
        });
    }

    setupWebSocket() {
        this.webSocketServer.on('connection', (ws) => {
            console.log('プレイヤーが接続しました。');
            console.log(`接続人数：${this.webSocketServer.clients.size}人`);

            this.game.addPlayer({
                playerId: this.connectionCounter
            });

            ws.playerId = this.connectionCounter;
            this.connectionCounter++;

            ws.on('message', (message) => {
                const data = JSON.parse(message);

                switch (data.type) {
                    case 'move':
                        this.game.setTargetPos({
                            playerId: ws.playerId,
                            targetPos: data.targetPos
                        });
                        break;
                }
            });

            ws.on('close', () => {
                console.log('プレイヤーが切断しました。');
                console.log(`接続人数：${this.webSocketServer.clients.size}人`);

                this.game.removeSquad({
                    id: ws.id
                });
            });
        });
    }
}


module.exports = GameServer;