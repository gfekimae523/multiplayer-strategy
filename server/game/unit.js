
const { UNIT_STATUS } = require('./constants.js');

class Unit {
    type;

    name;
    maxHp;
    hp;
    physicalAttack;
    magicAttack;
    physicalDefense;
    magicDefense;
    accuracy;
    evasion;
    speed;

    constructor({ type }) {
        const status = UNIT_STATUS[type];

        this.type = type;
        this.name = status.name;
        this.maxHp = status.maxHp;
        this.hp = status.maxHp;
        this.physicalAttack = status.physicalAttack;
        this.magicAttack = status.magicAttack;
        this.physicalDefense = status.physicalDefense;
        this.magicDefense = status.magicDefense;
        this.accuracy = status.accuracy;
        this.evasion = status.evasion;
        this.speed = status.speed;
    }

    takeDamage({ physicalDamage = 0, magicDamage = 0 }) {
        this.hp -= physicalDamage;
        this.hp -= magicDamage;

        this.hp = Math.max(this.hp, 0);
    }

    isDead() {
        return this.hp <= 0;
    }
}

module.exports = Unit;