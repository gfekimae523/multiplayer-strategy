
const Tile = require('./tile.js');
const { TERRAIN } = require('./constants.js');

class BattleMap {
    name;
    tiles;

    columns;
    rows;
    tileSize;
    width;
    height;
    
    spawnPos;

    constructor() {
        this.name = "テストマップ";

        this.columns = 80;
        this.rows = 60;
        this.tileSize = 10;
        this.width = this.tileSize * this.columns;
        this.height = this.tileSize * this.rows;

        this.spawnPos = {
            x: this.width / 2, 
            y: this.height / 2
        };

        this.tiles = [];
        for (let y = 0; y < this.columns; y++) {
            const row = [];

            for (let x = 0; x < this.rows; x++) {
                row.push(new Tile({
                    type: TERRAIN.PLAIN
                }));
            }

            this.tiles.push(row);
        }
    }
}

module.exports = BattleMap;