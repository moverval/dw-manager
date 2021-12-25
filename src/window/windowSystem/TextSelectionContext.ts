import TextContext from "./abstract/TextContext";
import {Input, InputType} from "./abstract/TextWindow";

export class TextSelectionContext extends TextContext {
    items: string[];
    width: number;
    height: number;
    moveOffset: number;
    selection: number;

    constructor(width: number, height: number, items: string[]) {
        super();
        this.items = items;
        this.width = width;
        this.height = height;
        this.moveOffset = 0;
        this.selection = 0;
    }

    private makeCounter() {
        return `[${this.selection + 1}/${this.items.length}]`;
    }

    private makeSelectionSize(offset: number) {
        return 3 + offset;
    }

    private makeNamePart(selectionSize: number, counter: string, text: string) {
        return text.slice(0, this.width - selectionSize - counter.length - 3);
    }

    private addSelection(text: string, offset: number, counter: string) {
        const selectionMarker = "#->" + " ".repeat(offset);
        const selectionText = this.makeNamePart(selectionMarker.length, counter, text);
        const selection = selectionMarker + selectionText;
        return selection + " ".repeat(this.width - selection.length - counter.length - 2) + counter;
    }

    private makeArrowUp(text: string) {
        const width = this.width - 1;
        const displayText = text.slice(0, width);
        return displayText + " ".repeat(width - displayText.length) + "⬆️";
    }

    private makeArrowDown(text: string) {
        const width = this.width - 1;
        const displayText = text.slice(0, width);
        return displayText + " ".repeat(width - displayText.length) + "⬇️";
    }

    moveDown() {
        if (this.selection < this.items.length - 1) {
            this.selection += 1;
            this.updateView();
        }
    }

    moveUp() {
        if (this.selection > 0) {
            this.selection -= 1;
            this.updateView();
        }
    }

    moveTo(selection: number): boolean {
        if (selection >= 0 && selection <= this.items.length - 1) {
            this.selection = selection;
            this.updateView();
            return true;
        } else {
            return false;
        }
    }

    updateView() {
        if (this.selection < this.moveOffset) {
            this.moveOffset = this.selection;
        } else if (this.selection >= this.moveOffset + this.height) {
            this.moveOffset = this.selection - this.height + 1;
        }
    }

    getSelectedItem(): string {
        return this.items[this.selection];
    }

    getSelection(): number {
        return this.selection;
    }

    handleInput(input: Input, onOk: () => any, onWarning: (text: string) => any) {
        switch (input.inputType) {
            case InputType.MOVE_UP:
                this.moveUp();
                if (onOk) {
                    onOk();
                }
                break;
            case InputType.MOVE_DOWN:
                this.moveDown();
                if (onOk) {
                    onOk();
                }
                break;
            case InputType.MESSAGE:
                const number = Number(input.value);
                if (!isNaN(number)) {
                    const success = this.moveTo(number - 1);
                    if (!success && onWarning) {
                        onWarning("Eingabe muss in Größe der Liste liegen");
                        return;
                    }
                    if (onOk) {
                        onOk();
                    }
                } else {
                    if (onWarning) {
                        onWarning("Eingabe muss eine Nummer sein");
                    }
                }
                break;
        }
    }

    render() {
        let text = "```md\n";
        const size = (this.items.length > this.moveOffset + this.height ? this.moveOffset + this.height : this.items.length);

        const offset = (this.items.length + 1).toString().length;

        const counter = this.makeCounter();

        const selectionSize = this.makeSelectionSize(offset);

        for (let i = this.moveOffset; i < size; ++i) {
            let item = this.items[i];

            switch (i) {
                case this.selection: {
                    item = this.addSelection(item, offset, counter);
                }
                break;
                default: {
                    const number = (i + 1).toString();
                    item = number + ". " + " ".repeat(offset - number.length) + this.makeNamePart(selectionSize, counter, item);
                }
                break;
            }

            switch (i) {
                case this.moveOffset: {
                    if (this.moveOffset > 0) {
                        item = this.makeArrowUp(item);
                    }
                }
                break;

                case size - 1: {
                    if (size < this.items.length) {
                        item = this.makeArrowDown(item);
                    }
                }
                break;
            }

            text += item + "\n";
        }

        text += "```";

        return text;
    }
}
