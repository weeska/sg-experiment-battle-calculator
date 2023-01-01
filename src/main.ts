import { BattleCalculator } from "./battleCalculator";
import { Ship } from "./ships";

const calc = new BattleCalculator();

console.time('Calculate');
const result = calc.calculate(
    {
        heavy_fighter: 10,
        small_transporter: 1,
    },
    {
        light_fighter: 20,
        small_transporter: 3,
    }
);

console.timeEnd('Calculate');

console.log('A battle took place:')

console.log('Start:')
console.log('Attacker:');
console.log(Object.keys(result.start.attacker).map(type => console.log(type, result.start.attacker[type as Ship])).join('\n'));

console.log('Defender:');
console.log(Object.keys(result.start.defender).map(type => console.log(type, result.start.defender[type as Ship])).join('\n'));

for (const round in result.rounds) {
    console.log('Round', parseInt(round) + 1);
    console.log('Attacker:');
    console.log(Object.keys(result.rounds[round].attacker).map(type => console.log(type, result.rounds[round].attacker[type as Ship])).join('\n'));

    console.log('Defender:');
    console.log(Object.keys(result.rounds[round].defender).map(type => console.log(type, result.rounds[round].defender[type as Ship])).join('\n'));
}

console.log('Winner:', result.winner, 'after', result.rounds.length, 'rounds');