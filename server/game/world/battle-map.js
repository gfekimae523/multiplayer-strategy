
const Tile = require('./tile.js');
const { TILE_SIZE, TERRAIN_TYPE } = require('../constants.js');

class BattleMap {
    name;
    tiles;

    columns;
    rows;
    width;
    height;

    spawnPos;

    constructor() {
        this.name = "テストマップ";

        this.columns = 80;
        this.rows = 60;
        this.width = TILE_SIZE * this.columns;
        this.height = TILE_SIZE * this.rows;

        this.spawnPos = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.tiles = [];
        for (let y = 0; y < this.rows; y++) {
            const row = [];

            for (let x = 0; x < this.columns; x++) {
                row.push(
                    new Tile({
                        type: (x >= 3 && x < this.columns - 3 && y >= 3 && y < this.rows - 3) 
                            ? TERRAIN_TYPE.PLAIN 
                            : TERRAIN_TYPE.FOREST, 
                        tilePos: {
                            x: x, 
                            y: y
                        }, 
                        centerPos: {
                            x: TILE_SIZE * (x + 0.5), 
                            y: TILE_SIZE * (y + 0.5)
                        }
                    })
                );
            }

            this.tiles.push(row);
        }
    }
}

module.exports = BattleMap;