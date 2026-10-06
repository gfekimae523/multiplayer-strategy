class Unit {
    maxHp;
    hp;
    attack;
    speed;

    constructor({ maxHp, attack, speed }) {
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.speed = speed;
    }
}

class Goblin extends Unit {
    constructor() {
        super({
            maxHp: 30,
            attack: 3,
            speed: 20
        });
    }
}

class Horse extends Unit {
    constructor() {
        super({
            maxHp: 50,
            attack: 5,
            speed: 40
        });
    }
}


module.exports = {
    Unit,
    Goblin,
    Horse
};