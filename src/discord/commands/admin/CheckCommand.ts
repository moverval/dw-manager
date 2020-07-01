import Command, { ReturnValue } from "../../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../../Bot";
import CoinSystem from "../../../coinsystem/CoinSystem";
import Account from "../../../coinsystem/Account";

export default class CheckCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke, false);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        // Ceck if all Systems are syncronized
        // Check if all Users have an Account
        if (message.member.hasPermission("ADMINISTRATOR")) {
            message.guild.members.fetch().then((members) => {
                let log = "";
                members.array().forEach((member) => {
                    if (!this.coinSystem.isAccount(member.user.id)) {
                        log += `User ${message.member.user.username} was added to CoinSystem\n`;
                        const account = new Account(this.coinSystem, message.member.user.id);
                        this.coinSystem.addAccount(account);
                    }
                });
                const embed = new MessageEmbed();
                embed.setTitle("Log").setDescription(log);
                message.channel.send(embed);
            });
        }
        return ReturnValue.SUCCESS;
    }
}
