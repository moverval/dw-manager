import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";

export default class TestReaction extends Command {
    run(message: Message, args: string[]): ReturnValue {
        message.channel.send("Hello World!").then((newMessage) => {
            const reactionMessage = this.bot.reactionManager.createMessage(newMessage, "✅", "❎");
            reactionMessage.setReactionListener(0, (user) => {
                user.send("Test");
            });

            reactionMessage.setReactionListener(1, (user) => {
                reactionMessage.remove();
                reactionMessage.message.delete();
            });
        });

        return ReturnValue.SUCCESS;
    }
}
