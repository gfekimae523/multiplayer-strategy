
const { UNIT } = require('./constants.js');
const { Goblin, Horse } = require('./unit.js');


class Squad {
    id;
    faction;
    pos;
    targetPos;

    targetSquad;
    attackTimer;
    attackCooldownTime;
    attackRange;

    units;

    speed;

    constructor({ id, faction, spawnPos, unitList }) {
        this.id = id;
        this.faction = faction;
        this.pos = { x: spawnPos.x, y: spawnPos.y };
        this.targetPos = { x: spawnPos.x, y: spawnPos.y };

        this.targetSquad = null;
        this.attackTimer = 0;
        this.attackCooldownTime = 6;
        this.attackRange = 100;

        this.units = [];
        unitList.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                let unit;
                switch (type) {
                    case UNIT.GOBLIN:
                        unit = new Goblin();
                        break;
                    case UNIT.HORSE:
                        unit = new Horse();
                        break;
                    default:
                        console.log('不明なユニットです：' + type);
                }
                this.units.push(unit);
            }
        });
        let minSpeed = (this.units.length > 0) ? Infinity : 0;
        for (let i = 0; i < this.units.length; i++) {
            minSpeed = Math.min(this.units[i].speed, minSpeed);
        }
        this.speed = (Number.isFinite(minSpeed)) ? minSpeed : 0;
    }

    setTargetPos(targetPos) {
        this.targetPos = {
            x: targetPos.x,
            y: targetPos.y
        };
    }

    update({ dt }) {
        const diff = {
            x: this.targetPos.x - this.pos.x,
            y: this.targetPos.y - this.pos.y
        };
        const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
        const moveDistance = this.speed * dt;

        if (distance <= moveDistance) {
            this.pos.x = this.targetPos.x;
            this.pos.y = this.targetPos.y;
        } else {
            const rad = Math.atan2(diff.y, diff.x);
            this.pos.x += Math.cos(rad) * moveDistance;
            this.pos.y += Math.sin(rad) * moveDistance;
        }

    }
}


module.exports = Squad;