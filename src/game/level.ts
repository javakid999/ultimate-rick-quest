import { Player } from "./player"
import { Canvas } from "../api/canvas"
import { ScrollingBackground, SpritesheetObject, TilesetObject } from "../api/object"
import { download } from "../utils/download"
import decorDaySpritesheet from '../assets/images/decor-day-spritesheet.json'
import decorNightSpritesheet from '../assets/images/decor-night-spritesheet.json'
import decorJungleSpritesheet from '../assets/images/decor-jungle.json'
import { Enemy } from "./enemy"
import { Blinker } from "./blinker"
import { LoveInterest } from "./love"

interface Tile {
    tileset: number
    texture: number
    collides: number
    hazard?: boolean
}

interface Decor {
    position: number[]
    texture: string
    sheet?: number
}

type EntityObject = {
    type: string
    sprite: string
    imageSize: number[]
}

interface EnemyObject extends EntityObject {
    type: "enemy"
    startPos: number[]
    startVel: number[]
}

interface BlinkerObject extends EntityObject {
    type: "blinker"
    position: number[]
    onTime: number
    numStates: number
    state: number
}

interface LoveObject extends EntityObject {
    type: "love-interest"
    position: number[]
}

interface LevelObject {
    width: number,
    height: number
    skyColor: string
    bounds: number[]
    startPos: number[]
    tiles: (Tile | null)[][]
    decor: Decor[]
    coins: number[][]
    entities: (EntityObject)[]
    skyboxes: {[index: string]: number[]}
}

export class Level {
    assets: {[index: string]: HTMLImageElement}
    tiles: (Tile | null)[][]
    decor: Decor[]
    coins: number[][]
    collectedCoins: number[]
    entities: (Enemy | Blinker | LoveInterest)[]
    bounds: number[]
    camera: number[]
    player: Player
    size: number[]
    startPos: number[]
    coinset: TilesetObject
    tilesets: TilesetObject[]
    spritesheet: SpritesheetObject
    skyColor: string
    state: number

    // 0 = playing, 1 = level editor
    skyboxes: {[index: string]: ScrollingBackground}

