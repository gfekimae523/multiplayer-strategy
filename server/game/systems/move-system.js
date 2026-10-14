
class MoveSystem {
    constructor() {

    }

    updateMove({ dt, squads, attacks }) {
        squads.forEach((squad) => {
            squad.move({ dt: dt });
        });

        attacks.forEach((attack) => {
            attack.move({ dt: dt });
        });
    }
}

module.exports = MoveSystem;