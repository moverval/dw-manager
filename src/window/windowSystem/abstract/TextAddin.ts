import EmbedCreator from "../EmbedCreator";
import TextWindowManager from "../TextWindowManager";
import TextWindow, { Input } from "./TextWindow";

export default abstract class TextAddin {
    manager: TextWindowManager;

    constructor(manager: TextWindowManager) {
        this.manager = manager;
    }

    abstract onInput(input: Input): Input | null;

    abstract onRender(embedCreator: EmbedCreator): EmbedCreator | null;

    abstract onSetWindow(window: TextWindow): TextWindow | null;

    abstract onUnload(): boolean | null;
}
