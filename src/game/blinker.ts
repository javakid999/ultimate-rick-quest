import { Entity } from "./entity";
import { Player } from "./player";

export class Blinker extends Entity {
    startPos: number[]
    spriteName: string
    onTime: number
    numStates: number
    
    state: number
    activeState: number

    timer: number
    stalling: boolean

    constructor(position: number[], spriteName: string, asset: HTMLImageElement, imageSize: number[], onTime: number, numStates: number, state: number) {
        super(position, asset, imageSize);
        this.startPos = [...position]
        this.onTime = onTime
        this.numStates = numStates
        this.state = state
        this.activeState = 0
        this.spriteName = spriteName
        this.timer = onTime
        this.stalling = false
    }

    collidingPlayer(position: number[]) {
        return (this.position[0]+4 <= position[0]+60 && this.position[0]+56 >= position[0] && this.position[1]+2 <= position[1]+60 && this.position[1]+58 >= position[1])

    }

    update(deltaTime: number, _timeActive: number, _bounds: number[], player: Player, _blocksTouching: number[][],) {
        this.timer -= deltaTime
        if (this.timer < 0) {
            this.timer = this.onTime;
            this.activeState++; 
            if (this.activeState >= this.numStates) {
                this.activeState = 0
            }
            this.stalling = this.collidingPlayer(player.position) && this.state == this.activeState
        }
        
        if (!this.collidingPlayer(player.position)) this.stalling = false
        
        if (!this.collidingPlayer(player.position) && this.state == this.activeState) {
            this.frame = this.state*2
        } else {
            this.frame = this.state*2+1
        }
    }
}