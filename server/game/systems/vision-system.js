
const { TILE_SIZE, UNIT_TYPE, UNIT_DATA, FACTION } = require('../constants.js');

class VisionSystem {
    visionPatterns;

    constructor() {
        this.visionPatterns = {};
        Object.values(UNIT_TYPE).forEach((type) => {
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
        const unitList = squad.getUnitList();

        Object.entries(unitList).forEach(([type, count]) => {
            if (count <= 0) return;

            const visionPattern = this.visionPatterns[type];

            visionPattern.forEach((vision) => {
                const x = squadTilePos.x + vision.dx;
                const y = squadTilePos.y + vision.dy;

                if (
                    y < 0 ||
                    y >= battleMap.tiles.length ||
                    x < 0 ||
                    x >= battleMap.tiles[y].length
                ) {
                    return;
                }

                const tile = battleMap.tiles[y][x];
                const faction = squad.faction;
                const value = vision.visionValue * count;

                if (!Number.isFinite(tile.visionValue[faction])) return;

                if (!Number.isFinite(value)) {
                    tile.visionValue[faction] = Infinity;
                } else {
                    tile.visionValue[faction] += value;
                }
            });
        });
    }

    #normalizeVisionValue({ battleMap }) {
        const k = 0.7;

        battleMap.tiles.forEach((tileRow) => {
            tileRow.forEach((tile) => {
                Object.values(FACTION).forEach((faction) => {
                    const visionValue = tile.visionValue[faction];

                    if (Number.isFinite(visionValue)) {
                        tile.visibility[faction] = 1 - Math.exp(-k * visionValue);
                    } else {
                        tile.visibility[faction] = 1;
                    }
                });
            });
        });
    }
}

module.exports = VisionSystem;