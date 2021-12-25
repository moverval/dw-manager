import UserInputManager from "../../discord/components/UserInputManager";
import { Message, User } from "discord.js";
import ReactionMessage from "../../discord/components/ReactionMessage";
import TextWindow, { InputType, Input } from "./abstract/TextWindow";
import { Unloadable } from "../../Types";

export default class InputContext implements Unloadable {
    inputManager: UserInputManager;
    reactionMessage: ReactionMessage;
    userId: string;
    channelId: string;
    window: TextWindow;

    constructor(reactionMessage: ReactionMessage, inputManager: UserInputManager, userId: string) {
        this.inputManager = inputManager;
        this.userId = userId;
        this.channelId = reactionMessage.message.channel.id;
        this.reactionMessage = reactionMessage;
    }

    load() {
        this.inputManager.setInputFunction(this.userId, this.channelId, this.inputFunction.bind(this));
        this.reactionMessage.setReactionListener(0, this.makeReactionListener(InputType.MOVE_UP).bind(this));
        this.reactionMessage.setReactionListener(1, this.makeReactionListener(InputType.MOVE_DOWN).bind(this));
        this.reactionMessage.setReactionListener(2, this.makeReactionListener(InputType.CONFIRMATION).bind(this));
        this.reactionMessage.setReactionListener(3, this.makeReactionListener(InputType.ABORT).bind(this));
    }

    // Can also get null as parameter
    setWindow(window: TextWindow) {
        this.window = window;
    }

    makeReactionListener(inputType: InputType) {
        return (user?: User) => {
            if (this.window && user?.id == this.userId) {
                this.window.onInput(new Input(inputType, ""));
            }
        };
    }

    inputFunction(message: Message) {
        if (this.window) {
            this.window.onInput(new Input(InputType.MESSAGE, message.content));
        }
    }

    unload() {
        this.inputManager.clearInputFunction(this.userId, this.channelId);
    }
}
