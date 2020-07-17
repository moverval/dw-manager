import TextWindow from "./TextWindow";

export default class TextSelectionWindow extends TextWindow {
    selections: string[];
    selection: number;
    movement: number;

    constructor(width: number, maxHeight: number, selections: string[]) {
        super(width, maxHeight);
        this.selections = selections;
        this.selection = 0;
        this.movement = this.selection;
    }

    render() {
        let text = "";
        let end = this.movement + this.height;
        if(end > this.selections.length) {
            end = this.selections.length;
        }

        if(end === this.movement) {
            return;
        }

        text = this.renderLineFull(this.movement);

        if(this.movement > 0) {
            text = this.makeArrowUp(text);
        }

        for (let i = this.movement + 1; i < end; i++) {
            let subText = "";

            subText = this.renderLineFull(i);

            text += subText;
        }

        if(this.movement + this.height < this.selections.length) {
            text = this.makeArrowDown(text);
        }

        return text;
    }

    update() {
        if(this.selection >= this.movement + this.height) {
            this.movement = this.selection + 1 - this.height;
        } else if(this.selection < this.movement) {
            this.movement = this.selection;
        }
        return;
    }

    private renderLineFull(i: number) {
        let subText = "";

        if (i === this.selection) {
            subText += this.renderLineSelected(this.selections[i]);
        } else {
            subText += this.renderLine(this.selections[i]);
        }

        return subText;
    }

    private renderLine(text: string) {
        const widthLeft = this.centerLeftWidth(text);
        const widthRight = this.centerRightWidth(text);
        return " ".repeat(widthLeft) + text + " ".repeat(widthRight) + "\n";
    }

    private renderLineSelected(text: string) {
        const textRendered = this.renderLine(text);
        return "# ->" + textRendered.substr(4);
    }

    private makeArrowUp(text: string) {
        return text.substr(0, text.length - 2) + "⬆️\n";
    }

    private makeArrowDown(text: string) {
        return text.substr(0, text.length - 2) + "⬇️\n";
    }
}
