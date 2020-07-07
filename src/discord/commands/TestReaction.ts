import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Serializer from "../../filesystem/Serializer";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";

export default class TestReaction extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        if (args.length === 0) {
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
        } else if (args.length === 1) {
            if (args[0] === "shift") {
                const descriptions = [
                    "This is the first description",
                    "This is the second description",
                    "This is the last description",
                ];
                let site = 0;
                const embed = new MessageEmbed();
                embed.setTitle("Shift Example").setDescription(descriptions[0]);

                message.channel.send(embed).then((interactiveMessage) => {
                    const reactionMessage = this.bot.reactionManager.createMessage(
                        interactiveMessage,
                        "⬅️",
                        "➡️",
                        "❎"
                    );
                    reactionMessage.setReactionListener(0, (user) => {
                        if (site > 0) {
                            embed.setDescription(descriptions[--site]);
                            interactiveMessage.edit(embed);
                        }
                    });

                    reactionMessage.setReactionListener(1, (user) => {
                        if (site + 1 < descriptions.length) {
                            embed.setDescription(descriptions[++site]);
                            interactiveMessage.edit(embed);
                        }
                    });

                    reactionMessage.setReactionListener(2, (user) => {
                        reactionMessage.remove();
                        interactiveMessage.delete();
                    });
                });
            } else if(args[0] === "savecs") {
                Serializer.writeObject(this.bot.util.dp.parse("coinSystem.json"), this.coinSystem);
                message.channel.send("CoinSystem saved.");
            }
        }
        return ReturnValue.SUCCESS;
    }
}