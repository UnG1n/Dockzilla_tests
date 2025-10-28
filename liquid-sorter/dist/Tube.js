"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tube = void 0;
class Tube {
    constructor(contents, maxVolume) {
        this.contents = contents.slice();
        this.maxVolume = maxVolume;
    }
    isEmpty() {
        return this.contents.length === 0;
    }
    spaceLeft() {
        return this.maxVolume - this.contents.length;
    }
    topColor() {
        return this.isEmpty() ? null : this.contents[this.contents.length - 1];
    }
    topColorCount() {
        if (this.isEmpty())
            return 0;
        const top = this.topColor();
        let count = 0;
        for (let i = this.contents.length - 1; i >= 0; i--) {
            if (this.contents[i] === top)
                count++;
            else
                break;
        }
        return count;
    }
    canPourTo(target) {
        if (this.isEmpty())
            return false;
        if (target.spaceLeft() === 0)
            return false;
        const myTop = this.topColor();
        const targetTop = target.topColor();
        return target.isEmpty() || myTop === targetTop;
    }
    pourTo(target) {
        if (!this.canPourTo(target))
            return false;
        const num = Math.min(this.topColorCount(), target.spaceLeft());
        for (let i = 0; i < num; i++) {
            target.contents.push(this.contents.pop());
        }
        return true;
    }
    isSingleColorFilled() {
        if (this.contents.length !== this.maxVolume)
            return false;
        return this.contents.every(c => c === this.contents[0]);
    }
}
exports.Tube = Tube;
