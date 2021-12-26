import TextAddin from "../abstract/TextAddin";
import TextWindow, {Input} from "../abstract/TextWindow";
import EmbedCreator from "../EmbedCreator";
import TextWindowManager from "../TextWindowManager";

export default class WindowClose extends TextAddin {
    window: TextWindow;

    constructor(manager: TextWindowManager, window: TextWindow) {
        super(manager);
        this.window = window;
    }

    onInput(input: Input): Input {
        return null;
    }

    onRender(embedCreator: EmbedCreator): EmbedCreator {
        return null;
    }

    onSetWindow(window: TextWindow): TextWindow {
        return null;
    }

    onUnload(): boolean {
        this.manager.setWindow(this.window);
        this.window.render();
        return null;
    }

    unload(): void {
    }
}
