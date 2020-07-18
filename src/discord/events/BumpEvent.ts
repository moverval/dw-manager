import CoinSystem from "../../coinsystem/CoinSystem";
import { Message } from "discord.js";
import {AccountEarnType} from "../../coinsystem/AccountEarnConfig";

export default function BumpEvent(coinSystem: CoinSystem) {
    let bump1Possible = true;
    let bump2Possible = true;

    return (message: Message) => {
        if(message.guild.id === process.env.MAIN_GUILD) {
            const account = coinSystem.getAccount(message.author.id);

            if (message.content === "!d bump") {
                if(bump1Possible) {
                    bump1Possible = false;
                    account.add(AccountEarnType.BUMP_MADE, 1);

                    setTimeout(() => {
                        bump1Possible = true;
                    }, 72e5); // 2 Hours
                }
            } else if(message.content === ".bump") {
                if(bump2Possible) {
                    bump2Possible = false;
                    account.add(AccountEarnType.BUMP_MADE, 1);

                    setTimeout(() => {
                        bump2Possible = true;
                    }, 72e5); // 2 Hours
                }
            }

        }
    };
}
