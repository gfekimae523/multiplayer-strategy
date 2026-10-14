
const Attack = require('../entities/attack.js');
const { FACTION } = require('../constants.js');

class CombatSystem {
    enemyTargetTimer;

    constructor() {
        this.enemyTargetTimer = 0;
    }

    createAttacks({ dt, squads, attacks }) {
        squads.forEach((squad) => {
            squad.attackTimer += dt;

            if (squad.attackTimer < squad.attackCooldownTime) {
                return;
            }

            const targetSquads = this.#getAttackableEnemySquads({
                attackerSquad: squad,
                squads: squads
            });

            const targetSquad = this.#getRandomElement(targetSquads);

            if (!targetSquad) {
                return;
            }

            const damages = squad.getAttackDamages();

            attacks.push(
                new Attack({
                    attackerSquadId: squad.squadId,
                    targetSquadId: targetSquad.squadId,
                    pos: {
                        x: squad.pos.x,
                        y: squad.pos.y
                    },
                    damages: damages
                })
            );

            squad.attackTimer = 0;
        });
    }

    updateAttacks({ dt, squads, attacks }) {
        attacks.forEach((attack) => {
            const targetSquad = squads.find(
                squad => squad.squadId === attack.targetSquadId
            );

            if (!targetSquad) {
                attack.finished = true;
                return;
            }

            attack.update({
                dt: dt,
                targetPos: {
                    x: targetSquad.pos.x,
                    y: targetSquad.pos.y
                }
            });

            if (attack.finished) {
                targetSquad.takeDamages(attack.damages);
            }
        });
    }

    updateTargets({ dt, squads }) {
        this.#updateEnemyTargets({
            dt: dt,
            squads: squads
        });
    }

    #getAttackableEnemySquads({ attackerSquad, squads }) {
        return squads.filter((targetSquad) => {
            if (targetSquad.faction === attackerSquad.faction) {
                return false;
            }

            const dx = targetSquad.pos.x - attackerSquad.pos.x;
            const dy = targetSquad.pos.y - attackerSquad.pos.y;

            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            return (distance <= attackerSquad.attackRange);
        });
    }

    #updateEnemyTargets({ dt, squads }) {
        const TARGET_SEARCH_INTERVAL = 2;

        this.enemyTargetTimer += dt;

        if (this.enemyTargetTimer < TARGET_SEARCH_INTERVAL) {
            return;
        }

        const playerSquads = squads.filter(
            squad => squad.faction === FACTION.PLAYER
        );

        const enemySquads = squads.filter(
            squad => squad.faction === FACTION.ENEMY
        );

        enemySquads.forEach((enemySquad) => {
            const targetSquad = this.#getNearestSquad({
                squads: playerSquads, 
                pos: enemySquad.pos
            });

            if (!targetSquad) {
                return;
            }

            enemySquad.setTargetPos(targetSquad.pos);
        });

        this.enemyTargetTimer = 0;
    }

    #getNearestSquad({ squads, pos }) {
        if (squads.length === 0) {
            return null;
        }

        let nearestSquad = null;
        let nearestDistance = Infinity;

        squads.forEach((squad) => {
            const dx = squad.pos.x - pos.x;
            const dy = squad.pos.y - pos.y;

            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestSquad = squad;
            }
        });

        return nearestSquad;
    }


    #getRandomElement(array) {
        if (array.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }
}

module.exports = CombatSystem;