
const TILE_SIZE = 10;

const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const UNIT_TYPE = {
    GOBLIN: "goblin",
    HORSE: "horse"
};

const UNIT_DATA = {
    [UNIT_TYPE.GOBLIN]: {
        name: "ゴブリン",
        maxHp: 30,
        physicalAttack: 10,
        magicAttack: 0,
        physicalDefense: 10,
        magicDefense: 10,
        accuracy: 100,
        evasion: 50,
        speed: 10, 
        visionRange: 50, 
        fullvisionRange: 10
    },

    [UNIT_TYPE.HORSE]: {
        name: "ウマ",
        maxHp: 50,
        physicalAttack: 15,
        magicAttack: 0,
        physicalDefense: 12,
        magicDefense: 12,
        accuracy: 100,
        evasion: 60,
        speed: 20, 
        visionRange: 60, 
        fullvisionRange: 12
    }
};

const TERRAIN_TYPE = {
    PLAIN: 'plain',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    WATER: 'water'
};

const TERRAIN_DATA = {
    [TERRAIN_TYPE.PLAIN]: {
        name: '平地',
        moveCost: 1,
        visionModifier: 1, 
        color: '#bbffbb'
    },
    [TERRAIN_TYPE.FOREST]: {
        name: '森林',
        moveCost: 2,
        visionModifier: 0.5, 
        color: '#44aa44'
    },
    [TERRAIN_TYPE.MOUNTAIN]: {
        name: '山岳',
        moveCost: 4,
        visionModifier: 0.9, 
        color: '#bb8844'
    },
    [TERRAIN_TYPE.WATER]: {
        name: '海面', 
        moveCost: 10, 
        visionModifier: 1.0, 
        color: '#4466ee'
    }
};


module.exports = {
    TILE_SIZE, 
    FACTION,
    UNIT_TYPE,
    UNIT_DATA,
    TERRAIN_TYPE,
    TERRAIN_DATA
};