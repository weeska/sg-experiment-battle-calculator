import * as chai from 'chai';
import * as _ from 'lodash';
import { BattleCalculator, fight, isFleetEmpty, toFleet, toSpecs } from "../src/battleCalculator";

describe('fight', () => {

    const dummySpecProvider = () => ({ hull: 1, weapons: 1, shields: 1});

    it('toSpecs', () => {
        const specs = toSpecs({ small_transporter: 1000, mothership: 5 }, dummySpecProvider);

        chai.assert.equal(specs.small_transporter!.length, 1000);
        chai.assert.equal(specs.mothership!.length, 5);
    })

    it('toFleet', () => {
        const specs = {
            small_transporter: _.fill(Array(100), { weapons: 1, hull: 2, shields: 3 }),
        }

        const fleet1 = toFleet(specs);

        chai.assert.equal(fleet1.small_transporter, 100);

        specs.small_transporter.length--;
        const fleet2 = toFleet(specs);

        chai.assert.equal(fleet2.small_transporter, 99);
    })

    it('shields absorb weapons completely', () => {
        const attacker = {
            weapons: 9,
            hull: 1,
            shields: 1,
        };

        const defender = {
            weapons: 1,
            hull: 1,
            shields: 1000,
        };

        fight(attacker, defender, defender);

        chai.assert.equal(defender.shields, 1000);
    })

    it('shields absorb partial weapons damage', () => {
        const attacker = {
            weapons: 15,
            hull: 1,
            shields: 1,
        };

        const defender = {
            weapons: 1,
            hull: 1,
            shields: 100,
        };

        fight(attacker, defender, defender);

        chai.assert.equal(defender.shields, 85);
    })

    it('weapons exhaust shield and damage hull', () => {
        const attacker = {
            weapons: 115,
            hull: 1,
            shields: 1,
        };

        const defender = {
            weapons: 1,
            hull: 120,
            shields: 100,
        };

        fight(attacker, defender, defender);

        chai.assert.equal(defender.shields, 0);
        chai.assert.equal(defender.hull, 105);
    })
});

describe('Battles', () => {
    it('isFleetEmpty', () => {
        const specs = {
            light_fighter:
                [{
                    weapons: 1,
                    hull: 1,
                    shields: 1,
                }]
        };

        chai.assert.isTrue(isFleetEmpty({
            small_transporter: []
        }));

        chai.assert.isFalse(isFleetEmpty(specs));

        specs.light_fighter.length--;

        chai.assert.isTrue(isFleetEmpty(specs));
    })

    it('Attacker wins', () => {
        const calc = new BattleCalculator();

        chai.assert.equal(calc.calculate({ light_fighter: 1 }, { small_transporter: 1 }).winner, 'attacker');
    })

    it('Defender wins', () => {
        const calc = new BattleCalculator();

        chai.assert.equal(calc.calculate({ small_transporter: 1 }, { light_fighter: 1 }).winner, 'defender');
    })

    it('Large Battle Performance', () => {
        const calc = new BattleCalculator();

        const start = Date.now();

        calc.calculate({ heavy_fighter: 1000000 }, { heavy_fighter: 1000000 });

        const end = Date.now();

        chai.assert.isAtMost(end - start, 1500);
    })
});