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
        maxHp: 30,
        physicalAttack: 10, 
        magicAttack: 0, 
        physicalDefense: 10, 
        magicDefense: 10, 
        accuracy: 100, 
        evasion: 50, 
        speed: 10
    },

    horse: {
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

module.exports = {
    FACTION,
    UNIT, 
    UNIT_STATUS
};