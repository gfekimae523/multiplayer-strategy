const FACTION = {
    PLAYER: "player",
    ENEMY: "enemy"
};

const UNIT = {
    GOBLIN: "goblin",
    HORSE: "horse"
};

const UNIT_STATUS = {
    goblin: {
        name: "ゴブリン", 
        maxHp: 50,
        physicalAttack: 10, 
        magicAttack: 0, 
        physicalDefense: 10, 
        magicDefense: 10, 
        accuracy: 100, 
        evasion: 50, 
        speed: 20
    },

    horse: {
        name: "ウマ", 
        maxHp: 80,
        physicalAttack: 15, 
        magicAttack: 0, 
        physicalDefense: 12, 
        magicDefense: 12, 
        accuracy: 100, 
        evasion: 60, 
        speed: 40
    }
};

module.exports = {
    FACTION,
    UNIT, 
    UNIT_STATUS
};