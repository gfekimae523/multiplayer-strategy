
const { UNIT } = require('./constants.js');
const Unit = require('./unit.js');


class Squad {
    playerId;
    squadId;
    faction;
    pos;
    targetPos;

    attackTimer;
    attackCooldownTime;
    attackRange;

    units;

    speed;

    constructor({ playerId, squadId, faction, spawnPos, unitList }) {
        this.playerId = playerId;
        this.squadId = squadId;
        this.faction = faction;
        this.pos = { x: spawnPos.x, y: spawnPos.y };
        this.targetPos = { x: spawnPos.x, y: spawnPos.y };

        this.attackTimer = 0;
        this.attackCooldownTime = 6;
        this.attackRange = 100;

        this.units = [];
        unitList.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                let unit = new Unit({ type });
                this.units.push(unit);
            }
        });
        let minSpeed = (this.units.length > 0) ? Infinity : 0;
        for (let i = 0; i < this.units.length; i++) {
            minSpeed = Math.min(this.units[i].data.speed, minSpeed);
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
        if (!this.targetPos) {
            return;
        }

        const diff = {
            x: this.targetPos.x - this.pos.x,
            y: this.targetPos.y - this.pos.y
        };

        const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
        const moveDistance = this.speed * dt;

        if (distance <= moveDistance) {
            this.pos.x = this.targetPos.x;
            this.pos.y = this.targetPos.y;
            return;
        }

        this.pos.x += diff.x / distance * moveDistance;
        this.pos.y += diff.y / distance * moveDistance;
    }

    getAttackDamages() {
        const damages = [];

        this.units.forEach(unit => {
            const existing = damages.find(attack =>
                attack.physical === unit.data.physicalAttack &&
                attack.magic === unit.data.magicAttack &&
                attack.accuracy === unit.data.accuracy
            );

            if (existing) {
                existing.count++;
            } else {
                damages.push({
                    physical: unit.data.physicalAttack,
                    magic: unit.data.magicAttack,
                    accuracy: unit.data.accuracy,
                    count: 1
                });
            }
        });

        return damages;
    }

    takeDamages(damages) {

        damages.forEach(damage => {

            this.units.forEach(unit => {

                const hitRate =
                    damage.accuracy /
                    (damage.accuracy + unit.data.evasion);

                if (Math.random() >= hitRate) {
                    return;
                }

                const physicalDamage =
                    damage.physical *
                    damage.physical /
                    (damage.physical + unit.data.physicalDefense) *
                    damage.count /
                    this.units.length;

                const magicDamage =
                    damage.magic *
                    damage.magic /
                    (damage.magic + unit.data.magicDefense) *
                    damage.count /
                    this.units.length;

                unit.data.takeDamage({
                    damage: physicalDamage + magicDamage
                });
            });
        });

        this.units = this.units.filter(unit => !unit.isDead());
    }

    isDead() {
        return this.units.length === 0;
    }
}


module.exports = Squad;