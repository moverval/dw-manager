import { Message, MessageReaction, User, PartialUser } from "discord.js";
import EventHandler from "./EventHandler";
import ReactionMessage from "./ReactionMessage";
import { StringMap } from "../../Types";

export default class ReactionManager {
    private eventHandler: EventHandler;
    private messages: StringMap<ReactionMessage>;

    constructor(eventHandler: EventHandler) {
        this.eventHandler = eventHandler;
        this.messages = {};
        this.eventHandler.addEventListener("messageReactionAdd", this.reactionAddListener.bind(this));
    }

    createMessage(message: Message, ...reaction: string[]) {
        const reactionMessage = new ReactionMessage(message, this, ...reaction);
        this.messages[reactionMessage.message.id] = reactionMessage;

        return reactionMessage;
    }

    removeMessage(id: string) {
        this.messages[id] = undefined;
    }

    async reactionAddListener(reaction: MessageReaction, user: User | PartialUser) {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }

        if (user.partial) {
            user = await user.fetch();
        }

        if (user.bot) {
            return;
        }

        if (this.messages[reaction.message.id]) {
            this.messages[reaction.message.id].call(reaction.emoji, user as User);
            reaction.users.remove(user as User).catch();
        }
    }
}
