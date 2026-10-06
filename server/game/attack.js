
const ExplosionEffect = require('./effect.js');

class Attack {
    attackerSquad;
    targetSquad;
    startPos;
    targetPos;

    time;
    travelTime;
    finished;

    constructor({ attackerSquad, targetSquad}) {
        this.attackerSquad = attackerSquad;
        this.targetSquad = targetSquad;

        this.startPos = {
            x: attackerSquad.pos.x, 
            y: attackerSquad.pos.y
        };

        this.targetPos = {
            x: targetSquad.pos.x, 
            y: targetSquad.pos.y
        };
        
        this.time = 0;
        this.travelTime = 2;
        this.finished = false;
    }

    update({dt}) {
        this.time += dt;

        if (this.time >= this.travelTime) {
            const effect = this.hit();

            return {effect: effect};
        }

        return null;
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