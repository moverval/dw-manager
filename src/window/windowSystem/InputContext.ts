import { Message, User } from "discord.js";
import { InputType, Input } from "./abstract/TextWindow";
import { Unloadable } from "../../Types";
import TextWindowManager from "./TextWindowManager";

export default class InputContext implements Unloadable {
    userId: string;
    channelId: string;
    manager: TextWindowManager;

    constructor(manager: TextWindowManager, userId: string) {
        this.userId = userId;
        this.manager = manager;
        this.channelId = this.manager.reactionMessage.message.channel.id;
    }

    load() {
        this.manager.bot.userInputManager.setInputFunction(this.userId, this.channelId, this.inputFunction.bind(this));
        this.manager.reactionMessage.setReactionListener(0, this.makeReactionListener(InputType.MOVE_UP).bind(this));
        this.manager.reactionMessage.setReactionListener(1, this.makeReactionListener(InputType.MOVE_DOWN).bind(this));
        this.manager.reactionMessage.setReactionListener(2, this.makeReactionListener(InputType.CONFIRMATION).bind(this));
        this.manager.reactionMessage.setReactionListener(3, this.makeReactionListener(InputType.ABORT).bind(this));
    }

    makeReactionListener(inputType: InputType) {
        return (user?: User) => {
            if (user?.id == this.userId) {
                this.manager.onInput(new Input(inputType, ""))
            }
        };
    }

    inputFunction(message: Message) {
        this.manager.onInput(new Input(InputType.MESSAGE, message.content));
    }

    unload() {
        this.manager.bot.userInputManager.clearInputFunction(this.userId, this.channelId);
    }
}
