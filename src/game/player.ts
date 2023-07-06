import { TilesetObject } from "../api/object";

export class Player {
    position: number[]
    velocity: number[]
    startPos: number[]
    score: number
    frame: number
    onGround: boolean
    control: boolean
    sprite: TilesetObject
    moving: {[index: string]: boolean}

	constructor(asset: HTMLImageElement, position: number[]) {
		this.position = position;
        this.startPos = [0,0]
		this.sprite = new TilesetObject(this.position, [60, 60], 0, asset, [20,20]);
        this.score = 0;
        this.onGround = false;
        this.control = true
		this.velocity = [0,0];
        this.frame = 0
        this.moving = {
            left: false,
            right: false,
            up: false
        }
    }

    render(ctx: CanvasRenderingContext2D, camera: number[]) {
        this.sprite.position = [this.position[0]-camera[0], this.position[1]-camera[1]]
        this.sprite.render(ctx, this.frame);
    }

    overlap(blocksTouching: number[][]) {
        const blocks = []
        for (let block of blocksTouching) {
            if (block[4] != 2) {
                if (this.position[0] < block[0]+block[2] && this.position[0]+60 > block[0] && this.position[1] < block[1]+block[3] && this.position[1]+60 > block[1]) {
                    blocks.push([...block])
                }
            } else {
                if (this.position[0] < block[0]+block[2] && this.position[0]+60 > block[0] && this.position[1]+30 < block[1]+block[3] && this.position[1]+60 > block[1]) {
                    blocks.push([...block])
                }
            }
            
        }
        return blocks
    }

    respawn() {
        this.position = [...this.startPos]
        this.velocity = [0,0]
    }



    update(deltaTime: number, blocksTouching: number[][], hazardsTouching: number[][], entitiesTouching: number[][], bounds: number[], timeActive: number) {
        this.velocity[0] *= 0.8
        this.velocity[1] += 0.05
        if (this.control) {
            if (this.moving['up'] && this.onGround) this.velocity[1] = -1.05
            if (this.moving['left']) {
                this.velocity[0] -= 0.1
                this.frame = 7
            }
            if (this.moving['right']) {
                this.velocity[0] += 0.1
                this.frame = 6
            }
            if (!(this.moving['right'] || this.moving['left']) || this.moving['right'] && this.moving['left']) {
                this.frame = Math.floor(timeActive/60)%6
            }
        }
        this.onGround = false

        const SUBSTEPS = 3
        for (let i = 0; i < SUBSTEPS; i++) {
            this.position[1] += this.velocity[1]*deltaTime/SUBSTEPS
            this.position[0] += this.velocity[0]*deltaTime/SUBSTEPS

            const collidingHazards = this.overlap(hazardsTouching)
            if (collidingHazards.length > 0) this.respawn()

            const collidingEntities = this.overlap(entitiesTouching)
            for (let tile of collidingEntities) {
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
                        this.onGround = true
                    } else {
                        this.position[1] += overlapy
                    }
                    this.velocity[1] = 0
                }
            }

            const collidingTiles = this.overlap(blocksTouching)
            for (let tile of collidingTiles) {
                const overlapx = Math.max(0, Math.min(this.position[0]+60, tile[0]+tile[2]-2) - Math.max(this.position[0], tile[0]))
                const overlapy = Math.max(0, Math.min(this.position[1]+60, tile[1]+tile[3]) - Math.max(this.position[1], tile[1]))
                if (tile[4] == 2) {
                    if (this.velocity[1] > 0) {
                        this.position[1] -= overlapy
                        this.onGround = true
                        this.velocity[1] = 0
                    }
                } else if (tile[4] == 3) {
                    this.velocity[1] -= 0.015
                    this.onGround = true
                } else {
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
                            this.onGround = true
                        } else {
                            this.position[1] += overlapy
                        }
                        this.velocity[1] = 0
                    }
                }
            }
        }

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
            this.respawn()
        } 
    }

	old_update(deltaTime: number, blocksTouching: number[][], _hazardsTouching: number[][], _entitiesTouching: number[][], bounds: number[], timeActive: number) {
        this.velocity[0] *= 0.8
        this.velocity[1] += 0.05

        if (this.moving['up'] && this.onGround) this.velocity[1] = -1
        if (this.moving['left']) {
            this.velocity[0] -= 0.1
            this.frame = 7
        }
        if (this.moving['right']) {
            this.velocity[0] += 0.1
            this.frame = 6
        }
        if (!(this.moving['right'] || this.moving['left']) || this.moving['right'] && this.moving['left']) {
            this.frame = Math.floor(timeActive/60)%6
        }

        const newPosition = [this.position[0]+this.velocity[0]*deltaTime, this.position[1]+this.velocity[1]*deltaTime]

        this.position[1] += this.velocity[1]*deltaTime
        let blocks = this.overlap(blocksTouching)
        this.onGround = false;
        for (let block of blocks) {
            if (this.velocity[1] > 0) {
                newPosition[1] = block[1]-60
                this.onGround = true;
            } else if (this.velocity[1] <= 0) {
                newPosition[1] = block[1]+60
            }
        }
        this.position[1] -= this.velocity[1]*deltaTime
        if (blocks.length > 0) this.velocity[1] = 0;

        this.position[0] += this.velocity[0]*deltaTime
        blocks = this.overlap(blocksTouching)
        for (let block of blocks) {
            if  (this.velocity[0] < 0) {
                newPosition[0] = block[0]+62
            } else if (this.velocity[0] >= 0) {
                newPosition[0] = block[0]-60
            }
        }
        if (blocks.length > 0) this.velocity[0] = 0
        this.position[0] -= this.velocity[0]*deltaTime

        this.position = [...newPosition]

        if (this.position[0] < bounds[0]) {
            this.position[0] = bounds[0]
            this.velocity[0] = 0
        } else if (this.position[0] > bounds[0] + bounds[2]) {
            this.position[0] = bounds[0]+bounds[2]
            this.velocity[0] = 0
        } if (this.position[1] < bounds[1]) {
            this.position[1] = bounds[1]
            this.velocity[1] = 0
        } else if (this.position[1] > bounds[1] + bounds[3]) {
            this.position[1] = bounds[1]+bounds[3]
            this.velocity[1] = 0
        } 
	}
}
