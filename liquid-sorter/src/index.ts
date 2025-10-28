console.log("Тестовый запуск index.ts: файл выполняется!");

import { Game } from "./Game";

const initial: string[][] = [
  ["R", "G", "G", "B"],
  ["G", "R", "B", "B"],
  ["B", "R", "R", "G"],
  [],
  [],
  []
];

const maxVolume = 4;
const game = new Game(initial, maxVolume);
const moves = game.solve();

console.log("Sequence of moves:");
moves.forEach(([from, to]: [number, number], idx: number) => {
  process.stdout.write(`(${from},${to}) `);
  if ((idx + 1) % 8 === 0) process.stdout.write("\n");
});
console.log("\nFinal state:");
game.tubes.forEach((t: any, i: number) => {
  console.log(`Tube ${i}: [${t.contents.join(",")}]`);
});
