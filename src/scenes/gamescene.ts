import { Canvas } from "../api/canvas";
import { InputManager } from "../api/inputmanager";
import { Scene } from "../api/scene";
import { Level } from "../game/level";
import level0 from '../assets/levels/level0.json'
import level1 from '../assets/levels/level1.json'
import level2 from '../assets/levels/level2.json'
import level3 from '../assets/levels/level3.json'
import level4 from '../assets/levels/level4.json'
import level5 from '../assets/levels/level5.json'
import level6 from '../assets/levels/level6.json'
import level7 from '../assets/levels/level7.json'
import levelhouse from '../assets/levels/levelhouse.json'

export class GameScene extends Scene {
    assets: {[index: string]: HTMLImageElement}
    canvas: Canvas

    level: Level
    levelPlaying: number

    selectedTileset: number
    selectedTile: number
    selectedDecor: number
    selectedDecorItem: string
    selection: number

    collideTile: number
    hazardTile: boolean

    editorElement: HTMLDivElement

    constructor(canvas: Canvas, assets: {[index: string]: HTMLImageElement}) {
        super();

        this.canvas = canvas
        this.assets = assets

        this.selectedTileset = 0
        this.selectedTile = 0
        this.selectedDecor = 0
        this.selectedDecorItem = ''
        this.selection = 0

        this.collideTile = 1
        this.hazardTile = false
        this.level = new Level(assets)
        this.level.loadLevel(level0, true)
        this.levelPlaying = 0

        this.editorElement = document.createElement('div')
        this.editorElement.id = 'editor'
        this.editorElement.textContent = 'Level Editor'
        if (this.level.state != 1) this.editorElement.style.display = 'none'
        document.getElementById('game')!.appendChild(this.editorElement)
        this.setupEditor()
    }

