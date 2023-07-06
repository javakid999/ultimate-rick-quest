import { GameScene } from "../scenes/gamescene";
import { LevelSelectScene } from "../scenes/levelselect";
import { InputManager } from "./inputmanager";
import { GameObject, ScrollingBackground } from "./object";
import { Scene } from "./scene";

export class Canvas {
    assets: {[index: string]: HTMLImageElement}
    element: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D
    globalObjects: Array<GameObject | ScrollingBackground>
    scenes: {[index: string]: Scene}
    activeScene: string

    completedLevels: number


    constructor(dimensions: number[], assets: {[index: string]: HTMLImageElement}) {
        this.assets = assets;
        this.element = document.createElement('canvas') as HTMLCanvasElement;

        this.element.width = dimensions[0]
        this.element.height = dimensions[1]
        this.element.id = 'game-canvas';
        this.ctx = this.element.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.font = '25px arial'
        document.getElementById('game')!.appendChild(this.element);
        this.element.appendChild
        
        this.load()

        this.scenes = {}
        this.activeScene = 'levels'
        this.globalObjects = []

        this.completedLevels = 0
    }

    reset() {
        localStorage.clear()
    }

    save() {
        localStorage.setItem('completedLevels', this.completedLevels.toString())
    }

    load() {
        if (localStorage.getItem('completedLevels') != null) this.completedLevels = parseFloat(localStorage.getItem('completedLevels')!)
        console.log(this.completedLevels)
    }

    initScenes() {
        this.scenes['levels'] = new LevelSelectScene(this, this.assets)
        this.scenes['game'] = new GameScene(this, this.assets)
    }

    render() {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
          
        for (let item of this.globalObjects) {
            item.render(this.ctx);
        }

        switch(this.activeScene) {
            case('game'):
                this.scenes['game'].render(this);
                break;
            case('levels'):
                this.scenes['levels'].render(this);
                break;
        }
    }

    update(inputManager: InputManager, deltaTime: number) {
        switch(this.activeScene) {
            case('game'):
                this.scenes['game'].updateInput(inputManager);
                this.scenes['game'].update(deltaTime)
                break;
            case('levels'):
                this.scenes['levels'].updateInput(inputManager);
                this.scenes['levels'].update(deltaTime)
                break;
        }
        
    }
}