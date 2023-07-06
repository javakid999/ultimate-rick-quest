export class GameObject {
    position: number[]
    size: number[]
    image: HTMLImageElement
    angle: number

    constructor(position: number[], size: number[], angle: number, image: HTMLImageElement) {
        this.position = position
        this.size = size
        this.angle = angle
        this.image = image
    }
    
    render(ctx: CanvasRenderingContext2D, _frame?: any) {
        ctx.save()
        ctx.translate((this.position[0] * 2 + this.size[0])/2, (this.position[1] * 2 + this.size[1])/2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
        ctx.restore();
    }

    update(_deltaTime: number) { } 
}

export class TilesetObject extends GameObject {
    image: HTMLImageElement
    imageSize: number[]
    frame: number

    constructor(position: number[], size: number[], angle: number, image: HTMLImageElement, imageSize: number[]) {
        super(position, size, angle, image);
        this.image = image
        this.imageSize = imageSize
        this.frame = 0
    }

    render(ctx: CanvasRenderingContext2D, frame: number) {
        ctx.save()
        ctx.translate((this.position[0] * 2 + this.size[0])/2, (this.position[1] * 2 + this.size[1])/2);
        ctx.rotate(this.angle);
        const numImagesHoriz = this.image.width/this.imageSize[0]
        const numImagesVert = this.image.height/this.imageSize[1]
        ctx.drawImage(this.image, (frame%numImagesHoriz)*this.imageSize[0], (Math.floor(frame/numImagesHoriz)%numImagesVert)*this.imageSize[1], this.imageSize[0], this.imageSize[1], this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
        ctx.restore();
    }

    update(_deltaTime: number) { } 
}

export class SpritesheetObject extends GameObject {
    images: HTMLImageElement[]
    spritesheets: {[index: string]: number[]}[]

    constructor(position: number[], size: number[], angle: number, images: HTMLImageElement[], spritesheets: {[index: string]: number[]}[]) {
        super(position, size, angle, images[0]);
        this.images = images
        this.spritesheets = spritesheets
    }

    render(ctx: CanvasRenderingContext2D, frame: string, spritesheet?: number) {
        if (spritesheet == undefined) spritesheet = 0
        ctx.save()
        ctx.translate((this.position[0] * 2 + this.spritesheets[spritesheet][frame][4])/2, (this.position[1] * 2 + this.spritesheets[spritesheet][frame][5])/2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.images[spritesheet], this.spritesheets[spritesheet][frame][0], this.spritesheets[spritesheet][frame][1], this.spritesheets[spritesheet][frame][2], this.spritesheets[spritesheet][frame][3], this.spritesheets[spritesheet][frame][4]/-2, this.spritesheets[spritesheet][frame][5]/-2, this.spritesheets[spritesheet][frame][4], this.spritesheets[spritesheet][frame][5]);
        ctx.restore();
    }

    update(_deltaTime: number) { } 
}

export class ScrollingBackground {
    position: number[]
    size: number[]
    speed: number
    image: HTMLImageElement

    constructor(position: number[], size: number[], speed: number, image: HTMLImageElement) {
        this.position = position
        this.size = size
        this.speed = speed
        this.image = image
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < Math.ceil(1000/this.size[0])+1; i++) {
            const numImages = (Math.ceil(1000/this.size[0])+1)*this.size[0];
            ctx.drawImage(this.image, (((this.position[0]+this.size[0]*i) % numImages) + numImages) % numImages - this.size[0], this.position[1], this.size[0], this.size[1]);
        }
    }

    update(camera: number[]) {
        this.position[0] = camera[0]*this.speed%this.size[0]
    }

    updateAuto(deltaTime: number) {
        this.position[0] += deltaTime*this.speed
    }
}