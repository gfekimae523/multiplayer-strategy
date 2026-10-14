
class ExplosionEffect {
    pos;

    constructor({pos}) {
        this.pos = {
            x: pos.x, 
            y: pos.y
        };
    }
}

module.exports = ExplosionEffect;