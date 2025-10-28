export class Tube {
    contents: string[];
    readonly maxVolume: number;
  
    constructor(contents: string[], maxVolume: number) {
      this.contents = contents.slice();
      this.maxVolume = maxVolume;
    }
  
    isEmpty(): boolean {
      return this.contents.length === 0;
    }
  
    spaceLeft(): number {
      return this.maxVolume - this.contents.length;
    }
  
    topColor(): string | null {
      return this.isEmpty() ? null : this.contents[this.contents.length - 1];
    }
  
    topColorCount(): number {
      if (this.isEmpty()) return 0;
      const top = this.topColor();
      let count = 0;
      for (let i = this.contents.length - 1; i >= 0; i--) {
        if (this.contents[i] === top) count++;
        else break;
      }
      return count;
    }
  
    canPourTo(target: Tube): boolean {
      if (this.isEmpty()) return false;
      if (target.spaceLeft() === 0) return false;
      const myTop = this.topColor();
      const targetTop = target.topColor();
      return target.isEmpty() || myTop === targetTop;
    }
  
    pourTo(target: Tube): boolean {
      if (!this.canPourTo(target)) return false;
      const num = Math.min(this.topColorCount(), target.spaceLeft());
      for (let i = 0; i < num; i++) {
        target.contents.push(this.contents.pop() as string);
      }
      return true;
    }
  
    isSingleColorFilled(): boolean {
      if (this.contents.length !== this.maxVolume) return false;
      return this.contents.every(c => c === this.contents[0]);
    }
  }
  