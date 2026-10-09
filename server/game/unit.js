
const { UNIT_DATA } = require('./constants.js');

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
        this.type = type;
        this.hp = UNIT_DATA[type].maxHp;
    }

    get data() {
        return UNIT_DATA[this.type];
    }

    takeDamage({damage}) {
        this.hp -= damage;

        this.hp = Math.max(this.hp, 0);
    }

    isDead() {
        return this.hp <= 0;
    }
}

module.exports = Unit;