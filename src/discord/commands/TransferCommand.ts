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
        if (message.mentions.users.size === 1) {
            const receiver = message.mentions.users.array()[0];

            if (receiver.id === message.author.id) {
                message.channel.send("...");
                return;
            }

            if (receiver) {
                const amount = Number(args[0]);

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
                            )
                            .addField("Status", "Interaktion erforderlich");

                        message.channel.send(embed).then((interactiveMessage) => {
                            const reactionMessage = this.bot.reactionManager.createMessage(
                                interactiveMessage,
                                "✅",
                                "❎"
                            );

                            const timeoutHandler = setTimeout(() => abort(message.author), 60000);

                            reactionMessage.setReactionListener(0, (user) => {
                                if (user.id === message.author.id) {
                                    clearTimeout(timeoutHandler);
                                    this.coinSystem.makeTransfer(transfer.id, accountSender, accountReceiver);
                                    this.coinSystem.removeTransfer(transfer.id);
                                    reactionMessage.remove();
                                    embed.fields[1].value = "Akzeptiert";
                                    interactiveMessage.edit(embed);
                                    interactiveMessage.reactions.removeAll();
                                }
                            });
                            const abort = (user: User) => {
                                if (user.id === message.author.id) {
                                    this.coinSystem.removeTransfer(transfer.id);
                                    reactionMessage.remove();
                                    embed.fields[1].value = "Abgelehnt";
                                    interactiveMessage.edit(embed);
                                    interactiveMessage.reactions.removeAll();
                                }
                            };


                            reactionMessage.setReactionListener(1, (user) => {
                                clearTimeout(timeoutHandler);
                                abort(user);
                            });
                        });
                    } else {
                        const embed = new MessageEmbed();
                        embed
                            .setTitle("Zu wenig Geld")
                            .setDescription("Du besitzt zu wenig Geld um diesen Betrag zu überweisen");
                        message.channel.send(embed);
                    }
                } else {
                    return ReturnValue.WRONG_NOTATION;
                }
            } else {
                return ReturnValue.WRONG_NOTATION;
            }
        } else if(args.length === 3) {
            if(message.guild.id === process.env.MAIN_GUILD) {
                if(message.member.permissions.has("ADMINISTRATOR")) {
                    const accountSenderExists = args[0] === "sys" ? false : true;
                    const accountReceiverExists = args[1] === "sys" ? false : true;

                    let accountSender = null;
                    let accountReceiver = null;

                    if(accountSenderExists) {
                        if(this.coinSystem.isAccount(args[0])) {
                            accountSender = this.coinSystem.accounts[args[0]].userId;
                        } else {
                            const subEmbed = new MessageEmbed();
                            subEmbed.setTitle("Fehler").setDescription("Account mit der ID '" + args[0] + "' nicht gefunden");
                            message.channel.send(subEmbed);
                            return ReturnValue.FAILED_EXECUTING;
                        }
                    }

                    if(accountReceiverExists) {
                        if(this.coinSystem.isAccount(args[1])) {
                            accountReceiver = this.coinSystem.accounts[args[1]].userId;
                        } else {
                            const subEmbed = new MessageEmbed();
                            subEmbed.setTitle("Fehler").setDescription("Account mit der ID '" + args[1] + "' nicht gefunden");
                            message.channel.send(subEmbed);
                            return ReturnValue.FAILED_EXECUTING;
                        }
                    }

                    const amount = Number(args[2]);

                    if(isNaN(amount)) {
                        const subEmbed = new MessageEmbed();
                        subEmbed.setTitle("Fehler").setDescription("Der 3. Parameter muss eine Zahl sein");
                        message.channel.send(subEmbed);
                        return ReturnValue.FAILED_EXECUTING;
                    }

                    const transfer = new Transfer(amount);
                    this.coinSystem.registerTransfer(transfer);
                    this.coinSystem.makeSystemTransfer(transfer.id, accountSender, accountReceiver);
                    this.coinSystem.removeTransfer(transfer.id);
                    const embed = new MessageEmbed();
                    embed.setTitle("Erfolgreich").setDescription("Übertragung wurde ausgeführt");
                    message.channel.send(embed);
                    return ReturnValue.SUCCESS;
                }
            }

            return ReturnValue.WRONG_NOTATION;
        } else {
            return ReturnValue.WRONG_NOTATION;
        }

        return ReturnValue.SUCCESS;
    }
}
