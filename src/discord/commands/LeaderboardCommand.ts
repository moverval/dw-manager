import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../Bot";
import CoinSystem from "../../coinsystem/CoinSystem";

export default class LeaderboardCommand extends Command {
    coinSystem: CoinSystem;
    siteSize: number = 20;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke, false);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        const embed = new MessageEmbed();
        const guild = message.guild;
        const sortedAccountKeys = Object.keys(this.coinSystem.accounts).sort(
            (key1, key2) => this.coinSystem.accounts[key2].coins - this.coinSystem.accounts[key1].coins
        );
        let site = 0;
        if (args.length === 1) {
            const num = Number(args[0]);
            if (!isNaN(num) && num - 1 > 0) {
                site = num - 1;
            }
        }
        if (sortedAccountKeys.length - 1 >= site * this.siteSize) {
            let text = "";
            const nEnd = site * this.siteSize + this.siteSize;
            const end = nEnd > sortedAccountKeys.length ? sortedAccountKeys.length : nEnd;

            for (let i = site * this.siteSize; i < end; i++) {
                const account = this.coinSystem.accounts[sortedAccountKeys[i]];
                const user = guild.members.cache.get(account.userId);
                text += `${i + 1}. **${user ? user.user.username : "Unbekannt"}**: ${account.coins}\n`;
            }

            if (text === "") {
                text = "Keine Accounts vorhanden.";
            }

            embed
                .setDescription(text)
                .setTitle("Leaderboard")
                .setFooter(`Seite ${site + 1}/${Math.ceil((sortedAccountKeys.length - 1) / this.siteSize)}`);
            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send("Diese Seite existiert nicht.");
        }
        return ReturnValue.SUCCESS;
    }
}
