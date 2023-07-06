import { Canvas } from "../api/canvas";
import { TilesetObject } from "../api/object";
import { Player } from "./player";

export abstract class Entity {
    sprite: TilesetObject
    velocity: number[]
    position: number[]
    frame: number

    constructor(position: number[], asset: HTMLImageElement, imageSize: number[]) {
        this.velocity = [0,0]
        this.position = position
        this.sprite = new TilesetObject(position, [60, 60], 0, asset, imageSize)
        this.frame = 0
    }

    render(canvas: Canvas, camera: number[]) {
        this.sprite.position = [this.position[0]-camera[0], this.position[1]-camera[1]]
        this.sprite.render(canvas.ctx, this.frame)
    }

    overlap(blocksTouching: number[][]) {
        const blocks = []
        for (let block of blocksTouching) {
            if (this.position[0] < block[0]+60 && this.position[0]+60 > block[0] && this.position[1] < block[1]+60 && this.position[1]+60 > block[1]) {
                blocks.push([...block])
            }
        }
        return blocks
    }

    collidingPlayer(position: number[]) {
        if (this.position[0] <= position[0]+60 && this.position[0]+60 >= position[0] && this.position[1] <= position[1]+60 && this.position[1]+60 >= position[1]) {
            return true
        }
        return false
    }

    update(_deltaTime: number, _timeActive: number, _bounds: number[], _player: Player, _blocksTouching?: number[][], _entitiesTouching?: number[][], _hazardsTouching?: number[][]) { }
}

export class Crate extends Entity {
    constructor(position: number[], asset: HTMLImageElement, imageSize: number[]) {
        super(position, asset, imageSize)
    }

    update(deltaTime: number, _timeActive: number, bounds: number[], player: Player, blocksTouching: number[][],) {
        this.velocity[0] *= 0.8
        this.velocity[1] += 0.05

        if (this.position[0] < bounds[0]) {
            this.position[0] = bounds[0]
            this.velocity[0] = 0
        } else if (this.position[0]+120 > bounds[0] + bounds[2]) {
            this.position[0] = bounds[0]+bounds[2]-120
            this.velocity[0] = 0
        } if (this.position[1] < bounds[1]) {
            this.position[1] = bounds[1]
            this.velocity[1] = 0
        } else if (this.position[1]+120 > bounds[1] + bounds[3]) {
            this.position[1] = bounds[1]+bounds[3]-120
            this.velocity[1] = 0
        } 

        const SUBSTEPS = 3
        for (let i = 0; i < SUBSTEPS; i++) {
            this.position[1] += this.velocity[1]*deltaTime/SUBSTEPS
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
                    this.velocity[0] = 0
                } else {
                    if (this.velocity[1] > 0) {
                        this.position[1] -= overlapy
                    } else {
                        this.position[1] += overlapy
                    }
                    this.velocity[1] = 0
                }
            }

            if (this.collidingPlayer(player.position)) {
                const overlapx = Math.max(0, Math.min(this.position[0]+60, player.position[0]+60) - Math.max(this.position[0], player.position[0]))
                const overlapy = Math.max(0, Math.min(this.position[1]+60, player.position[1]+60) - Math.max(this.position[1], player.position[1]))
                if (Math.abs(overlapx) < Math.abs(overlapy)) {
                    if (this.velocity[0] > 0) {
                        this.position[0] += overlapx
                    } else {
                        this.position[0] -= overlapx
                    }
                    this.velocity[0] = 0
                } else {
                    if (this.velocity[1] > 0) {
                        this.position[1] -= overlapy
                    } else {
                        this.position[1] += overlapy
                    }
                    this.velocity[1] = 0
                }
            }
        }
    }
}