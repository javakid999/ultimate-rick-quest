import { Trigger } from "../api/trigger"
import { Entity } from "./entity"
import { Player } from "./player"

export class LoveInterest extends Entity {
    startPos: number[]
    spriteName: string

    state: number
    timer: number
    contacted: boolean
    trigger: Trigger

    constructor(position: number[], spriteName: string, asset: HTMLImageElement, imageSize: number[]) {
        super(position, asset, imageSize);
        this.startPos = [...position]
        this.spriteName = spriteName
        this.state = 0
        this.timer = 2000
        this.contacted = false
        this.trigger = new Trigger([this.position[0]-100,this.position[1]-100], [300,200], 'once')
    }

    update(deltaTime: number, _bounds: number[], player: Player, _blocksTouching: number[][],) {
        this.trigger.collideRect([player.position[0],player.position[1],player.sprite.size[0],player.sprite.size[1]])
        if (!this.contacted) this.timer -= deltaTime
        if (this.timer < 0) {
            if (this.state == 0) {
                this.state = 1
                this.timer = 500
            } else if (this.state == 1) {
                this.state = 2
                this.timer = 500
            } else if (this.state == 2) {
                this.state = 0
                this.timer = 2000
            }
        }

        if (this.state == 0) {
            this.frame = Math.floor(this.timer/80)%6
        } else if (this.state == 1) {
            this.frame = 6
        } else if (this.state == 2) {
            this.frame = 7
        }

        if (this.trigger.triggered) { this.contacted = true; player.control = false; this.state = 2}
    }
}