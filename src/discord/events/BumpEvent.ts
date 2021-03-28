import CoinSystem from "../../coinsystem/CoinSystem";
import { Message } from "discord.js";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import EventModule, { ClientEvent } from "../abstract/EventModule";
import Bot from "../Bot";

export default class BumpEvent extends EventModule {
    coinSystem: CoinSystem;

    dotBumpPossible: boolean;
    dBumpPossible: boolean;

    constructor(bot: Bot, coinSystem: CoinSystem) {
        super("BumpReward", bot);

        this.coinSystem = coinSystem;
        this.dotBumpPossible = true;
        this.dBumpPossible = true;
    }

    @ClientEvent("message")
    BumpMade(message: Message) {
        if (message.channel.type === "dm") {
            return;
        }

        if (message.guild.id === process.env.MAIN_GUILD) {
            if (!this.coinSystem.isAccount(message.author.id)) {
                return;
            }

            const account = this.coinSystem.getAccount(message.author.id);

            if (message.content === "!d bump") {
                if (this.dBumpPossible) {
                    this.dBumpPossible = false;
                    account.add(AccountEarnType.BUMP_MADE, 1);

                    setTimeout(() => {
                        this.dBumpPossible = true;
                    }, 72e5); // 2 Hours
                }
            } else if (message.content === ".bump") {
                if (this.dotBumpPossible) {
                    this.dotBumpPossible = false;
                    account.add(AccountEarnType.BUMP_MADE, 1);

                    setTimeout(() => {
                        this.dotBumpPossible = true;
                    }, 72e5); // 2 Hours
                }
            }
        }
    }
}
