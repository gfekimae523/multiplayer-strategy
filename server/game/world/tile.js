
const { FACTION } = require('../constants.js');

class Tile {
    type;
    tilePos;
    centerPos;

    visionValue;
    visibility;

    constructor({ type, tilePos, centerPos }) {
        this.type = type;
        this.tilePos = {
            x: tilePos.x,
            y: tilePos.y
        }
        this.centerPos = {
            x: centerPos.x,
            y: centerPos.y
        };
        this.visionValue = {
            [FACTION.PLAYER]: 0,
            [FACTION.ENEMY]: 0
        };
        this.visibility = {
            [FACTION.PLAYER]: 0,
            [FACTION.ENEMY]: 0
        };
    }
}

module.exports = Tile;