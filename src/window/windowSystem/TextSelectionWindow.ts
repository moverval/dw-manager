import TextWindow, { Input, InputType } from "./abstract/TextWindow";
import { TextSelectionContext } from "./TextSelectionContext";
import Bot from "../../discord/Bot";
import { Message } from "discord.js";
import TextWindowManager from "./TextWindowManager";

export default class TextSelectionWindow extends TextWindow {
    textSelectionContext: TextSelectionContext;

    constructor(message: Message, width: number, height: number, selections: string[]) {
        super(message);
        this.textSelectionContext = new TextSelectionContext(width, height, selections);
    }

    onLoad(_bot: Bot, _textWindowManager: TextWindowManager) {}

    render() {
        this.embedCreator.setDescription(this.textSelectionContext.render());
        this.update();
    }

    onInput(input: Input) {
        switch (input.inputType) {
            case InputType.CONFIRMATION:
                this.createMessageNotifier("Ausgewählter Wert: **" + this.textSelectionContext.getSelectedItem() + "**");
            case InputType.ABORT:
                this.windowManager.unload();
            break;
        }
        this.textSelectionContext.handleInput(
            input,
            () => {
                this.render();
                this.removeMessageNotifier();
            },
            (warning: string) => {
                this.createMessageNotifier(warning);
                this.render();
            }
        );
    }

    createMessageNotifier(warning: string) {
        this.embedCreator.setField("Achtung", warning);
        this.render();
    }

    removeMessageNotifier() {
        this.embedCreator.removeField("Achtung");
    }
}
