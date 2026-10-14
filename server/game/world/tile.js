
const { FACTION, TILE_DATA } = require('../constants.js');

class Tile {
    type;
    x;
    y;
    centerPos;

    visibility;

    constructor({ type, x, y, centerPos }) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.centerPos = {
            x: centerPos.x, 
            y: centerPos.y
        };
        this.visibility = {
            [FACTION.PLAYER]: 0, 
            [FACTION.ENEMY]: 0
        };
    }

    get data() {
        return TILE_DATA[this.type];
    }
}

module.exports = Tile;