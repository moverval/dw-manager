import TextContext from "./abstract/TextContext";

export class TextSelectionContext extends TextContext {
    items: string[];
    width: number;
    height: number;
    moveOffset: number;
    selection: number;

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
    }

    private center(text: string): string {
        const shift = (this.width - text.length) / 2;
        const leftShift = Math.floor(shift);
        const rightShift = Math.ceil(shift);

        return " ".repeat(leftShift) + text + " ".repeat(rightShift);
    }

    private addSelection(text: string) {
        return "->" + text.slice(2, text.length);
    }

    private makeArrowUp(text: string) {
        return text.substr(0, text.length - 1) + "⬆️";
    }

    private makeArrowDown(text: string) {
        return text.substr(0, text.length - 1) + "⬇️";
    }

    setInput(items: string[]) {
        this.items = items;
    }

    moveUp() {
        this.selection += 1;
        this.updateView();
    }

    moveDown() {
        this.selection -= 1;
        this.updateView();
    }

    moveTo(selection: number) {
        this.selection = selection;
        this.updateView();
    }

    updateView() {
        if (this.selection < this.moveOffset) {
            this.moveOffset = this.selection;
        } else if (this.selection > this.moveOffset + this.height) {
            this.moveOffset = this.selection - this.height;
        }
    }

    render() {
        let text = "";
        const size = (this.items.length > this.moveOffset + this.height ? this.moveOffset + this.height : this.items.length);

        for (let i = this.moveOffset; i < size; ++i) {
            let item = this.center(this.items[i]);
            if (i === this.selection) {
                item = this.addSelection(item);
            }

            switch (i) {
                case this.moveOffset: {
                    if (this.moveOffset > 0) {
                        item = this.makeArrowUp(item);
                    }
                }
                break;

                case size: {
                    if (size < this.items.length) {
                        item = this.makeArrowDown(item);
                    }
                }
                break;
            }

            text += item + "\n";
        }

        return text;
    }
}
