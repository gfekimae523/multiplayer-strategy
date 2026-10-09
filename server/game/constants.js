const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const UNIT = {
    GOBLIN: "goblin",
    HORSE: "horse"
};

const UNIT_DATA = {
    [UNIT.GOBLIN]: {
        name: "ゴブリン",
        maxHp: 30,
        physicalAttack: 10,
        magicAttack: 0,
        physicalDefense: 10,
        magicDefense: 10,
        accuracy: 100,
        evasion: 50,
        speed: 10
    },

    [UNIT.HORSE]: {
        name: "ウマ",
        maxHp: 50,
        physicalAttack: 15,
        magicAttack: 0,
        physicalDefense: 12,
        magicDefense: 12,
        accuracy: 100,
        evasion: 60,
        speed: 20
    }
};

const TERRAIN = {
    PLAIN: 'plain',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    WATER: 'water'
};

const TERRAIN_DATA = {
    [TERRAIN.PLAIN]: {
        name: '平地',
        moveCost: 1,
        visionModifier: 1
    },
    [TERRAIN.FOREST]: {
        name: '森林',
        moveCost: 2,
        visionModifier: 0.5
    },
    [TERRAIN.MOUNTAIN]: {
        name: '山岳',
        moveCost: 4,
        visionModifier: 0.9
    },
    [TERRAIN.WATER]: {
        name: '海面', 
        moveCost: 10, 
        visionModifier: 1.0
    }
};


module.exports = {
    FACTION,
    UNIT,
    UNIT_DATA,
    TERRAIN,
    TERRAIN_DATA
};