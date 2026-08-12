export interface MouseState {
    x: number;
    y: number;
    isDown: boolean;
}

export interface InputState {
    keys: Record<string, boolean>;
    mouse: MouseState;
}

export type InputEventName =
    | "keyDown"
    | "keyUp"
    | "pointerDown"
    | "pointerUp"
    | "leftClick"
    | "rightClick";

export interface InputEvent {
    type: InputEventName;
    code?: string;
    button?: number;
    x: number;
    y: number;
}

export type InputListener = (event: InputEvent) => void;
export type Unsubscribe = () => void;

export class InputController {
    public readonly state: InputState;
    private readonly listeners = new Map<InputEventName, Set<InputListener>>();
    private readonly dragThreshold = 8;
    private pointerDownPosition: { x: number; y: number } | null = null;
    private isDragging = false;

    constructor(state: InputState = {
        keys: {},
        mouse: { x: 0, y: 0, isDown: false }
    }) {
        this.state = state;

        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("blur", this.handleWindowBlur);
        window.addEventListener("pointermove", this.handlePointerMove);
        window.addEventListener("pointerdown", this.handlePointerDown);
        window.addEventListener("pointerup", this.handlePointerUp);
        window.addEventListener("pointerleave", this.handlePointerUp);
    }

    public on(eventName: InputEventName, listener: InputListener): Unsubscribe {
        const listeners = this.listeners.get(eventName) ?? new Set<InputListener>();
        listeners.add(listener);
        this.listeners.set(eventName, listeners);

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.listeners.delete(eventName);
            }
        };
    }

    public onKeyDown(code: string, listener: InputListener): Unsubscribe {
        return this.on("keyDown", (event) => {
            if (event.code === code) {
                listener(event);
            }
        });
    }

    public onLeftClick(listener: InputListener): Unsubscribe {
        return this.on("leftClick", listener);
    }

    public onRightClick(listener: InputListener): Unsubscribe {
        return this.on("rightClick", listener);
    }

    public isKeyPressed(code: string): boolean {
        return Boolean(this.state.keys[code]);
    }

    public get moveUp(): boolean {
        return this.isKeyPressed("KeyW") || this.isKeyPressed("ArrowUp");
    }

    public get moveLeft(): boolean {
        return this.isKeyPressed("KeyA") || this.isKeyPressed("ArrowLeft");
    }

    public get moveDown(): boolean {
        return this.isKeyPressed("KeyS") || this.isKeyPressed("ArrowDown");
    }

    public get moveRight(): boolean {
        return this.isKeyPressed("KeyD") || this.isKeyPressed("ArrowRight");
    }

    public get dragMouse(): boolean {
        return this.state.mouse.isDown;
    }

    public get mouseX(): number {
        return this.state.mouse.x;
    }

    public get mouseY(): number {
        return this.state.mouse.y;
    }

    public getMousePosition(): MouseState {
        return { ...this.state.mouse };
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("blur", this.handleWindowBlur);
        window.removeEventListener("pointermove", this.handlePointerMove);
        window.removeEventListener("pointerdown", this.handlePointerDown);
        window.removeEventListener("pointerup", this.handlePointerUp);
        window.removeEventListener("pointerleave", this.handlePointerUp);
        this.listeners.clear();
    }

    private emit(eventName: InputEventName, event: Omit<InputEvent, "type">): void {
        const listeners = this.listeners.get(eventName);
        if (!listeners) return;

        const payload: InputEvent = {
            type: eventName,
            // x: event.x,
            // y: event.y,
            ...event
        };

        for (const listener of listeners) {
            listener(payload);
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        this.state.keys[event.code] = true;
        this.emit("keyDown", {
            code: event.code,
            x: this.state.mouse.x,
            y: this.state.mouse.y
        });
    };

    private readonly handleKeyUp = (event: KeyboardEvent): void => {
        this.state.keys[event.code] = false;
        this.emit("keyUp", {
            code: event.code,
            x: this.state.mouse.x,
            y: this.state.mouse.y
        });
    };

    private readonly handleWindowBlur = (): void => {
        this.state.keys = {};
        this.state.mouse.isDown = false;
    };

    private readonly handlePointerMove = (event: PointerEvent): void => {
        this.state.mouse.x = event.clientX;
        this.state.mouse.y = event.clientY;

        if (!this.state.mouse.isDown || this.pointerDownPosition === null) return;

        const deltaX = event.clientX - this.pointerDownPosition.x;
        const deltaY = event.clientY - this.pointerDownPosition.y;
        const dragDistance = Math.hypot(deltaX, deltaY);

        if (dragDistance > this.dragThreshold) {
            this.isDragging = true;
        }
    };

    private readonly handlePointerDown = (event: PointerEvent): void => {
        this.state.mouse.x = event.clientX;
        this.state.mouse.y = event.clientY;
        this.state.mouse.isDown = true;
        this.pointerDownPosition = { x: event.clientX, y: event.clientY };
        this.isDragging = false;

        this.emit("pointerDown", {
            button: event.button,
            x: event.clientX,
            y: event.clientY
        });

        if (event.button === 2) {
            this.emit("rightClick", {
                button: event.button,
                x: event.clientX,
                y: event.clientY
            });
        }
    };

    private readonly handlePointerUp = (event: PointerEvent): void => {
        const clickX = this.state.mouse.x;
        const clickY = this.state.mouse.y;
        const wasLeftClick = event.button === 0 && !this.isDragging && this.pointerDownPosition !== null;

        this.state.mouse.isDown = false;
        this.pointerDownPosition = null;
        this.isDragging = false;

        this.emit("pointerUp", {
            button: event.button,
            x: clickX,
            y: clickY
        });

        if (wasLeftClick) {
            this.emit("leftClick", {
                button: event.button,
                x: clickX,
                y: clickY
            });
        }
    };
}

export const inputState: InputState = {
    keys: {},
    mouse: { x: 0, y: 0, isDown: false }
};

export const inputs = new InputController(inputState);