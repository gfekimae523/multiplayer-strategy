class MoveSystem {
    updateMove({ dt, squads, attacks }) {
        squads.forEach((squad) => {
            squad.move({ dt });
        });

        attacks.forEach((attack) => {
            const targetSquad = squads.find(
                squad => squad.squadId === attack.targetSquadId
            );

            attack.move({
                dt,
                targetPos: targetSquad?.pos
            });
        });
    }
}

module.exports = MoveSystem;