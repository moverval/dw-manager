import Bot from "../../../discord/Bot";
import { Message } from "discord.js";
import TextWindowManager from "../TextWindowManager";
import EmbedCreator from "../EmbedCreator";

export enum InputType {
    CONFIRMATION,
    ABORT,
    MOVE_UP,
    MOVE_DOWN,
    MESSAGE,
}

// User Action
export class Input {
    public inputType: InputType;
    public value: string;

    constructor(inputType: InputType, value: string) {
        this.inputType = inputType;
        this.value = value;
    }
}

// General rendered Window in Discord Chat
export default abstract class TextWindow {
    windowManager: TextWindowManager;
    embedCreator: EmbedCreator;
    message: Message;

    constructor(message: Message) {
        this.embedCreator = new EmbedCreator();
        this.message = message;
    }

    update(): void {
        this.message.edit({ embeds: [this.embedCreator.build()] });
    }

    abstract render(): void;
    abstract onLoad(bot: Bot, textWindowManager: TextWindowManager): void;
    abstract onInput(input: Input): void;
}
