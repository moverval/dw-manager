import { Message, MessageReaction, User, PartialUser, PartialMessageReaction } from "discord.js";
import EventHandler from "./EventHandler";
import ReactionMessage, { ReactionType } from "./ReactionMessage";
import { StringMap } from "../../Types";

export default class ReactionManager {
    private eventHandler: EventHandler;
    private Messages: StringMap<ReactionMessage>;

    constructor(eventHandler: EventHandler, reactionHandle: ReactionHandle = ReactionHandle.BUTTON) {
        this.eventHandler = eventHandler;
        this.Messages = {};
        if (reactionHandle === ReactionHandle.BUTTON) {
            this.eventHandler.addEventListener("messageReactionAdd", this.reactionButton.bind(this));
        } else if(reactionHandle === ReactionHandle.COUNTER) {
            this.eventHandler.addEventListener("messageReactionAdd", this.reactionCounter(ReactionType.CALL).bind(this));
            this.eventHandler.addEventListener("messageReactionRemove", this.reactionCounter(ReactionType.CANCEL).bind(this));
        }
    }

    get messages() {
        return this.Messages;
    }

    clearMessages() {
        this.Messages = {};
    }

    createMessage(message: Message, ...reaction: string[]) {
        const reactionMessage = new ReactionMessage(message, this, ...reaction);
        this.Messages[reactionMessage.message.id] = reactionMessage;

        return reactionMessage;
    }

    removeMessage(id: string) {
        this.Messages[id] = undefined;
    }

    async reactionButton(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }

        if (user.partial) {
            user = await user.fetch();
        }

        if (user.bot) {
            return;
        }

        if (this.Messages[reaction.message.id]) {
            this.Messages[reaction.message.id].call(reaction.emoji, user as User);
            reaction.users.remove(user as User).catch();
        }
    }

    reactionCounter(reactionType: ReactionType) {
        return async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
            if (reaction.partial) {
                reaction = await reaction.fetch();
            }

            if (user.partial) {
                user = await user.fetch();
            }

            if (user.bot) {
                return;
            }

            if (this.Messages[reaction.message.id]) {
                this.Messages[reaction.message.id].call(reaction.emoji, user as User, reactionType);
            }
        };
    }
}

export enum ReactionHandle {
    BUTTON,
    COUNTER,
}
