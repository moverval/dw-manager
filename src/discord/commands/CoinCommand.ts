import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed, User } from "discord.js";
import Bot from "../Bot";
import CoinSystem from "../../coinsystem/CoinSystem";

export default class CoinCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        if(args.length === 0) {
            const account = this.coinSystem.getAccount(message.author.id);
            const embed = new MessageEmbed();
            embed.setTitle("Coins").setDescription("Du besitzt zurzeit **" + account.coins + "** Münzen.");
            message.channel.send({
              embeds: [embed],
            });
        } else {
            const embed = new MessageEmbed();
            let user: User;

            if(message.mentions.users.size == 1) {
                user = message.mentions.users.at(0);
            } else if(args.length === 1) {
                const member = message.guild.members.cache.get(args[0]);
                if(member) {
                    user = member.user;
                }
            }

            if(user) {
                if(this.coinSystem.isAccount(user.id)) {
                    const account = this.coinSystem.getAccount(user.id);
                    embed.setTitle("Coins: " + user.username).setDescription(`${user.username} besitzt zurzeit **${account.coins}** Münzen.`);
                } else {
                    embed.setTitle("Fehler").setDescription("Keinen Account gefunden");
                }
            } else {
                embed.setTitle("Fehler").setDescription("Nutzer nicht gefunden.");
            }

            message.channel.send({
              embeds: [embed],
            });
        }

        return ReturnValue.SUCCESS;
    }
}