    constructor(assets: {[index: string]: HTMLImageElement}) {
        this.assets = assets
        this.tiles = []
        this.decor = []
        this.coins = []
        this.collectedCoins = []
        this.entities = []
        this.bounds = [0,0,0,0]
        this.camera = [0,0]
        this.startPos = [0,0]
        this.state = 0
        this.player = new Player(assets['player'], [0,0])
        this.player.velocity = [0,0]
        this.coinset = new TilesetObject([0,0],[60,60], 0, assets['coins'], [16,16])
        this.spritesheet = new SpritesheetObject([0,0],[0,0],0, [assets['decor-day'], assets['decor-night'], assets['decor-jungle']], [decorDaySpritesheet,decorNightSpritesheet,decorJungleSpritesheet])
        this.tilesets = [
            new TilesetObject([0,0], [60,60], 0, assets['day-tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['evening-tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['night-tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['swamp_tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['ice_tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['fire_tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['house_tiles'], [16,16]),
            new TilesetObject([0,0], [60,60], 0, assets['castle_tiles'], [16,16])
        ]
        this.skyboxes = {}
        this.size = [0,0]
        this.skyColor = '#000000'
    }

    loadLevel(level: LevelObject, useBlocks: boolean) {
        this.player.velocity = [0,0]
        this.player.control = true
        this.size = [level.width, level.height]
        this.bounds = level.bounds
        this.skyColor = level.skyColor
        this.startPos = level.startPos
        this.player.position = [...this.startPos]
        this.player.startPos = [...this.startPos]
        if (useBlocks) {
            this.decor = level.decor
            this.decor.forEach((item) => {
                if (item.sheet == undefined) item.sheet = 0
            })
            this.coins = level.coins
            this.tiles = level.tiles
            this.tiles.forEach((row) => {
                row.forEach((tile) => {
                    if (tile != null && tile.hazard == undefined) {
                        tile.hazard = false
                    }
                    if (tile != null && tile.collides == undefined) {
                        tile.collides = 1
                    }
                })
            })
            level.entities.forEach((entity) => {
                switch(entity.type) {
                    case('enemy'):
                        this.entities.push(new Enemy((entity as EnemyObject).startPos, entity.sprite, this.assets[entity.sprite], entity.imageSize, entity.type, (entity as EnemyObject).startVel))
                        break;
                    case('blinker'):
                        this.entities.push(new Blinker((entity as BlinkerObject).position, entity.sprite, this.assets[entity.sprite], entity.imageSize, (entity as BlinkerObject).onTime, (entity as BlinkerObject).numStates, (entity as BlinkerObject).state))
                        break;
                    case('love-interest'):
                        this.entities.push(new LoveInterest((entity as LoveObject).position, entity.sprite, this.assets[entity.sprite], entity.imageSize))
                        break;
                }
            })
        } else {
            this.tiles = Array(level.height).fill(0).map(() => Array(level.width).fill(null))
            this.decor = []
            
        }
        for (let skybox in level.skyboxes) {
            this.skyboxes[skybox] = new ScrollingBackground([0,0], [level.skyboxes[skybox][1], 600], level.skyboxes[skybox][0], this.assets[skybox])
        }
    }

    saveLevel() {
        const levelObject = {} as LevelObject
        levelObject.width = this.size[0]
        levelObject.height = this.size[1]
        levelObject.skyColor = this.skyColor
        levelObject.bounds = this.bounds
        levelObject.startPos = this.startPos
        levelObject.tiles = this.tiles
        levelObject.decor = this.decor
        levelObject.coins = this.coins
        levelObject.entities = []
        this.entities.forEach((entity) => {
            if (entity instanceof Enemy) {
                levelObject.entities.push({startPos: entity.startPos, startVel: entity.startVel, sprite: entity.spriteName, imageSize: entity.sprite.imageSize, type: 'enemy'} as EnemyObject)
            } else if (entity instanceof Blinker) {
                levelObject.entities.push({position: entity.position, onTime: entity.onTime, numStates: entity.numStates, state: entity.state, sprite: entity.spriteName, imageSize: entity.sprite.imageSize, type: "blinker"} as BlinkerObject)
            } else if (entity instanceof LoveInterest) {
                levelObject.entities.push({position: entity.position, sprite: entity.spriteName, imageSize: entity.sprite.imageSize, type: "love-interest"} as LoveObject)
            }
            
        })
        levelObject.skyboxes = {}
        for (let skybox in this.skyboxes) {
            levelObject.skyboxes[skybox] = [this.skyboxes[skybox].speed,this.skyboxes[skybox].size[0]]
        }
        download(levelObject, 'levelSave.json', 'text/plain')
    }

    render(canvas: Canvas, timeActive: number) {
        canvas.ctx.strokeRect(this.bounds[0]-this.camera[0],this.bounds[1]-this.camera[1],this.bounds[2], this.bounds[3])
        canvas.ctx.fillStyle = this.skyColor
        canvas.ctx.fillRect(this.bounds[0]-this.camera[0],this.bounds[1]-this.camera[1],this.bounds[2], this.bounds[3])

        for (let skybox in this.skyboxes) {
            this.skyboxes[skybox].render(canvas.ctx)
        }

        this.tiles.forEach((row, i) => {
            row.forEach((tile, j) => {
                if (tile != null && j*60-this.camera[0] >= -60 && j*60-this.camera[0] < 1000 && i*60-this.camera[1] >= -60 && i*60-this.camera[1] < 600) {
                    this.tilesets[tile.tileset].position = [j*60-this.camera[0], i*60-this.camera[1]]
                    this.tilesets[tile.tileset].render(canvas.ctx, tile.texture)
                }
            })
        })

        this.entities.forEach((entity) => {
            entity.render(canvas, this.camera)
        })

        this.player.render(canvas.ctx, this.camera)

        this.coins.forEach((coin, i) => {
            for (let collectedCoin of this.collectedCoins) {if (collectedCoin == i) return}
            if (coin[0]-this.camera[0] >= -60 && coin[0]-this.camera[0] < 1000 && coin[1]-this.camera[1] >= -60 && coin[1]-this.camera[1] < 600) { 
                this.coinset.position = [coin[0]-this.camera[0], coin[1]-this.camera[1]]
                this.coinset.angle = Math.sin(timeActive/500)/5
                this.coinset.render(canvas.ctx, Math.floor(timeActive/200)%5)
                if (this.player.position[0] < coin[0]+60 && this.player.position[0]+60 > coin[0] && this.player.position[1] < coin[1]+60 && this.player.position[1]+60 > coin[1]) this.collectedCoins.push(i)
            }
        })

        this.decor.forEach((item) => {
            if (item.position[0]-this.camera[0] >= -this.spritesheet.spritesheets[item.sheet!][item.texture][4] && item.position[0]-this.camera[0] < 1000 && item.position[1]-this.camera[1] >= -this.spritesheet.spritesheets[item.sheet!][item.texture][5] && item.position[1]-this.camera[1] < 600) {
                this.spritesheet.position = [item.position[0]-this.camera[0], item.position[1]-this.camera[1]]
                this.spritesheet.render(canvas.ctx, item.texture, item.sheet)
            }
        })

        canvas.ctx.fillStyle = 'black'
        canvas.ctx.strokeStyle = 'white'
        canvas.ctx.lineWidth = 4;
        canvas.ctx.strokeText('COINS: '+this.collectedCoins.length+"/"+this.coins.length,10,25)
        canvas.ctx.fillText('COINS: '+this.collectedCoins.length+"/"+this.coins.length,10,25)
        
    }

    update(deltaTime: number, timeActive: number) {
        this.entities.forEach((enemy) => {
            const pos = [Math.floor((enemy.position[0]+enemy.velocity[0]*deltaTime)/60), Math.floor((enemy.position[1]+enemy.velocity[1]*deltaTime)/60)]
            const blocksTouching: number[][] = []
            if (pos[0] >= 0 && pos[0] < this.size[0]-1 && pos[1] >= 0 && pos[1] < this.size[1]-1) {
                let start = -1
                if (pos[1] == 0) start = 0 
                for (let i = start; i <= 1; i++) {
                    for (let j = 0; j <= 1; j++) {
                        if (this.tiles[pos[1]+i][pos[0]+j] != null) blocksTouching.push([(pos[0]+j)*60, (pos[1]+i)*60, 60, 60])
                    }
                }
            }
            enemy.update(deltaTime, this.bounds, this.player, blocksTouching)
        })

        const pos = [Math.floor((this.player.position[0]+this.player.velocity[0]*deltaTime)/60), Math.floor((this.player.position[1]+this.player.velocity[1]*deltaTime)/60)]
        const blocksTouching: number[][] = []
        const hazardsTouching = []
        const entitiesTouching: number[][] = []
        if (pos[0] >= 0 && pos[0] < this.size[0]-1 && pos[1] >= 0 && pos[1] < this.size[1]-1) {
            let start = -1
            if (pos[1] == 0) start = 0 
            for (let i = start; i <= 1; i++) {
                    if (this.tiles[pos[1]+i][pos[0]] != null && this.tiles[pos[1]+i][pos[0]]?.collides == this.tiles[pos[1]+i][pos[0]+1]?.collides && !this.tiles[pos[1]+i][pos[0]]?.hazard && this.tiles[pos[1]+i][pos[0]+1] != null && !this.tiles[pos[1]+i][pos[0]+1]?.hazard) {
                        if (this.tiles[pos[1]+i][pos[0]]!.collides == 1 || this.tiles[pos[1]+i][pos[0]]!.collides == 3) {
                            blocksTouching.push([(pos[0])*60,(pos[1]+i)*60,120,60, this.tiles[pos[1]+i][pos[0]]!.collides])
                        } else if (this.tiles[pos[1]+i][pos[0]]!.collides == 2) {
                            blocksTouching.push([(pos[0])*60,(pos[1]+i)*60,120,5, this.tiles[pos[1]+i][pos[0]]!.collides])
                        }
                    } else {
                        if (this.tiles[pos[1]+i][pos[0]] != null && this.tiles[pos[1]+i][pos[0]]?.collides) {
                            if (this.tiles[pos[1]+i][pos[0]]?.hazard) {
                                hazardsTouching.push([(pos[0])*60+2,(pos[1]+i)*60+2,56,56])
                            } else {
                                if (this.tiles[pos[1]+i][pos[0]]!.collides == 1 || this.tiles[pos[1]+i][pos[0]]!.collides == 3) {
                                    blocksTouching.push([(pos[0])*60,(pos[1]+i)*60,60,60, this.tiles[pos[1]+i][pos[0]]!.collides])
                                } else if (this.tiles[pos[1]+i][pos[0]]!.collides == 2) {
                                    blocksTouching.push([(pos[0])*60,(pos[1]+i)*60,60,5, this.tiles[pos[1]+i][pos[0]]!.collides])
                                }
                                
                            }
                            
                        }
                        if (this.tiles[pos[1]+i][pos[0]+1] != null && this.tiles[pos[1]+i][pos[0]+1]?.collides) {
                            if (this.tiles[pos[1]+i][pos[0]+1]?.hazard) {
                                hazardsTouching.push([(pos[0]+1)*60+2,(pos[1]+i)*60+2,56,56])
                            } else {
                                if (this.tiles[pos[1]+i][pos[0]+1]!.collides == 1 || this.tiles[pos[1]+i][pos[0]+1]!.collides == 3) {
                                    blocksTouching.push([(pos[0]+1)*60,(pos[1]+i)*60,60,60, this.tiles[pos[1]+i][pos[0]+1]!.collides])
                                } else if (this.tiles[pos[1]+i][pos[0]+1]!.collides == 2) {
                                    blocksTouching.push([(pos[0]+1)*60,(pos[1]+i)*60,60,5, this.tiles[pos[1]+i][pos[0]+1]!.collides])
                                }
                            }
                        }
                    }
            }
            this.entities.forEach((entity) => {
                if (entity instanceof Enemy) {
                    hazardsTouching.push([...entity.position,60,60])
                } else if ((entity instanceof Blinker && !entity.stalling && entity.state == entity.activeState) || entity instanceof LoveInterest) {
                    blocksTouching.push([...entity.position,60,60])
                }
            })
        }

        this.camera = [this.player.position[0]-530, this.player.position[1]-330]
        if (this.camera[0] < this.bounds[0]) {
            this.camera[0] = this.bounds[0]
        } else if (this.camera[0]+1060 > this.bounds[0] + this.bounds[2]) {
            this.camera[0] = this.bounds[0]+this.bounds[2]-1060
        } if (this.camera[1] < this.bounds[1]) {
            this.camera[1] = this.bounds[1]
        } else if (this.camera[1]+660 > this.bounds[1] + this.bounds[3]) {
            this.camera[1] = this.bounds[1]+this.bounds[3]-660
        } 
        for (let skybox in this.skyboxes) {
            this.skyboxes[skybox].update(this.camera)
        }
        this.player.update(deltaTime, blocksTouching, hazardsTouching, entitiesTouching, this.bounds, timeActive)
    }

    place(mousePos: number[], selectedTileset: number, selectedTile: number, collideTile: number, hazardTile: boolean, decorSelected: string, spritesheetSelected: number, selection: number) {
        const pos = [Math.floor((mousePos[0]+this.camera[0])/60), Math.floor((mousePos[1]+this.camera[1])/60)]
        if (selection == 0) {
            if (pos[0] >= 0 && pos[0] < this.size[0]-1 && pos[1] >= 0 && pos[1] < this.size[1]-1) {
                if (this.tiles[pos[1]][pos[0]] != null) {
                    this.tiles[pos[1]][pos[0]]!.texture++
                } else {
                    this.tiles[pos[1]][pos[0]] = {tileset: selectedTileset, texture: selectedTile, collides: collideTile, hazard: hazardTile}
                }
            }
        } else if (selection == 1) {
            this.decor.push({position: [pos[0]*60,pos[1]*60], texture: decorSelected, sheet: spritesheetSelected})
            
        } else if (selection == 2) {
            this.coins.push([pos[0]*60,pos[1]*60])
        }
        
    }

    remove(mousePos: number[], selection: number) {
        if (selection == 0) {
            const pos = [Math.floor((mousePos[0]+this.camera[0])/60), Math.floor((mousePos[1]+this.camera[1])/60)]
            if (pos[0] >= 0 && pos[0] < this.size[0]-1 && pos[1] >= 0 && pos[1] < this.size[1]-1) {
                this.tiles[pos[1]][pos[0]] = null
            }
        } else if (selection == 1) {
            this.decor.pop()
        } else if (selection == 2) {
            this.coins.pop()
        }
    }
}