    setupEditor() {
        this.editorElement.appendChild(document.createElement('br'))
        const hazardButton = document.createElement('button')
        hazardButton.textContent = "Hazard: "+this.hazardTile
        hazardButton.onclick = () => {
            this.hazardTile = !this.hazardTile
            hazardButton.textContent = "Hazard: "+this.hazardTile
        }
        this.editorElement.appendChild(hazardButton)

        const collideButton = document.createElement('button')
        collideButton.textContent = "Collides: "+this.collideTile
        collideButton.onclick = () => {
            this.collideTile ++;
            if (this.collideTile > 3) this.collideTile = 0
            collideButton.textContent = "Collides: "+this.collideTile
        }
        this.editorElement.appendChild(collideButton)
        this.editorElement.appendChild(document.createElement('br'))

        const tilesetLeft = document.createElement('button')
        const tilesetRight = document.createElement('button')
        const decorLeft = document.createElement('button')
        const decorRight = document.createElement('button')
        tilesetLeft.textContent = '<'
        decorLeft.textContent = '<'
        tilesetRight.textContent = '>'
        decorRight.textContent = '>'
        tilesetLeft.onclick = () => {
            if (this.selectedTileset > 0) {
                this.selectedTileset--;

                const tilesetImage = this.level.tilesets[this.selectedTileset].image.cloneNode(true) as HTMLImageElement
                tilesetImage.id = 'tilesetImage'
                tilesetImage.onclick = (e: MouseEvent) => {this.tilesetSelect(e.offsetX, e.offsetY)}
                this.editorElement.replaceChild(tilesetImage, document.getElementById('tilesetImage')!)
            }
        }

        tilesetRight.onclick = () => {
            if (this.selectedTileset < this.level.tilesets.length-1) {
                this.selectedTileset++

                const tilesetImage = this.level.tilesets[this.selectedTileset].image.cloneNode(true) as HTMLImageElement
                tilesetImage.id = 'tilesetImage'
                tilesetImage.onclick = (e: MouseEvent) => {this.tilesetSelect(e.offsetX, e.offsetY)}
                this.editorElement.replaceChild(tilesetImage, document.getElementById('tilesetImage')!)
            }
        }

        decorLeft.onclick = () => {
            if (this.selectedDecor > 0) {
                this.selectedDecor--;

                const decorImage = this.level.spritesheet.images[this.selectedDecor].cloneNode(true) as HTMLImageElement
                decorImage.id = 'decorImage'
                decorImage.onclick = (e: MouseEvent) => {this.decorSelect(e.offsetX, e.offsetY)}
                this.editorElement.replaceChild(decorImage, document.getElementById('decorImage')!)
            }
        }

        decorRight.onclick = () => {
            if (this.selectedDecor < this.level.spritesheet.images.length - 1) {
                this.selectedDecor++;

                const decorImage = this.level.spritesheet.images[this.selectedDecor].cloneNode(true) as HTMLImageElement
                decorImage.id = 'decorImage'
                decorImage.onclick = (e: MouseEvent) => {this.decorSelect(e.offsetX, e.offsetY)}
                this.editorElement.replaceChild(decorImage, document.getElementById('decorImage')!)
            }
        }

        const tilesetImage = this.level.tilesets[this.selectedTileset].image.cloneNode(true) as HTMLImageElement
        tilesetImage.id = 'tilesetImage'
        tilesetImage.onclick = (e: MouseEvent) => {this.tilesetSelect(e.offsetX, e.offsetY)}
        this.editorElement.appendChild(tilesetLeft)
        this.editorElement.appendChild(tilesetImage)
        this.editorElement.appendChild(tilesetRight)

        this.editorElement.appendChild(document.createElement('hr'))

        this.editorElement.appendChild(decorLeft)
        const decorImage = this.level.spritesheet.images[this.selectedDecor].cloneNode(true) as HTMLImageElement
        decorImage.id = 'decorImage'
        decorImage.onclick = (e: MouseEvent) => {this.decorSelect(e.offsetX, e.offsetY)}
        this.editorElement.appendChild(decorImage)
        this.editorElement.appendChild(decorRight)

        this.editorElement.appendChild(document.createElement('hr'))
        const coinButton = document.createElement('button')
        coinButton.textContent = 'Place Coins'
        coinButton.onclick = () => {this.selection = 2; this.updateSelection()}
        this.editorElement.appendChild(coinButton)

        this.editorElement.appendChild(document.createElement('hr'))
        const selectedthing = document.createElement('p')
        selectedthing.textContent = 'Selection: '
        this.editorElement.appendChild(selectedthing)

        const decorSelected = this.level.tilesets[this.selectedTileset].image.cloneNode(true) as HTMLImageElement
        decorSelected.id = 'selection'
        const numImagesHoriz = this.level.tilesets[this.selectedTileset].image.width/this.level.tilesets[this.selectedTileset].imageSize[0]
        const numImagesVert = this.level.tilesets[this.selectedTileset].image.height/this.level.tilesets[this.selectedTileset].imageSize[1]
        const rect = [
            (this.selectedTile%numImagesHoriz)*this.level.tilesets[this.selectedTileset].imageSize[0],
            (Math.floor(this.selectedTile/numImagesHoriz)%numImagesVert)*this.level.tilesets[this.selectedTileset].imageSize[1],
            ...this.level.tilesets[this.selectedTileset].imageSize]
        decorSelected.style.objectPosition = -rect[0] + 'px ' + -rect[1] + 'px'
        decorSelected.style.width = rect[2]+'px'
        decorSelected.style.height = rect[3]+'px'
        this.editorElement.appendChild(decorSelected)
    }

    updateSelection() {
        switch (this.selection) {
            case (0):
                let decorSelected = this.level.tilesets[this.selectedTileset].image.cloneNode(true) as HTMLImageElement
                decorSelected.id = 'selection'
                const numImagesHoriz = this.level.tilesets[this.selectedTileset].image.width/this.level.tilesets[this.selectedTileset].imageSize[0]
                const numImagesVert = this.level.tilesets[this.selectedTileset].image.height/this.level.tilesets[this.selectedTileset].imageSize[1]
                let rect = [
                    (this.selectedTile%numImagesHoriz)*this.level.tilesets[this.selectedTileset].imageSize[0],
                    (Math.floor(this.selectedTile/numImagesHoriz)%numImagesVert)*this.level.tilesets[this.selectedTileset].imageSize[1],
                    ...this.level.tilesets[this.selectedTileset].imageSize]
                decorSelected.style.objectPosition = -rect[0] + 'px ' + -rect[1] + 'px'
                decorSelected.style.width = rect[2]+'px'
                decorSelected.style.height = rect[3]+'px'
                this.editorElement.replaceChild(decorSelected, document.getElementById('selection')!)
                break;
            case (1):
                const itemSelected = this.level.spritesheet.images[this.selectedDecor].cloneNode(true) as HTMLImageElement
                itemSelected.id = 'selection'
                const itemRect = this.level.spritesheet.spritesheets[this.selectedDecor][this.selectedDecorItem]
                itemSelected.style.objectPosition = -itemRect[0] + 'px ' + -itemRect[1] + 'px'
                itemSelected.style.width = itemRect[2]+'px'
                itemSelected.style.height = itemRect[3]+'px'
                this.editorElement.replaceChild(itemSelected, document.getElementById('selection')!)
                break;
            case(2):
                const coinSelected = this.level.coinset.image.cloneNode(true) as HTMLImageElement
                coinSelected.id = 'selection'
                const coinRect = [
                    0,
                    0,
                    ...this.level.coinset.imageSize]
                coinSelected.style.width = coinRect[2]+'px'
                coinSelected.style.height = coinRect[3]+'px'
                this.editorElement.replaceChild(coinSelected, document.getElementById('selection')!)
                break;
        }
    }

