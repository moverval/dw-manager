import { Message } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";

export default function WordManager(cs: CoinSystem) {
    return (message: Message) => {
        const account = cs.getAccount(message.author.id);
        const splits = message.content.split(" ");
        const real = splits.filter((split) => split.length > 3);
        account.add(AccountEarnType.WORD_SENT, real.length);
    };
}
