import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../Bot";
import CoinSystem from "../../coinsystem/CoinSystem";

export default class CoinCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        const account = this.coinSystem.getAccount(message.author.id);
        const embed = new MessageEmbed();
        embed.setTitle("Coins").setDescription("Du besitzt zurzeit **" + account.coins + "** Münzen.");
        message.channel.send(embed);

        return ReturnValue.SUCCESS;
    }
}
