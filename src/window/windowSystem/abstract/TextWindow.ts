import Bot from "../../../discord/Bot";
import { Message } from "discord.js";
import TextWindowManager from "../TextWindowManager";
import EmbedCreator from "../EmbedCreator";
import { Unloadable } from "../../../Types";

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
export default abstract class TextWindow implements Unloadable {
    windowManager: TextWindowManager;
    embedCreator: EmbedCreator;
    bot: Bot;

    get message() {
      return this.windowManager.reactionMessage.message;
    }

    constructor() {
        this.embedCreator = new EmbedCreator();
    }

    update(): void {
        this.message.edit({ embeds: [this.embedCreator.build()], content: " " });
    }

    abstract onLoad(): void;

    abstract render(): void;
    abstract onInput(input: Input): void;
    abstract unload(): boolean;
}
