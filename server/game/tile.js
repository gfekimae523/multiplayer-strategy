
const { FACTION, TILE_DATA } = require('./constants.js');

class Tile {
    type;
    visibility;

    constructor({ type }) {
        this.type = type;
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