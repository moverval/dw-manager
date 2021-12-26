import TextWindow, {Input, InputType} from "./abstract/TextWindow";
import wrap from "word-wrap";

export default class YesNoPromtWindow extends TextWindow {
    question: string;
    description: string;
    onPositive: () => any;
    onNegative: () => any;
    width: number;

    constructor(question: string, description: string | null = null, width: number) {
        super();
        this.question = question;
        this.description = description;
        this.width = width;
    }

    onLoad(): void {
    }

    render(): void {
        this.embedCreator.statusFields.set("footer", "Nutze die Reaktionen um die Nachricht\nzu bestätigen oder abzulehnen");
        this.embedCreator.setDescription(
            `**${wrap(this.question, {width: this.width, indent: ""})}**\n\n${wrap(this.description, {width: this.width, indent: ""})}`
        );
        this.update();
    }

    onInput(input: Input): void {
        this.render(); // Render addin actions
        switch (input.inputType) {
            case InputType.CONFIRMATION:
                this.onPositive();
                break;

            case InputType.ABORT:
                this.onNegative();
                break;
        }
    }

    unload(): boolean {
        return true;
    }
}
