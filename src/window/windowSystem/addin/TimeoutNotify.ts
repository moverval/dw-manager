import TextAddin from "../abstract/TextAddin";
import TextWindow, { Input } from "../abstract/TextWindow";
import EmbedCreator from "../EmbedCreator";
import TextWindowManager from "../TextWindowManager";

export default class TimeoutNotify extends TextAddin {
    seconds: number;
    hook: NodeJS.Timeout;
    message: string;

    constructor(manager: TextWindowManager, message: string, seconds: number) {
        super(manager);
        this.seconds = seconds;
        this.message = message;
        this.hook = setTimeout(this.notify.bind(this), this.seconds * 1000);
    }

    notify() {
        this.manager.window.embedCreator.statusFields.set("Timeout", this.message);
        this.manager.window.render();
    }

    onInput(input: Input): Input {
        this.manager.window.embedCreator.statusFields.delete("Timeout");
        clearTimeout(this.hook);
        this.hook = setTimeout(this.notify.bind(this), this.seconds * 1000);
        return null;
    }

    onRender(embedCreator: EmbedCreator): EmbedCreator {
        return null;
    }

    onSetWindow(window: TextWindow): TextWindow {
        return null;
    }

    onUnload(): boolean {
        return null;
    }

    unload(): void {
        clearTimeout(this.hook);
    }
}
