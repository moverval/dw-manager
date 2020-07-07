import Command from "../abstract/Command";
import { Message, MessageEmbed, User } from "discord.js";
import { ReturnValue } from "../abstract/Command";
import Bot from "../Bot";
import CoinSystem from "../../coinsystem/CoinSystem";
import Transfer from "../../coinsystem/Transfer";

export default class TransferCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        if (args.length === 2) {
            const receiver = message.mentions.users.array()[0];

            if (receiver) {
                const amount = Number(args[1]);

                if (!isNaN(amount)) {
                    const accountSender = this.coinSystem.getAccount(message.author.id);
                    const accountReceiver = this.coinSystem.getAccount(receiver.id);

                    if (accountSender.coins - amount >= 0) {
                        const transfer = new Transfer(amount);
                        this.coinSystem.registerTransfer(transfer);

                        const embed = new MessageEmbed();
                        embed
                            .setTitle(`Münzen an ${receiver.username} übertragen?`)
                            .setDescription("Dieser Vorgang kann von dir nicht wieder rückgängig gemacht werden")
                            .addField(
                                "Details",
                                `TransferID: ${transfer.id}; Sender: ${message.author.id}; Receiver: ${receiver.id}; Amount: ${transfer.amount}`
                            );

                        message.channel.send(embed).then((interactiveMessage) => {
                            const reactionMessage = this.bot.reactionManager.createMessage(
                                interactiveMessage,
                                "✅",
                                "❎"
                            );
                            reactionMessage.setReactionListener(0, (user) => {
                                if (user.id === message.author.id) {
                                    this.coinSystem.makeTransfer(transfer.id, accountSender, accountReceiver);
                                    this.coinSystem.removeTransfer(transfer.id);
                                    reactionMessage.remove();
                                    interactiveMessage.reactions.removeAll();
                                }
                            });
                            const abort = (user: User) => {
                                if (user.id === message.author.id) {
                                    this.coinSystem.removeTransfer(transfer.id);
                                    reactionMessage.remove();
                                    interactiveMessage.reactions.removeAll();
                                }
                            };

                            const timeoutHandler = setTimeout(() => abort(message.author), 60000);

                            reactionMessage.setReactionListener(1, (user) => {
                                clearTimeout(timeoutHandler);
                                abort(user);
                            });
                        });
                    }
                }
            }
        }

        return ReturnValue.SUCCESS;
    }
}
