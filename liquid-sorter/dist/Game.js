"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Tube_1 = require("./Tube");
class Game {
    constructor(initial, maxVolume, maxSteps = 10000) {
        this.moves = [];
        this.tubes = initial.map(arr => new Tube_1.Tube(arr, maxVolume));
        this.maxSteps = maxSteps;
    }
    isSolved() {
        return this.tubes.every(t => t.isEmpty() || t.isSingleColorFilled());
    }
    possibleMoves() {
        const moves = [];
        for (let from = 0; from < this.tubes.length; from++) {
            for (let to = 0; to < this.tubes.length; to++) {
                if (from === to)
                    continue;
                if (this.tubes[from].canPourTo(this.tubes[to])) {
                    moves.push([from, to]);
                }
            }
        }
        return moves;
    }
    solve() {
        let step = 0;
        while (!this.isSolved() && step < this.maxSteps) {
            const moves = this.possibleMoves();
            if (moves.length === 0)
                break; // dead-end
            // Простейший случай — случайный ход, можно улучшить.
            const [from, to] = moves[Math.floor(Math.random() * moves.length)];
            this.tubes[from].pourTo(this.tubes[to]);
            this.moves.push([from, to]);
            step++;
        }
        return this.moves;
    }
}
exports.Game = Game;
