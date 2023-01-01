import { Fleet, FleetWithSpecs, Ship, ShipSpecProvider, ShipSpecs, ShipSpecsByType } from "./ships";

import * as _ from "lodash";

const SPECS: ShipSpecsByType = {
    battle_ship: { hull: 10000, shields: 5000, weapons: 2500 },
    light_fighter: { hull: 750, shields: 100, weapons: 1000 },
    heavy_fighter: { hull: 1000, shields: 250, weapons: 1500 },
    small_transporter: { hull: 750, shields: 250, weapons: 100 },
    large_transporter: { hull: 2000, shields: 1500, weapons: 200 },
    mothership: { hull: 1_000_000, shields: 250000, weapons: 100_000 },
};

const SPEC_PROVIDER = (ship: Ship) => SPECS[ship];

export function fight(attacker: ShipSpecs, target: ShipSpecs, reference: ShipSpecs) {
    if (attacker.weapons < (target.shields / 100)) {
        //Do nothing
    } else if (attacker.weapons < target.shields) {
        target.shields -= attacker.weapons;
    } else {
        target.hull -= (attacker.weapons - target.shields);
        target.shields = 0;
    }

    if (target.hull < reference.hull * 0.7) {
        const prob = 1 - target.hull / reference.hull;
        const rand = Math.random();
        if (rand < prob) {
            target.hull = 0;
        }
    }
}

export function toSpecs(fleet: Fleet, specs: ShipSpecProvider): FleetWithSpecs {
    //const specsForType = (type: Ship, count: number) => Array.from(Array(count)).map(_ => ({ ...specs[type] })); //takes double the time
    const specsForType = (type: Ship, count: number) => _.fill(Array(count), specs(type));
    return Object.keys(fleet).map(s => s as Ship).reduce((acc, s) => ({ ...acc, [s]: specsForType(s, fleet[s]!) }), {})
}

export function toFleet(fleetWithSpecs: FleetWithSpecs): Fleet {
    return Object.keys(fleetWithSpecs).map(s => s as Ship).reduce((acc, s) => ({ ...acc, [s]: fleetWithSpecs[s]!.length }), {})
}

export function isFleetEmpty(fleet: FleetWithSpecs) {
    const types = Object.keys(fleet) as Ship[];
    return 0 === types.reduce((acc: number, s: Ship) => acc + (fleet[s]?.length || 0), 0);
}

export type Winner = 'attacker' | 'defender' | 'draw';
export interface BattleRound {
    round: number,
    attacker: Fleet,
    defender: Fleet,
};
export interface BattleReport {
    winner: Winner,
    start: Omit<BattleRound, 'round'>,
    rounds: BattleRound[]
}

export class BattleCalculator {
    constructor(private readonly shipSpecProvider: ShipSpecProvider = SPEC_PROVIDER) { }

    calculate(attacker: Fleet, defender: Fleet): BattleReport {
        const attackerSpecs: FleetWithSpecs = toSpecs(attacker, this.shipSpecProvider);
        const defenderSpecs: FleetWithSpecs = toSpecs(defender, this.shipSpecProvider);

        const maxRounds = 6;
        const rounds: BattleRound[] = [];

        const start = {
            attacker: toFleet(attackerSpecs),
            defender: toFleet(defenderSpecs),
        };
        let round = 1;

        while (!isFleetEmpty(attackerSpecs) && !isFleetEmpty(defenderSpecs) && round <= maxRounds) {
            this.doBattle(attackerSpecs, defenderSpecs);
            this.doBattle(defenderSpecs, attackerSpecs);

            rounds.push(
                {
                    round,
                    attacker: toFleet(attackerSpecs),
                    defender: toFleet(defenderSpecs),
                }
            )

            this.resetShields(attackerSpecs);
            this.resetShields(defenderSpecs);

            round++;
        }

        return {
            start,
            winner: this.getResult(attackerSpecs, defenderSpecs),
            rounds,
        }
    }

    private doBattle(attackerSpecs: FleetWithSpecs, defenderSpecs: FleetWithSpecs) {
        for (const ship in attackerSpecs) {
            for (const attacker of attackerSpecs[ship as Ship]!) {
                const targetType = this.chooseTargetType(defenderSpecs);

                const defendersOfType = defenderSpecs[targetType] || [];
                const defenderIdx = Math.floor((Math.random() * defendersOfType.length));
                const defender = defendersOfType[defenderIdx];

                if (defender) {
                    fight(attacker, defender, this.shipSpecProvider(targetType));

                    if (defender.hull <= 0 && defendersOfType.length > 0) {
                        defendersOfType[defenderIdx] = defendersOfType[defendersOfType.length - 1];
                        defendersOfType.length--;
                    }
                }
            }
        }
    }

    private getResult(attacker: FleetWithSpecs, defender: FleetWithSpecs): Winner {
        const attackerFleetEmpty = isFleetEmpty(attacker);
        const defenderFleetEmpty = isFleetEmpty(defender);

        if (!attackerFleetEmpty && !defenderFleetEmpty) {
            return 'draw';
        }

        if (attackerFleetEmpty) {
            return 'defender';
        }

        return 'attacker';
    }

    private chooseTargetType(fleet: FleetWithSpecs): Ship {
        const types = (Object.keys(fleet) as Ship[]).filter(t => fleet[t]!.length > 0);
        return types[Math.floor((Math.random() * types.length))];
    }

    private resetShields(fleet: FleetWithSpecs) {
        for (const ship in fleet) {
            const shipType: Ship = ship as Ship;
            const shields = this.shipSpecProvider(shipType).shields;
            for (const spec of fleet[shipType]!) {
                spec.shields = shields;
            }
        }
    }
}