    tilesetSelect(offsetX: number, offsetY: number) {
        this.selectedTile = Math.floor(offsetX/this.level.tilesets[this.selectedTileset].imageSize[0]) + Math.floor(offsetY/this.level.tilesets[this.selectedTileset].imageSize[1])*this.level.tilesets[this.selectedTileset].image.width/this.level.tilesets[this.selectedTileset].imageSize[0]
        this.selection = 0
        this.updateSelection()
    }

    decorSelect(offsetX: number, offsetY: number) {
        for (let item in this.level.spritesheet.spritesheets[this.selectedDecor]) {
            const rect = this.level.spritesheet.spritesheets[this.selectedDecor][item]
            if (offsetX >= rect[0] && offsetX < rect[0]+rect[2] && offsetY >= rect[1] && offsetY < rect[1] + rect[3]) this.selectedDecorItem = item
            this.selection = 1
        }
        this.updateSelection()
    }

    activate(level: number) {
        this.levelPlaying = level
        switch (level) {
            case(0):
                this.level.loadLevel(level0, true)
                break;
            case(1):
                this.level.loadLevel(level1, true)
                break;
            case(2):
                this.level.loadLevel(level2, true)
                break;
            case(3):
                this.level.loadLevel(level3, true)
                break;
            case(4):
                this.level.loadLevel(level4, true)
                break;
            case(5):
                this.level.loadLevel(level5, true)
                break;
            case(6):
                this.level.loadLevel(level6, true)
                break;
            case(7):
                this.level.loadLevel(level7, true)
                break;
            case(8):
                this.level.loadLevel(levelhouse, true)
                break;
        }
        
    }

    render(canvas: Canvas) {
        this.level.render(canvas, this.timeActive)
    }

    update(deltaTime: number) {
        super.update(deltaTime)

        if (this.level.coins.length == this.level.collectedCoins.length) {
            if (this.levelPlaying >= this.canvas.completedLevels) this.canvas.completedLevels++
            this.canvas.activeScene = 'levels'
            this.canvas.scenes['levels'].activate()
            this.level.collectedCoins = []
            this.canvas.save()
        }

        this.level.update(deltaTime, this.timeActive)
    }

    updateInput(inputManager: InputManager) {
        super.updateInput(inputManager);

        if (this.level.state == 1) {
            if (inputManager.leftClicked) { this.level.place(inputManager.mousePos, this.selectedTileset, this.selectedTile, this.collideTile, this.hazardTile, this.selectedDecorItem, this.selectedDecor, this.selection) }
            if (inputManager.rightClicked) { this.level.remove(inputManager.mousePos, this.selection) }
            if (inputManager.keys['e']) {
                this.level.saveLevel()
            }
            if (inputManager.keys['z']) {
                this.selectedTile--
            }
            if (inputManager.keys['x']) {
                this.selectedTile++
            }
            if (inputManager.keys['q']) {
                this.level.player.position = [inputManager.mousePos[0] + this.level.camera[0], inputManager.mousePos[1] + this.level.camera[1]]
            }
        }
        
        if (inputManager.keys['r']) {
            this.level.player.respawn()
        }
        this.level.player.moving['right'] = inputManager.keys['d'] 
        this.level.player.moving['left'] = inputManager.keys['a'] 
        this.level.player.moving['up'] = inputManager.keys['w'] 
        
        this.canvas.ctx.fillStyle = 'red'
        this.canvas.ctx.fillRect(inputManager.mousePos[0], inputManager.mousePos[1], 2, 2)
    }
}