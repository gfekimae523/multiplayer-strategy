
const { FACTION } = require('../constants.js');

class VisionSystem {
    constructor() {

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

    #resetVisibility({ battleMap }) {
        const tiles = battleMap.tiles;
        tiles.forEach((tile) => {
            tile.visionValue = {
                [FACTION.PLAYER]: 0,
                [FACTION.ENEMY]: 0
            };
            tile.visibility = {
                [FACTION.PLAYER]: 0,
                [FACTION.ENEMY]: 0
            };
        });
    }

    #updateVisionValue({ battleMap, squad }) {

    }

    #normalizeVisionValue({ battleMap }) {

    }
}

module.exports = VisionSystem;