import TextWindow, {Input, InputType} from "./abstract/TextWindow";
import wrap from "word-wrap";

export default class TextPromtWindow extends TextWindow {
    question: string;
    description: string;
    onPositive: (input: string) => any;
    onNegative: () => any;
    input: string;
    width: number;

    constructor(question: string, description: string | null = null, width: number, input = "") {
        super();
        this.question = question;
        this.description = description;
        this.width = width;
        this.input = input;
    }

    onLoad(): void {
    }

    render(): void {
        this.embedCreator.statusFields.set("footer", "Nutze die Reaktionen um die Nachricht\nzu bestätigen oder abzulehnen");
        this.embedCreator.setDescription(
            `**${wrap(this.question, {width: this.width, indent: ""})}**\n\n${wrap(this.description, {width: this.width, indent: ""})}` +
            `\n\n\`\`\`\n${wrap(this.input, {width: this.width, indent: ""})}\`\`\``
        );
        this.update();
    }

    onInput(input: Input): void {
        switch (input.inputType) {
            case InputType.CONFIRMATION:
                this.onPositive(this.input);
                break;

            case InputType.ABORT:
                this.onNegative();
                break;

            case InputType.MESSAGE:
                this.input = input.value;
                this.render(); // Update input
                break;

            default:
                this.render(); // Render addin actions
                break;
        }
    }

    unload(): boolean {
        return true;
    }
}
