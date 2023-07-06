
export class ParticleSystem {
    position: number[]
    size: number[]
    num: number
    color: HTMLImageElement
    rate: number

    gravity: number
    bounds: number[]
    velocity: number[]
    startTime: number
    activated: boolean
    sprites: number[][]

    constructor(position: number[], bounds: number[], size: number[], num: number, velocity: number[], image: HTMLImageElement, rate: number = -1) {
        this.gravity = 0.001;
        this.position = position;
        this.color = image;
        this.size = size;
        //minx max miny maxy mina, maxa
        this.velocity = velocity;
        this.num = num;
        this.startTime = -1;
        this.activated = false;
        this.sprites = [];
        this.rate = rate
        this.bounds = bounds

        for (let i = 0; i < this.num; i++) {
            this.sprites.push([this.position[0], this.position[1], this.velocity[0]+Math.random()*(this.velocity[1]-this.velocity[0]), this.velocity[2]+Math.random()*(this.velocity[3]-this.velocity[2]), 0, this.velocity[4]+Math.random()*(this.velocity[5]-this.velocity[4])]);
        }
    }
  
    activate() {
        if (this.activated) return;
        this.activated = true;
        this.startTime = performance.now();
    }
    
    update(deltaTime: number, timeActive: number) {
        if (!this.activated) return;
        this.sprites.forEach((sprite) => {
            sprite[3] += this.gravity * deltaTime;
            sprite[0] += sprite[2] * deltaTime;
            sprite[1] += sprite[3] * deltaTime;
            sprite[4] += sprite[5] * deltaTime;
        });

        if (timeActive % this.rate == 0 && this.rate != -1) {
            this.sprites.push([this.position[0], this.position[1], this.velocity[0]+Math.random()*(this.velocity[1]-this.velocity[0]), this.velocity[2]+Math.random()*(this.velocity[3]-this.velocity[2]), 0, this.velocity[4]+Math.random()*(this.velocity[5]-this.velocity[4])]);
        }
    }
  
    render(ctx: CanvasRenderingContext2D, camera: number[]) {
        if (this.activated) {
            this.sprites.forEach((sprite, i) => {
                ctx.save()
                ctx.translate((sprite[0] * 2 + this.size[0])/2 - camera[0], (sprite[1] * 2 + this.size[1])/2 - camera[1]);
                ctx.rotate(sprite[4]);
                ctx.drawImage(this.color, this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
                ctx.restore();
                if (sprite[0] > this.bounds[2] || sprite[0] < this.bounds[0]) this.sprites.splice(i, 1)
                if (sprite[1] > this.bounds[3] || sprite[1] < this.bounds[1]) this.sprites.splice(i, 1)
            });
        }
    }
  }