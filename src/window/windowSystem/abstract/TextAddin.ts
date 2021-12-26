import {Unloadable} from "../../../Types";
import EmbedCreator from "../EmbedCreator";
import TextWindowManager from "../TextWindowManager";
import TextWindow, { Input } from "./TextWindow";

export default abstract class TextAddin implements Unloadable {
    manager: TextWindowManager;

    constructor(manager: TextWindowManager) {
        this.manager = manager;
    }

    abstract unload(): void;

    abstract onInput(input: Input): Input | null;

    abstract onRender(embedCreator: EmbedCreator): EmbedCreator | null;

    abstract onSetWindow(window: TextWindow): TextWindow | null;

    abstract onUnload(): boolean | null;
}
