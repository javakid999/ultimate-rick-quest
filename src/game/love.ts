import { Canvas } from "../api/canvas"
import { ParticleSystem } from "../api/particle"
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
    particleSystem: ParticleSystem

    constructor(position: number[], spriteName: string, assets: {[index: string]: HTMLImageElement}, imageSize: number[]) {
        super(position, assets[spriteName], imageSize);
        this.startPos = [...position]
        this.spriteName = spriteName
        this.state = 0
        this.timer = 2000
        this.contacted = false
        this.particleSystem = new ParticleSystem([this.position[0]+30, this.position[1]], [this.position[0]-120,this.position[1]-150,this.position[0]+200,this.position[1]+60], [10,10], 0, [-0.1,0.1,-0.5,0,-0.01,0.01], assets['heart'], 5)
        this.particleSystem.activate()
        this.trigger = new Trigger([this.position[0]-100,this.position[1]-100], [300,200], 'once')
    }

    render(canvas: Canvas, camera: number[]) {
        this.sprite.position = [this.position[0]-camera[0], this.position[1]-camera[1]]
        this.sprite.render(canvas.ctx, this.frame)
        this.particleSystem.render(canvas.ctx, camera)
    }

    update(deltaTime: number, timeActive: number, _bounds: number[], player: Player, _blocksTouching: number[][]) {
        this.particleSystem.update(deltaTime, timeActive)
        
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