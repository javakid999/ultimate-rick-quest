import { Entity } from "./entity";
import { Player } from "./player";

export class Enemy extends Entity {
    type: string
    startVel: number[]
    startPos: number[]
    spriteName: string

    constructor(position: number[], spriteName: string, asset: HTMLImageElement, imageSize: number[], type: string, startVel: number[]) {
        super(position, asset, imageSize);
        this.type = type
        this.startPos = [...position]
        this.startVel = startVel
        this.spriteName = spriteName
        this.velocity = [...startVel]  
    }

    update(deltaTime: number, bounds: number[], _player: Player, blocksTouching: number[][],) {

        if (this.position[0] < bounds[0]) {
            this.position[0] = bounds[0]
        } else if (this.position[0]+120 > bounds[0] + bounds[2]) {
            this.position[0] = bounds[0]+bounds[2]-120
        } if (this.position[1] < bounds[1]) {
            this.position[1] = bounds[1]
            this.velocity[1] = 0
        } else if (this.position[1]+120 > bounds[1] + bounds[3]) {
            this.position[1] = bounds[1]+bounds[3]-120
            this.velocity[1] = 0
        } 

        const SUBSTEPS = 3
        for (let i = 0; i < SUBSTEPS; i++) {
            this.position[0] += this.velocity[0]*deltaTime/SUBSTEPS

            const collidingTiles = this.overlap(blocksTouching)
            for (let tile of collidingTiles) {
                const overlapx = Math.max(0, Math.min(this.position[0]+60, tile[0]+tile[2]) - Math.max(this.position[0], tile[0]))
                const overlapy = Math.max(0, Math.min(this.position[1]+60, tile[1]+tile[3]) - Math.max(this.position[1], tile[1]))
                if (Math.abs(overlapx) < Math.abs(overlapy)) {
                    if (this.velocity[0] > 0) {
                        this.position[0] -= overlapx
                    } else {
                        this.position[0] += overlapx
                    }
                    this.frame++
                    if (this.frame > 1) this.frame = 0
                    this.velocity[0] *= -1
                    break;
                }
            }
        }
    }
}