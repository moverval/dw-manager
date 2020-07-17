import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import TextSelectionWindow from "../components/TextSelectionWindow";
import ShopSystem, { ShopRegister, BuyStatus, ShopItem } from "../../coinsystem/shop/ShopSystem";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";
import TextWindow from "../components/TextWindow";

export default class ShopCommand extends Command {
    loadingMessage: string = "Laden...";
    categoryDescriptionEmpty: string = "Keine Beschreibung verfügbar :(";

    coinSystem: CoinSystem;

    width: number = 34;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        const embed = new MessageEmbed();
        embed.setTitle("Shop").setDescription(this.loadingMessage).setFooter("");

        message.channel.send(embed).then((interactiveMessage) => {
            this.displayHomeWindow(message, interactiveMessage, embed);
        });

        return ReturnValue.SUCCESS;
    }

    private displayHomeWindow(message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const homeWindow = new TextSelectionWindow(this.width, 3, ["Kaufen", "Verkaufen", "Inventar", "Schließen"]);
        const reactionMessage = this.bot.reactionManager.createMessage(interactiveMessage, "⬆️", "⬇️", "☑️");

        reactionMessage.onReactionsAdded = () => {
            embed.setFooter("Du kannst mit den unten angeführten Reaktionen die\nSteuerfläche navigieren.");
            this.drawMessage(this.makeHomeText(homeWindow), interactiveMessage, embed);
        };

        reactionMessage.setReactionListener(0, (user) => {
            if (user.id === message.author.id) {
                if (homeWindow.selection > 0) {
                    homeWindow.selection -= 1;
                    this.drawMessage(this.makeHomeText(homeWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(1, (user) => {
            if (user.id === message.author.id) {
                if (homeWindow.selection < homeWindow.selections.length - 1) {
                    homeWindow.selection += 1;
                    this.drawMessage(this.makeHomeText(homeWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(2, (user) => {
            embed.setFooter("");
            this.drawMessage(this.loadingMessage, interactiveMessage, embed);

            reactionMessage.onReactionsRemoved = () => {
                reactionMessage.remove();
                switch (homeWindow.selection) {
                    case 0: // Shop
                        this.displayShopCategoryWindow([], message, interactiveMessage, embed);
                        break;

                    case 3:
                        this.drawMessage("Geschlossen.", interactiveMessage, embed);
                        return;

                    default:
                        this.displayNotImplementedYetWindow(message, interactiveMessage, embed);
                        break;
                }
            };

            reactionMessage.removeReactions();
        });
    }

    private makeHomeText(window: TextSelectionWindow) {
        window.update();
        return "Wähle die gewünschte Aktion aus\n```md\n" + window.render() + "```";
    }

    private displayBuyWindow(mark: ShopRegister, message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const buyWindow = new TextSelectionWindow(this.width, 2, ["Nein", "Ja"]);
        const reactionMessage = this.bot.reactionManager.createMessage(interactiveMessage, "⬆️", "⬇️", "☑️");
        const account = this.coinSystem.getAccount(message.author.id);
        let item = ShopSystem.findCheapest(mark)[0];
        let mode = 0;
        let buySuccess = false;

        reactionMessage.setReactionListener(0, (user) => {
            if (user.id === message.author.id) {
                if (buyWindow.selection > 0 && mode === 0) {
                    buyWindow.selection -= 1;
                    this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(1, (user) => {
            if (user.id === message.author.id && mode === 0) {
                if (buyWindow.selection + 1 < buyWindow.selections.length) {
                    buyWindow.selection += 1;
                    this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(2, (user) => {
            if (user.id === message.author.id) {
                if(mode === 0) {
                    this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                    switch (buyWindow.selection) {
                        case 0:
                            reactionMessage.onReactionsRemoved = () => {
                                reactionMessage.remove();
                                embed.fields = [];
                                this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                                this.displayHomeWindow(message, interactiveMessage, embed);
                            };
                            reactionMessage.removeReactions();
                            return;

                        case 1:
                            mode = 1;
                            const response = this.coinSystem.shopSystem.buyItem(mark, account, item.id);
                            if(response === BuyStatus.SUCCESS) {
                                buySuccess = true;
                            }
                            embed.fields = [];
                            this.drawMessage(this.makeBuyCompleteText(response), interactiveMessage, embed);
                            break;
                    }
                } else if(mode === 1) {
                    if(buySuccess) {
                        reactionMessage.onReactionsRemoved = () => {
                            reactionMessage.remove();
                            this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                            this.displayHomeWindow(message, interactiveMessage, embed);
                        };

                        reactionMessage.removeReactions();
                    } else {
                        mode = 0;
                        item = ShopSystem.findCheapest(mark)[0];

                        if(!item) {
                            reactionMessage.onReactionsRemoved = () => {
                                reactionMessage.remove();
                                this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                                this.displayHomeWindow(message, interactiveMessage, embed);
                            };
                            reactionMessage.removeReactions();
                            return;
                        }

                        this.makeBuyDetails(embed, item);
                        this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
                    }
                }
            }
        });

        reactionMessage.onReactionsAdded = () => {
            if (item) {
                this.makeBuyDetails(embed, item);
                this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
            }
        };
    }

    private makeBuyText(window: TextWindow) {
        window.update();
        return "Möchtest du den Gegenstand wirklich kaufen?\n```md\n" + window.render() + "```";
    }

    private makeBuyDetails(embed: MessageEmbed, item: ShopItem) {
        embed.fields = [];
        const guild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);
        let username = null;
        if(item.contributorId === "*") {
            username = "SYSTEM";
        } else {
            if(guild) {
                const user = guild.members.cache.get(item.contributorId);
                if(user) {
                    username = user.user.username;
                }
            }
        }
        embed.addField("Verkaufsdetails", `**Preis:** ${item.price}\n**Verkäufer:** ${username ? username : "Unbekannt"}\n**Item ID:** ${item.id.slice(0, 20)}`);
    }

    private makeBuyCompleteText(response: BuyStatus) {
        let text;

        switch(response) {
            case BuyStatus.SUCCESS:
                text = "Kauf wurde abgeschlossen. Vielen Dank für den Einkauf!";
                break;

            case BuyStatus.INVALID_CATEGORY:
                text = "Sorry, irgendwie ist ein Bug aufgetreten. Versuche es später noch einmal.";
                break;

            case BuyStatus.ITEM_ALREADY_SOLD:
                text = "Dein Item wurde bereits von jemand anderem aufgekauft :(";
                break;

            case BuyStatus.INVALID_TRANSACTION:
                text = "Sorry, aber es sieht so aus als hättest du zu wenig Geld für den Kauf.";
                break;
        }

        return text;
    }

    private displayShopCategoryWindow(
        nav: string[],
        message: Message,
        interactiveMessage: Message,
        embed: MessageEmbed
    ) {
        let mark: ShopRegister;

        if (nav.length === 0) {
            mark = this.coinSystem.shopSystem.shopRegister;
        } else {
            mark = this.coinSystem.shopSystem.point(nav.join("."), ShopSystem.point_cancel);
        }

        const categoryWindow = new TextSelectionWindow(this.width, 5, this.updateKeys(mark));
        const reactionMessage = this.bot.reactionManager.createMessage(interactiveMessage, "⬆️", "⬇️", "☑️", "🔴");

        reactionMessage.onReactionsAdded = () => {
            embed.fields = [];
            embed.addField("Beschreibung", this.makeCategoryDescription(mark, categoryWindow.selection, this.width));
            this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
            this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);
        };

        reactionMessage.setReactionListener(0, (user) => {
            if (user.id === message.author.id) {
                if (categoryWindow.selection > 0) {
                    categoryWindow.selection -= 1;
                    embed.fields[0].value = this.makeCategoryDescription(mark, categoryWindow.selection, this.width);
                    this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
                    this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(1, (user) => {
            if (user.id === message.author.id) {
                if (categoryWindow.selection + 1 < categoryWindow.selections.length) {
                    categoryWindow.selection += 1;
                    embed.fields[0].value = this.makeCategoryDescription(mark, categoryWindow.selection, this.width);
                    this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
                    this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);
                }
            }
        });

        reactionMessage.setReactionListener(2, (user) => {
            if (user.id === message.author.id) {
                if (mark.childreen[categoryWindow.selection].childreen.length > 0) {
                    nav.push(mark.childreen[categoryWindow.selection].nav);
                    mark = this.coinSystem.shopSystem.point(nav.join("."), ShopSystem.point_cancel);
                    if (!mark) {
                        mark = this.coinSystem.shopSystem.shopRegister;
                    }
                    categoryWindow.selections = this.updateKeys(mark);
                    categoryWindow.selection = 0;
                    embed.fields[0].value = this.makeCategoryDescription(mark, categoryWindow.selection, this.width);
                    this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
                    this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);
                } else if (
                    this.coinSystem.shopSystem.isItemStructure(mark.childreen[categoryWindow.selection].structure)
                ) {
                    if (mark.childreen[categoryWindow.selection].items.length > 0) {
                        reactionMessage.onReactionsRemoved = () => {
                            reactionMessage.remove();
                            embed.fields = [];
                            this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                            this.displayBuyWindow(
                                mark.childreen[categoryWindow.selection],
                                message,
                                interactiveMessage,
                                embed
                            );
                        };

                        reactionMessage.removeReactions();
                    }
                } // else Error, do nothing until next interaction
            }
        });

        reactionMessage.setReactionListener(3, (user) => {
            if (user.id === message.author.id) {
                if (nav.length > 0) {
                    nav.pop();
                    mark = this.coinSystem.shopSystem.point(nav.join("."), ShopSystem.point_cancel);
                    if (!mark) {
                        mark = this.coinSystem.shopSystem.shopRegister;
                    }
                    categoryWindow.selections = this.updateKeys(mark);
                    categoryWindow.selection = 0;
                    embed.fields[0].value = this.makeCategoryDescription(mark, categoryWindow.selection, this.width);
                    this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
                    this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);
                } else {
                    reactionMessage.onReactionsRemoved = () => {
                        embed.fields = [];
                        this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                        this.displayHomeWindow(message, interactiveMessage, embed);
                    };

                    reactionMessage.removeReactions();
                    reactionMessage.remove();
                }
            }
        });
    }

    private makeCategoryText(window: TextSelectionWindow) {
        window.update();
        return "Wähle eine Kategorie aus\n```md\n" + window.render() + "```";
    }

    private makeCategoryDescription(mark: ShopRegister, selection: number, width: number) {
        const description = mark.childreen[selection].description;

        if (description) {
            return this.wrapText(description, width);
        } else {
            return this.wrapText(this.categoryDescriptionEmpty, width);
        }
    }

    private makeCategoryDetail(mark: ShopRegister, embed: MessageEmbed, selection: number, width: number) {
        const realMark = mark.childreen[selection];

        if (realMark) {
            embed.fields = [embed.fields[0]];

            if (this.coinSystem.shopSystem.isItemStructure(realMark.structure)) {
                let details = "**Items im Lager:** " + realMark.items.length;

                if (realMark.items.length > 0) {
                    details += "\n**Bester Preis:** " + ShopSystem.findCheapest(realMark)[0].price;
                }

                embed.addField("Kaufdetails", details);
            }
        }
    }

    private updateKeys(mark: ShopRegister) {
        return mark.childreen.map((child) => (child.name ? child.name : child.nav));
    }

    private displayNotImplementedYetWindow(message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const reactionMessage = this.bot.reactionManager.createMessage(interactiveMessage, "☑️");

        reactionMessage.onReactionsAdded = () => {
            this.drawMessage("Dieses Feature wird noch nicht unterstützt :(", interactiveMessage, embed);
        };

        reactionMessage.setReactionListener(0, (user) => {
            if (user.id === message.author.id) {
                reactionMessage.onReactionsRemoved = () => {
                    reactionMessage.remove();
                    this.drawMessage(this.loadingMessage, interactiveMessage, embed);
                    this.displayHomeWindow(message, interactiveMessage, embed);
                };

                reactionMessage.removeReactions();
            }
        });
    }

    private drawMessage(text: string, interactiveMessage: Message, embed: MessageEmbed) {
        embed.setDescription(text);
        interactiveMessage.edit(embed);
    }

    private wrapText(text: string, wrapAt: number) {
        let pos = 0;
        const splits = text
            .split(" ")
            .map((word) => {
                if (pos + word.length > wrapAt) {
                    pos = 0;
                    return "\n" + word;
                } else {
                    pos += word.length;
                    return " " + word;
                }
            })
            .join("")
            .substr(1);

        return splits;
    }
}
