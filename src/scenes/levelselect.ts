import { Canvas } from "../api/canvas";
import { InputManager } from "../api/inputmanager";
import { ScrollingBackground } from "../api/object";
import { Scene } from "../api/scene";

export class LevelSelectScene extends Scene {
    assets: {[index: string]: HTMLImageElement}
    canvas: Canvas

    levelsElement: HTMLDivElement
    objects: ScrollingBackground[]

    constructor(canvas: Canvas, assets: {[index: string]: HTMLImageElement}) {
        super();

        this.canvas = canvas
        this.assets = assets

        this.objects = [
            new ScrollingBackground([0,0], [1000,600], -0.05, assets['night-1']),
            new ScrollingBackground([0,0], [1000,600], -0.07, assets['night-2']),
            new ScrollingBackground([0,0], [1000,600], -0.1, assets['night-3'])
        ]

        this.levelsElement = document.createElement('div')
        this.levelsElement.id = 'levelSelect'
        document.getElementById('game')!.appendChild(this.levelsElement)
        this.setupEditor()
    }

    setupEditor() {
        const title = document.createElement('h3')
        title.id = 'title'
        title.textContent = 'Levels'
        this.levelsElement.appendChild(title)
        
        this.levelsElement.appendChild(document.createElement('hr'))

        const button1 = document.createElement('button')
        button1.id = 'button1'
        button1.textContent = 'LEVEL 1'
        button1.onclick = () => {this.loadLevel(0)}
        this.levelsElement.appendChild(button1)

        const button2 = document.createElement('button')
        button2.id = 'button2'
        button2.textContent = 'LEVEL 2'
        button2.className = 'locked'
        button2.onclick = () => {this.loadLevel(1)}
        this.levelsElement.appendChild(button2)

        const button3 = document.createElement('button')
        button3.id = 'button3'
        button3.textContent = 'LEVEL 3'
        button3.className = 'locked'
        button3.onclick = () => {this.loadLevel(2)}
        this.levelsElement.appendChild(button3)

        const button4 = document.createElement('button')
        button4.id = 'button4'
        button4.textContent = 'LEVEL 4'
        button4.className = 'locked'
        button4.onclick = () => {this.loadLevel(3)}
        this.levelsElement.appendChild(button4)

        const button5 = document.createElement('button')
        button5.id = 'button5'
        button5.textContent = 'LEVEL 5'
        button5.className = 'locked'
        button5.onclick = () => {this.loadLevel(4)}
        this.levelsElement.appendChild(button5)

        const button6 = document.createElement('button')
        button6.id = 'button6'
        button6.textContent = 'LEVEL 6'
        button6.className = 'locked'
        button6.onclick = () => {this.loadLevel(5)}
        this.levelsElement.appendChild(button6)

        const button7 = document.createElement('button')
        button7.id = 'button7'
        button7.textContent = 'LEVEL 7'
        button7.className = 'locked'
        button7.onclick = () => {this.loadLevel(6)}
        this.levelsElement.appendChild(button7)

        const button8 = document.createElement('button')
        button8.id = 'button8'
        button8.textContent = 'LEVEL 8'
        button8.className = 'locked'
        button8.onclick = () => {this.loadLevel(7)}
        this.levelsElement.appendChild(button8)

        const button9 = document.createElement('button')
        button9.id = 'button9'
        button9.textContent = 'LEVEL 9'
        button9.className = 'locked'
        button9.onclick = () => {this.loadLevel(8)}
        this.levelsElement.appendChild(button9)
    }

    activate() {
        this.levelsElement.style.display = 'block'
        if (this.canvas.completedLevels >= 1) {
            document.getElementById('button2')!.className = ''
        } else {
            document.getElementById('button2')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 2) {
            document.getElementById('button3')!.className = ''
        } else {
            document.getElementById('button3')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 3) {
            document.getElementById('button4')!.className = ''
        } else {
            document.getElementById('button4')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 4) {
            document.getElementById('button5')!.className = ''
        } else {
            document.getElementById('button5')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 5) {
            document.getElementById('button6')!.className = ''
        } else {
            document.getElementById('button6')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 6) {
            document.getElementById('button7')!.className = ''
        } else {
            document.getElementById('button7')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 7) {
            document.getElementById('button8')!.className = ''
        } else {
            document.getElementById('button8')!.className = 'locked'
        }
        if (this.canvas.completedLevels >= 8) {
            document.getElementById('button9')!.className = ''
        } else {
            document.getElementById('button9')!.className = 'locked'
        }
    }

    loadLevel(level: number) {
        if (level > this.canvas.completedLevels) return
        this.levelsElement.style.display = 'none'
        this.canvas.activeScene = 'game'
        this.canvas.scenes['game'].activate(level)
    }

    render(canvas: Canvas) {
        this.objects.forEach((object) => {
            object.render(canvas.ctx)
        })
    }

    update(deltaTime: number) {
        super.update(deltaTime)

        this.objects.forEach((object) => {
            object.updateAuto(deltaTime)
        })
    }

    updateInput(inputManager: InputManager) {
        super.updateInput(inputManager);

        this.canvas.ctx.fillStyle = 'red'
        this.canvas.ctx.fillRect(inputManager.mousePos[0], inputManager.mousePos[1], 2, 2)
    }
}