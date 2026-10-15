
const { TILE_SIZE, UNIT_TYPE, UNIT_DATA, FACTION } = require('../constants.js');

class VisionSystem {
    visionPatterns;

    constructor() {
        this.visionPatterns = {};
        UNIT_TYPE.forEach((type) => {
            this.#createVisionPattern({ type: type });
        });
    }

    updateVision({ squads, battleMap }) {
        this.#resetVisibility({ battleMap: battleMap });

        squads.forEach((squad) => {
            this.#updateVisionValue({
                battleMap: battleMap,
                squad: squad
            });
        });

        this.#normalizeVisionValue({ battleMap: battleMap });
    }

    #createVisionPattern({ type }) {
        const visionRange = UNIT_DATA[type].visionRange;
        const fullVisionRange = UNIT_DATA[type].fullVisionRange;
        const tileRange = Math.ceil(visionRange / TILE_SIZE);

        const visionPattern = [];

        for (let dy = -tileRange; dy <= tileRange; dy++) {
            for (let dx = -tileRange; dx <= tileRange; dx++) {
                const distance = Math.sqrt(dx ** 2 + dy ** 2) * TILE_SIZE;

                let visionValue = 0;

                if (distance >= visionRange) continue;
                if (distance <= fullVisionRange) {
                    visionValue = Infinity;
                } else {
                    visionValue = 1 * (1 - (distance - fullVisionRange) / (visionRange - fullVisionRange));
                }
                visionPattern.push({
                    dx: dx, 
                    dy: dy, 
                    visionValue: visionValue
                });
            }
        }

        this.visionPatterns[type] = visionPattern;
    }

    #resetVisibility({ battleMap }) {
        const tiles = battleMap.tiles;
        tiles.forEach((tileRow) => {
            tileRow.forEach((tile) => {
                tile.visionValue = {
                    [FACTION.PLAYER]: 0,
                    [FACTION.ENEMY]: 0
                };
                tile.visibility = {
                    [FACTION.PLAYER]: 0,
                    [FACTION.ENEMY]: 0
                };
            });
        });
    }

    #updateVisionValue({ battleMap, squad }) {
        const squadTilePos = squad.getTilePos();
        //const tile = battleMap.tiles[tilePos.y][tilePos.x];
        //tile.visionValue[squad.faction] += 1;
    }

    #normalizeVisionValue({ battleMap }) {
        const k = 0.7;

        battleMap.tiles.forEach((tileRow) => {
            tileRow.forEach((tile) => {
                if (Number.isFinite(tile.visionValue[FACTION.PLAYER])) {
                    tile.visibility[FACTION.PLAYER] = 1 - Math.exp(-k * tile.visionValue[FACTION.PLAYER]);
                } else {
                    tile.visibility[FACTION.PLAYER] = 1;
                }
                
                if (Number.isFinite(tile.visionValue[FACTION.ENEMY])) {
                    tile.visibility[FACTION.ENEMY] = 1 - Math.exp(-k * tile.visionValue[FACTION.ENEMY]);
                } else {
                    tile.visibility[FACTION.ENEMY] = 1;
                }
            });
        });
    }
}

module.exports = VisionSystem;