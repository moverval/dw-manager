import { MessageEmbed } from "discord.js";
import UserInputManager from "../components/UserInputManager";
import ReactionMessage from "../components/ReactionMessage";

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
    userInputManager: UserInputManager;
    reactionMessage: ReactionMessage;
    embed: MessageEmbed;

    constructor(userInputManager: UserInputManager, reactionMessage: ReactionMessage) {
        this.userInputManager = userInputManager;
        this.reactionMessage = reactionMessage;
    }

    abstract render(): void;

    update(): void {
        this.reactionMessage.message.edit(this.embed);
    }

    abstract onInput(input: Input): void;
}
