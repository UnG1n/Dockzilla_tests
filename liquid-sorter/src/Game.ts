import { Tube } from "./Tube";

export class Game {
  tubes: Tube[];
  moves: Array<[number, number]> = [];
  readonly maxSteps: number;

  constructor(initial: string[][], maxVolume: number, maxSteps = 10000) {
    this.tubes = initial.map(arr => new Tube(arr, maxVolume));
    this.maxSteps = maxSteps;
  }

  isSolved(): boolean {
    return this.tubes.every(
      t => t.isEmpty() || t.isSingleColorFilled()
    );
  }

  possibleMoves(): Array<[number, number]> {
    const moves: Array<[number, number]> = [];
    for (let from = 0; from < this.tubes.length; from++) {
      for (let to = 0; to < this.tubes.length; to++) {
        if (from === to) continue;
        if (this.tubes[from].canPourTo(this.tubes[to])) {
          moves.push([from, to]);
        }
      }
    }
    return moves;
  }

  solve(): Array<[number, number]> {
    let step = 0;
    while (!this.isSolved() && step < this.maxSteps) {
      const moves = this.possibleMoves();
      if (moves.length === 0) break; // dead-end
      // Простейший случай — случайный ход, можно улучшить.
      const [from, to] = moves[Math.floor(Math.random() * moves.length)];
      this.tubes[from].pourTo(this.tubes[to]);
      this.moves.push([from, to]);
      step++;
    }
    return this.moves;
  }
}
