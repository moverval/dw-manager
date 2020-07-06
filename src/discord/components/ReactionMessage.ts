import { Message, ReactionEmoji, GuildEmoji, User } from "discord.js";
import ReactionManager from "./ReactionManager";

export default class ReactionMessage {
    listener: Map<number, (user?: User) => any>;
    reactions: string[];
    reactionManager: ReactionManager;

    private Message: Message;

    constructor(message: Message, reactionManager: ReactionManager, ...reaction: string[]) {
        this.reactions = reaction;
        this.Message = message;
        this.reactionManager = reactionManager;
        this.listener = new Map();
        this.addReactions(0, reaction);
    }

    get message() {
        return this.Message;
    }

    /**
     *  First argument is 0
     */
    setReactionListener(index: number, listener: (user?: User) => any) {
        this.listener.set(index, listener);
    }

    remove() {
        this.reactionManager.removeMessage(this.message.id);
    }

    call(reaction: ReactionEmoji | GuildEmoji, user: User) {
        const index = this.reactions.indexOf(reaction.name);
        if (index !== -1) {
            if (this.listener.has(index)) {
                this.listener.get(index).bind(this)(user);
            }
        }
    }

    private addReactions(count: number, reactions: string[]) {
        if (count < reactions.length) {
            this.Message.react(reactions[count]).then(() => this.addReactions.bind(this)(++count, reactions));
        }
    }
}
