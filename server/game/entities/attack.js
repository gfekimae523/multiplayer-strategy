
const ExplosionEffect = require('./effect.js');

class Attack {
    attackerSquadId;
    targetSquadId;
    pos;
    damages;

    speed;
    finished;

    constructor({ attackerSquadId, targetSquadId, pos, damages }) {
        this.attackerSquadId = attackerSquadId;
        this.targetSquadId = targetSquadId;

        this.pos = {
            x: pos.x,
            y: pos.y
        };

        this.damages = damages;

        this.speed = 100;
        this.finished = false;
    }

    update({ dt, targetPos }) {
        if (!targetPos) {
            this.finished = true;
            return;
        }

        const diff = {
            x: targetPos.x - this.pos.x,
            y: targetPos.y - this.pos.y
        };

        const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
        const moveDistance = this.speed * dt;

        if (distance <= moveDistance) {
            this.pos.x = targetPos.x;
            this.pos.y = targetPos.y;
            this.finished = true;
            return;
        }

        this.pos.x += diff.x / distance * moveDistance;
        this.pos.y += diff.y / distance * moveDistance;
    }

    hit() {
        //回避判定
        //ダメージ処理
        //ExplosionEffect生成

        const effect = new ExplosionEffect({
            pos: this.targetPos
        });

        this.finished = true;

        return effect;
    }
}

module.exports = Attack;