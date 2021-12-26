import TextAddin from "../abstract/TextAddin";
import TextWindow, { Input } from "../abstract/TextWindow";
import EmbedCreator from "../EmbedCreator";
import TextWindowManager from "../TextWindowManager";

export default class Timeout extends TextAddin {
    seconds: number;
    hook: NodeJS.Timeout;

    constructor(manager: TextWindowManager, seconds: number) {
      super(manager);
      this.seconds = seconds;
      this.hook = setTimeout(this.unloadManager.bind(this), this.seconds * 1000);
    }

    unloadManager() {
      this.manager.unload();
    }

    onInput(input: Input): Input {
        clearTimeout(this.hook);
        this.hook = setTimeout(this.unloadManager.bind(this), this.seconds * 1000);
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
