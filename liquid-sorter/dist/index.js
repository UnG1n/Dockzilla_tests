"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Тестовый запуск index.ts: файл выполняется!");
const Game_1 = require("./Game");
const initial = [
    ["R", "G", "G", "B"],
    ["G", "R", "B", "B"],
    ["B", "R", "R", "G"],
    [],
    [],
    []
];
const maxVolume = 4;
const game = new Game_1.Game(initial, maxVolume);
const moves = game.solve();
console.log("Sequence of moves:");
moves.forEach(([from, to], idx) => {
    process.stdout.write(`(${from},${to}) `);
    if ((idx + 1) % 8 === 0)
        process.stdout.write("\n");
});
console.log("\nFinal state:");
game.tubes.forEach((t, i) => {
    console.log(`Tube ${i}: [${t.contents.join(",")}]`);
});
