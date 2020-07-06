import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";

export default class GiveCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        const mentionedUser = message.mentions.users.array()[0];
        const messageNumber = Number(args[1]);

        if (mentionedUser && args.length === 2 && !isNaN(messageNumber)) {
            const accountSender = this.coinSystem.getAccount(message.author.id);
            const accountReceiver = this.coinSystem.getAccount(mentionedUser.id);

            if (accountSender.coins > messageNumber) {
                const transfer = this.coinSystem.addTransferRequest(accountSender, accountReceiver, messageNumber);
                this.coinSystem.acceptTransfer(transfer);
                message.channel.send("Money has been sent to user " + mentionedUser.username);
            } else {
                message.channel.send("Du besitzt nicht genug Geld");
                return ReturnValue.FAILED_EXECUTING;
            }
        }

        return ReturnValue.SUCCESS;
    }
}
