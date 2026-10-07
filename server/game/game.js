
const { FACTION, UNIT } = require('./constants.js');
const Squad = require('./squad.js');
const Attack = require('./attack.js');


class Game {
    width;
    height;
    spawnPos;

    time;
    enemySpawnTimer;
    targetSearchTimer;
    squadCounter;

    squads;
    attacks;
    effects;

    constructor() {
        this.width = 800;
        this.height = 600;
        this.spawnPos = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.time = 0;
        this.enemySpawnTimer = 0;
        this.targetSearchTimer = 0;
        this.squadCounter = 0;

        this.squads = [];
        this.attacks = [];
        this.effects = [];
    }

    addSquad({ playerId, squadId, faction, spawnPos, unitList }) {
        this.squads.push(
            new Squad({
                playerId: playerId,
                squadId: squadId,
                faction: faction,
                spawnPos: spawnPos,
                unitList: unitList
            })
        );
    }

    removeSquad({ squadId }) {
        this.squads = this.squads.filter(squad => squad.squadId !== squadId);
    }

    addPlayer({ playerId }) {
        const defaultUnitList = [
            { type: UNIT.GOBLIN, count: 8 }
        ];
        this.addSquad({
            playerId: playerId,
            squadId: this.squadCounter,
            faction: FACTION.PLAYER,
            spawnPos: this.spawnPos,
            unitList: defaultUnitList
        });
        this.squadCounter++;
    }

    addEnemy() {
        const spawnPos = {
            x: Math.random() * this.width,
            y: 0
        };

        const unitList = [
            { type: UNIT.GOBLIN, count: 2 }
        ];

        this.addSquad({
            playerId: null,
            squadId: this.squadCounter,
            faction: FACTION.ENEMY,
            spawnPos: spawnPos,
            unitList: unitList
        });
        this.squadCounter++;
    }

    setTargetPos({ playerId, targetPos }) {
        const squad = this.squads.find(
            squad => squad.playerId === playerId
        );

        if (!squad) return;

        squad.setTargetPos(targetPos);
    }

    spawnEnemy() {
        if (this.enemySpawnTimer < 5) {
            return;
        }
        const enemyCount = this.squads.filter(squad => squad.faction === FACTION.ENEMY).length;
        if (enemyCount >= 5) {
            return;
        }

        this.addEnemy();
        this.enemySpawnTimer = 0;

    }

    getNearestPlayerSquad({ pos }) {
        const playerSquads = this.squads.filter(
            squad => squad.faction === FACTION.PLAYER
        );

        if (playerSquads.length === 0) {
            return null;
        }

        let nearestSquad = null;
        let nearestDistance = Infinity;

        playerSquads.forEach((squad) => {
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

    updateEnemyTargets() {
        if (this.targetSearchTimer < 1) {
            return;
        }

        const enemySquads = this.squads.filter(
            squad => squad.faction === FACTION.ENEMY
        );

        enemySquads.forEach((enemySquad) => {
            const targetSquad = this.getNearestPlayerSquad({
                pos: enemySquad.pos
            });

            if (!targetSquad) {
                return;
            }

            enemySquad.setTargetPos(targetSquad.pos);
        });

        this.targetSearchTimer = 0;
    }

    getAttackableEnemySquads({ squad }) {
        return this.squads.filter((targetSquad) => {
            if (targetSquad.faction === squad.faction) {
                return false;
            }

            const dx = targetSquad.pos.x - squad.pos.x;
            const dy = targetSquad.pos.y - squad.pos.y;

            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            return (distance <= squad.attackRange);
        });
    }

    getRandomElement(array) {
        if (array.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    updateCombat({ dt }) {
        this.squads.forEach((squad) => {
            squad.attackTimer += dt;

            if (squad.attackTimer < squad.attackCooldownTime) {
                return;
            }

            const targetSquads = this.getAttackableEnemySquads({
                squad: squad
            });

            const targetSquad = this.getRandomElement(targetSquads);

            if (!targetSquad) {
                return;
            }

            const damages = squad.getAttackDamages();

            this.attacks.push(
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

    update({ dt }) {
        this.time += dt;
        this.enemySpawnTimer += dt;
        this.targetSearchTimer += dt;

        this.squads.forEach((squad) => {
            squad.update({ dt: dt });
        });

        this.updateCombat({ dt: dt });

        this.attacks.forEach((attack) => {
            const targetSquad = this.squads.find(
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
                if (targetSquad.units.length === 0) {
                    this.removeSquad({
                        squadId: targetSquad.squadId
                    });
                }
            }
        });

        this.attacks = this.attacks.filter(
            attack => !attack.finished
        );

        this.spawnEnemy();
        this.updateEnemyTargets();
    }

    getState() {
        return {
            time: this.time,
            squads: this.squads,
            attacks: this.attacks
        };
    }
}


module.exports = Game;