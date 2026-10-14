
const Squad = require('./entities/squad.js');
const Attack = require('./entities/attack.js');
const BattleMap = require('./world/battle-map.js');

const MoveSystem = require('./systems/move-system.js');
const VisionSystem = require('./systems/vision-system.js');
const CombatSystem = require('./systems/combat-system.js');

const { FACTION, UNIT } = require('./constants.js');


class Game {
    gameTime;
    enemySpawnTimer;
    squadCounter;

    battleMap;
    squads;
    attacks;
    effects;

    moveSystem;
    visionSystem;
    combatSystem;

    constructor() {
        this.battleMap = new BattleMap();

        this.moveSystem = new MoveSystem();
        this.visionSystem = new VisionSystem();
        this.combatSystem = new CombatSystem();

        this.time = 0;
        this.enemySpawnTimer = 0;
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
            spawnPos: this.battleMap.spawnPos,
            unitList: defaultUnitList
        });
        this.squadCounter++;
    }

    addEnemy() {
        const spawnPos = {
            x: Math.random() * this.battleMap.width,
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





    update({ dt }) {
        this.time += dt;

        this.moveSystem.updateMove({
            dt: dt,
            squads: this.squads,
            attacks: this.attacks
        });

        this.visionSystem.updateVision({
            squads: this.squads,
            battleMap: this.battleMap
        });

        this.combatSystem.createAttacks({
            dt: dt,
            squads: this.squads,
            attacks: this.attacks
        });

        this.combatSystem.updateAttacks({
            squads: this.squads,
            attacks: this.attacks
        });

        this.#cleanUp();

        this.#spawnEnemy({ dt: dt });

        this.combatSystem.updateTargets({
            dt: dt,
            squads: this.squads
        });
    }

    setTargetPos({ playerId, targetPos }) {
        const squad = this.squads.find(
            squad => squad.playerId === playerId
        );

        if (!squad) return;

        squad.setTargetPos(targetPos);
    }

    getState() {
        return {
            time: this.time,
            battleMap: this.battleMap,
            squads: this.squads,
            attacks: this.attacks,
            effects: this.effects
        };
    }

    #cleanUp() {
        this.squads = this.squads.filter(
            squad => !squad.isDead()
        );

        this.attacks = this.attacks.filter(
            attack => !attack.finished
        );
    }

    #spawnEnemy({ dt: dt }) {
        const MAX_ENEMY_COUNT = 5;
        const ENEMY_SPAWN_INTERVAL = 10;

        this.enemySpawnTimer += dt;

        if (this.enemySpawnTimer < ENEMY_SPAWN_INTERVAL) {
            return;
        }
        const enemyCount = this.squads.filter(squad => squad.faction === FACTION.ENEMY).length;
        if (enemyCount >= MAX_ENEMY_COUNT) {
            return;
        }

        this.addEnemy();
        this.enemySpawnTimer = 0;
    }
}


module.exports = Game;