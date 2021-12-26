import TextWindow, { Input, InputType } from "./abstract/TextWindow";
import { TextSelectionContext } from "./TextSelectionContext";

export default class TextSelectionWindow extends TextWindow {
    textSelectionContext: TextSelectionContext;
    onConfirmation: (selection: number) => any;
    onSelect: (selection: number) => any;
    onCancel: () => any;

    constructor(width: number, height: number, selections: string[]) {
        super();
        this.textSelectionContext = new TextSelectionContext(width, height, selections);
    }

    render() {
        this.embedCreator.setDescription(this.textSelectionContext.render());
        this.update();
    }

    onLoad(): void {}

    onInput(input: Input) {
        switch (input.inputType) {
            case InputType.CONFIRMATION:
                this.onConfirmation(this.textSelectionContext.selection);
            break;
            case InputType.ABORT:
                this.onCancel();
            break;
        }
        this.textSelectionContext.handleInput(
            input,
            () => {
                if (this.onSelect) {
                    this.onSelect(this.textSelectionContext.selection);
                }

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

    unload(): boolean {
      return true;
    }
}
