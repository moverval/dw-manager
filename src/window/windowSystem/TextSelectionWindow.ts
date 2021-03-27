import TextWindow, { Input, InputType } from "../../abstract/TextWindow";
import { TextSelectionContext } from "../textStructure/TextSelectionContext";
import ReactionMessage from "../ReactionMessage";
import UserInputManager from "../UserInputManager";

export default class TextSelectionWindow extends TextWindow {
    textSelectionContext: TextSelectionContext;

    constructor(
        reactionMessage: ReactionMessage,
        userInputManager: UserInputManager,
        width: number,
        height: number,
        selections: string[]
    ) {
        super(userInputManager, reactionMessage);
        this.textSelectionContext = new TextSelectionContext(width, height);
        this.textSelectionContext.setInput(selections);
    }

    render() {
        this.embed.setDescription(this.textSelectionContext.render());
        this.update();
    }

    onInput(input: Input) {
        switch (input.inputType) {
            case InputType.CONFIRMATION:
            case InputType.ABORT:
            case InputType.MOVE_UP:
                this.textSelectionContext.moveUp();
                this.render();
                break;
            case InputType.MOVE_DOWN:
                this.textSelectionContext.moveDown();
                this.render();
                break;
            case InputType.MESSAGE:
                this.createMessageNotifier();
                break;
        }
    }

    createMessageNotifier() {
        this.embed.addField("Achtung", "Dieses Fenster unterstützt keine Texteingaben", false);
        this.render();
    }
}
