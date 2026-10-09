
const Tile = require('./tile.js');
const { TERRAIN } = require('./constants.js');

class BattleMap {
    name;
    tiles;

    columns;
    rows;

    tileSize;

    constructor() {
        this.name = "テストマップ";

        this.columns = 80;
        this.rows = 60;
        
        this.tileSize = 10;

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

    get width() {
        return this.columns * this.tileSize;
    }

    get height() {
        return this.rows * this.tileSize;
    }
}

module.exports = BattleMap;