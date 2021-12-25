import Command, { ReturnValue } from "../../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../../Bot";
import CoinSystem from "../../../coinsystem/CoinSystem";

export default class CheckCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke, false);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            message.guild.members.fetch().then((members) => {
                members.forEach((member) => {
                    this.coinSystem.getAccount(member.user.id);
                });
            });

            message.channel.send("Alle Nutzer besitzen nun einen Account");
        }
        return ReturnValue.SUCCESS;
    }
}
