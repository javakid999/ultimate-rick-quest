export class InputManager {
    keys: {[index: string]: boolean}
    clicking: boolean
    mousePos: number[]
    mouseSensitivity: number
    leftClicked: boolean
    rightClicked: boolean
    scrolled: number
    constructor(canvas: HTMLCanvasElement) {     
        canvas.addEventListener('mousemove', this.mousemoveListener.bind(this));
        window.addEventListener('keydown', this.keydownListener.bind(this));
        window.addEventListener('keyup', this.keyupListener.bind(this));
        canvas.addEventListener('mousedown', this.mousedownListener.bind(this));
        canvas.addEventListener('mouseup', this.mouseupListener.bind(this));
        canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault())
        this.clicking = false
        this.keys = {}
        this.mousePos = [0,0]
        this.mouseSensitivity = 0.002
        this.leftClicked = false
        this.rightClicked = false
        this.scrolled = 0
    }

    mousemoveListener(e: MouseEvent) {
        this.mousePos = [e.offsetX, e.offsetY]
    }

    keydownListener(e: KeyboardEvent) {
        switch (e.key) {
            case ('w'):
                this.keys['w'] = true;
                break;
            case ('s'):
                this.keys['s'] = true;
                break;
            case ('a'):
                this.keys['a'] = true;
                break;
            case ('d'):
                this.keys['d'] = true;
                break;
            case ('e'):
                if (!this.keys['e'] && !e.repeat) {
                    this.keys['e'] = true;
                    break;
                }
                break;
            case ('z'):
                if (!this.keys['z'] && !e.repeat) {
                    this.keys['z'] = true;
                    break;
                }
                break;
            case ('x'):
                if (!this.keys['x'] && !e.repeat) {
                    this.keys['x'] = true;
                    break;
                }
                break;
            case('q'):
                this.keys['q'] = true;
                    break;
            case ('r'):
                if (!this.keys['r'] && !e.repeat) {
                    this.keys['r'] = true;
                    break;
                }
                break;
        }
    }

    keyupListener(e: KeyboardEvent) {
        switch (e.key) {
            case ('w'):
                this.keys['w'] = false;
                break;
            case ('s'):
                this.keys['s'] = false;
                break;
            case ('a'):
                this.keys['a'] = false;
                break;
            case ('d'):
                this.keys['d'] = false;
                break;
            case ('e'):
                this.keys['e'] = false;
                break;
            case ('q'):
                this.keys['q'] = false;
                break;
            case('r'):
                this.keys['r'] = false;  
                break;
        }
    }

    mousedownListener(e: MouseEvent) {
        if (e.button == 0) this.clicking = true
    }

    mouseupListener(e: MouseEvent) {
        if (e.button == 0) {this.leftClicked = true}
        if (e.button == 2) {this.rightClicked = true}
        this.clicking = false
    }

    updateInput() {
        this.keys['e'] = false
        this.keys['z'] = false
        this.keys['x'] = false
        this.keys['r'] = false
        this.leftClicked = false
        this.rightClicked = false
    }
}