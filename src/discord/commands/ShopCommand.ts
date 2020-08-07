import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed, ReactionEmoji, GuildEmoji, User } from "discord.js";
import TextSelectionWindow from "../components/TextSelectionWindow";
import ShopSystem, { ShopRegister, BuyStatus, ShopItem } from "../../coinsystem/shop/ShopSystem";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";
import TextWindow from "../components/TextWindow";
import Account from "../../coinsystem/Account";
import { StringMap } from "../../Types";
import ReactionMessage, { ReactionType } from "../components/ReactionMessage";
import { InventoryItem } from "../../coinsystem/shop/Inventory";

export default class ShopCommand extends Command {
    loadingMessage: string = "Laden...";
    categoryDescriptionEmpty: string = "Keine Beschreibung verfügbar :(";

    coinSystem: CoinSystem;

    reactionMessages: StringMap<ReactionMessage>;
    timeoutIds: StringMap<NodeJS.Timeout>;
    timeoutDuration: number = 120000;

    width: number = 34;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke);
        this.reactionMessages = {};
        this.timeoutIds = {};
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        const embed = new MessageEmbed();
        embed.setTitle("Shop").setDescription(this.loadingMessage).setFooter("");

        message.channel.send(embed).then((interactiveMessage) => {
            const reactionMessage = this.bot.reactionManager.createMessage(interactiveMessage, "⬆️", "⬇️", "☑️", "🔴");
            reactionMessage.onReactionsAdded = () => {
                this.reactionMessages[interactiveMessage.id] = reactionMessage;
                this.makeTimeout(reactionMessage);
                const originalCall = reactionMessage.call;

                reactionMessage.call = (
                    reaction: ReactionEmoji | GuildEmoji,
                    user: User,
                    reactionType: ReactionType
                ) => {
                    originalCall.apply(reactionMessage, [reaction, user, reactionType]);
                    this.renewTimeout(reactionMessage);
                };

                this.displayHomeWindow(message, interactiveMessage, embed);
            };
        });

        return ReturnValue.SUCCESS;
    }

    private makeTimeout(reactionMessage: ReactionMessage) {
        this.timeoutIds[reactionMessage.message.id] = setTimeout(() => {
            this.closeShopMessage(reactionMessage);
        }, this.timeoutDuration);
    }

    private renewTimeout(reactionMessage: ReactionMessage) {
        if (this.timeoutIds[reactionMessage.message.id]) {
            clearTimeout(this.timeoutIds[reactionMessage.message.id]);
            this.timeoutIds[reactionMessage.message.id] = setTimeout(() => {
                this.closeShopMessage(reactionMessage);
            }, this.timeoutDuration);
        }
    }

    private getReactionMessage(interactiveMessage: Message) {
        return this.reactionMessages[interactiveMessage.id];
    }

    private closeShopMessage(reactionMessage: ReactionMessage) {
        reactionMessage.removeReactions();
        reactionMessage.remove();
        this.drawMessage("Geschlossen.", reactionMessage.message, new MessageEmbed().setTitle("Shop"));
    }

    private displayHomeWindow(message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const homeWindow = new TextSelectionWindow(this.width, 3, ["Kaufen", "Inventar", "Schließen"]);
        const reactionMessage = this.getReactionMessage(interactiveMessage);

        embed.setFooter("Du kannst mit den unten angeführten Reaktionen die\nSteuerfläche navigieren.");
        this.drawMessage(this.makeHomeText(homeWindow), interactiveMessage, embed);

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

            switch (homeWindow.selection) {
                case 0: // Shop
                    reactionMessage.clearListeners();
                    this.displayShopCategoryWindow([], message, interactiveMessage, embed);
                    break;

                case 1:
                    reactionMessage.clearListeners();
                    this.displayInventoryWindow(message, interactiveMessage, embed);
                    break;

                case 2:
                    this.closeShopMessage(reactionMessage);
                    return;

                default:
                    reactionMessage.clearListeners();
                    this.displayNotImplementedYetWindow(message, interactiveMessage, embed);
                    break;
            }
        });

        reactionMessage.setReactionListener(3, (user) => {
            this.closeShopMessage(reactionMessage);
        });
    }

    private makeHomeText(window: TextSelectionWindow) {
        window.update();
        return "Wähle die gewünschte Aktion aus\n```md\n" + window.render() + "```";
    }

    private displayBuyWindow(mark: ShopRegister, message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const buyWindow = new TextSelectionWindow(this.width, 2, ["Nein", "Ja"]);
        const reactionMessage = this.getReactionMessage(interactiveMessage);
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
                if (mode === 0) {
                    switch (buyWindow.selection) {
                        case 0:
                            embed.fields = [];
                            reactionMessage.clearListeners();
                            this.displayHomeWindow(message, interactiveMessage, embed);
                            return;

                        case 1:
                            mode = 1;
                            const response = this.coinSystem.shopSystem.buyItem(mark, account, item.id);
                            if (response === BuyStatus.SUCCESS) {
                                buySuccess = true;
                            }
                            embed.fields = [];
                            this.drawMessage(this.makeBuyCompleteText(response), interactiveMessage, embed);
                            break;
                    }
                } else if (mode === 1) {
                    if (buySuccess) {
                        reactionMessage.clearListeners();
                        this.displayHomeWindow(message, interactiveMessage, embed);
                    } else {
                        mode = 0;
                        item = ShopSystem.findCheapest(mark)[0];

                        if (!item) {
                            reactionMessage.clearListeners();
                            this.displayHomeWindow(message, interactiveMessage, embed);
                            return;
                        }

                        this.makeBuyDetails(embed, item);
                        this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
                    }
                }
            }
        });

        reactionMessage.setReactionListener(3, (user) => {
            reactionMessage.clearListeners();
            this.displayHomeWindow(message, interactiveMessage, embed);
        });

        if (item) {
            this.makeBuyDetails(embed, item);
            this.drawMessage(this.makeBuyText(buyWindow), interactiveMessage, embed);
        }
    }

    private makeBuyText(window: TextWindow) {
        window.update();
        return "Möchtest du den Gegenstand wirklich kaufen?\n```md\n" + window.render() + "```";
    }

    private makeBuyDetails(embed: MessageEmbed, item: ShopItem) {
        embed.fields = [];
        const guild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);
        let username = null;
        if (item.contributorId === "*") {
            username = "SYSTEM";
        } else {
            if (guild) {
                const user = guild.members.cache.get(item.contributorId);
                if (user) {
                    username = user.user.username;
                }
            }
        }
        embed.addField(
            "Verkaufsdetails",
            `**Preis:** ${item.price === 0 ? "Gratis" : item.price}\n**Verkäufer:** ${
                username ? username : "Unbekannt"
            }\n**Item ID:** ${item.id.slice(0, 20)}`
        );
    }

    private makeBuyCompleteText(response: BuyStatus) {
        let text;

        switch (response) {
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
        const reactionMessage = this.getReactionMessage(interactiveMessage);

        embed.fields = [];
        embed.addField("Beschreibung", this.makeCategoryDescription(mark, categoryWindow.selection, this.width));
        this.makeCategoryDetail(mark, embed, categoryWindow.selection, this.width);
        this.drawMessage(this.makeCategoryText(categoryWindow), interactiveMessage, embed);

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
                        embed.fields = [];
                        reactionMessage.clearListeners();
                        this.displayBuyWindow(
                            mark.childreen[categoryWindow.selection],
                            message,
                            interactiveMessage,
                            embed
                        );
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
                    embed.fields = [];
                    this.displayHomeWindow(message, interactiveMessage, embed);
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
                    const price = ShopSystem.findCheapest(realMark)[0].price;
                    details += "\n**Bester Preis:** " + (price === 0 ? "Gratis" : price);
                }

                embed.addField("Kaufdetails", details);
            }
        }
    }

    private updateKeys(mark: ShopRegister) {
        return mark.childreen.map((child) => (child.name ? child.name : child.nav));
    }

    private displayNotImplementedYetWindow(message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const reactionMessage = this.getReactionMessage(interactiveMessage);

        this.drawMessage("Dieses Feature wird noch nicht unterstützt :(", interactiveMessage, embed);

        reactionMessage.setReactionListener(2, (user) => {
            if (user.id === message.author.id) {
                reactionMessage.clearListeners();
                this.displayHomeWindow(message, interactiveMessage, embed);
            }
        });
    }

    private displayInventoryWindow(message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const reactionMessage = this.getReactionMessage(interactiveMessage);
        const account = this.coinSystem.getAccount(message.author.id);
        const keys = Object.keys(account.inventory.inventoryMap);
        const selections = keys
            .filter((key) => account.inventory.inventoryMap[key] !== undefined)
            .map((itemName) =>
                account.inventory.inventoryMap[itemName].name
                    ? account.inventory.inventoryMap[itemName].name
                    : "Unbekannter Gegenstand"
            );
        const inventoryWindow = new TextSelectionWindow(this.width, 5, selections);

        if (!account.inventory.isEmpty()) {
            this.makeInventoryEmbed(account, embed, keys, inventoryWindow.selection);
            this.drawMessage(this.makeInventoryText(inventoryWindow), interactiveMessage, embed);

            reactionMessage.setReactionListener(0, (user) => {
                if (user.id === message.author.id) {
                    if (inventoryWindow.selection > 0) {
                        inventoryWindow.selection -= 1;
                        this.makeInventoryEmbed(account, embed, keys, inventoryWindow.selection);
                        this.drawMessage(this.makeInventoryText(inventoryWindow), interactiveMessage, embed);
                    }
                }
            });

            reactionMessage.setReactionListener(1, (user) => {
                if (user.id === message.author.id) {
                    if (inventoryWindow.selection + 1 < inventoryWindow.selections.length) {
                        inventoryWindow.selection += 1;
                        this.makeInventoryEmbed(account, embed, keys, inventoryWindow.selection);
                        this.drawMessage(this.makeInventoryText(inventoryWindow), interactiveMessage, embed);
                    }
                }
            });

            reactionMessage.setReactionListener(2, (user) => {
                if (user.id === message.author.id) {
                    if (typeof account.inventory.inventoryMap[keys[inventoryWindow.selection]] !== "undefined") {
                        reactionMessage.clearListeners();
                        embed.fields = [];

                        this.displayInventoryOptionWindow(
                            account.inventory.inventoryMap[keys[inventoryWindow.selection]],
                            message,
                            interactiveMessage,
                            embed
                        );
                    }
                }
            });
        } else {
            this.drawMessage(
                "Kaufe Gegenstände ein um sie hier auszurüsten und wieder zu verkaufen.",
                interactiveMessage,
                embed
            );
        }

        reactionMessage.setReactionListener(3, (user) => {
            if (user.id === message.author.id) {
                embed.fields = [];
                reactionMessage.clearListeners();
                this.displayHomeWindow(message, interactiveMessage, embed);
            }
        });
    }

    private makeInventoryText(window: TextWindow) {
        window.update();
        return "Dein Inventar\n```md\n" + window.render() + "```";
    }

    private makeInventoryEmbed(account: Account, embed: MessageEmbed, keys: string[], selection: number) {
        embed.fields = [];
        const item = account.inventory.inventoryMap[keys[selection]];
        if (item) {
            let extra = "";

            const itemMask = this.coinSystem.shopSystem.getStructure(item.structure);
            if (itemMask) {
                const equipable = itemMask.isEquipable(account, item.config);
                extra += "Ausrüstbar: " + (equipable ? "Ja" : "Nein") + "\n";

                if (equipable) {
                    extra += "Ausgerüstet: " + (itemMask.isEquipped(account, item.config) ? "Ja" : "Nein") + "\n";
                }
            }

            embed.addField(
                "Details",
                `ID: ${keys[selection]}\nZum Verkauf angeboten: ${item.status.tradeOffer ? "Ja" : "Nein"}\n` + extra
            );
        } else {
            embed.addField("Fehler", "Dieses Item ist nicht mehr verfügbar.");
        }
    }

    private displayInventoryOptionWindow(
        item: InventoryItem,
        message: Message,
        interactiveMessage: Message,
        embed: MessageEmbed
    ) {
        const reactionMessage = this.getReactionMessage(interactiveMessage);
        const itemStructure = this.coinSystem.shopSystem.getStructure(item.structure);
        const account = this.coinSystem.getAccount(message.author.id);

        if (itemStructure) {
            const isEquipable = itemStructure.isEquipable(account, item.config);
            const isEquipped = itemStructure.isEquipped(account, item.config);
            const optionList = [];

            if (isEquipable) {
                if (isEquipped) {
                    optionList.push("Ausrüstung entfernen");
                } else {
                    optionList.push("Ausrüsten");
                }
            }

            if (item.status.tradeOffer) {
                optionList.push("Verkauf zurückziehen");
            } else {
                optionList.push("Verkaufen");
            }

            optionList.push("Schließen");

            reactionMessage.setReactionListener(0, (user) => {
                if (user.id === message.author.id) {
                    if (inventoryWindow.selection > 0) {
                        inventoryWindow.selection -= 1;
                        this.drawMessage(this.makeInventoryOptionText(inventoryWindow), interactiveMessage, embed);
                    }
                }
            });

            reactionMessage.setReactionListener(1, (user) => {
                if (user.id === message.author.id) {
                    if (inventoryWindow.selection + 1 < inventoryWindow.selections.length) {
                        inventoryWindow.selection += 1;
                        this.drawMessage(this.makeInventoryOptionText(inventoryWindow), interactiveMessage, embed);
                    }
                }
            });

            reactionMessage.setReactionListener(2, (user) => {
                if (!account.inventory.hasItem(item.id)) {
                    embed.addField("Info", "Du besitzt dieses Item nicht mehr.");
                    this.drawMessage(this.makeInventoryOptionText(inventoryWindow), interactiveMessage, embed);
                    embed.fields = [];
                    return;
                }

                const closeAction = () => {
                    reactionMessage.clearListeners();
                    this.displayInventoryWindow(message, interactiveMessage, embed);
                };

                const equipAction = () => {
                    if (isEquipped) {
                        itemStructure.unequip(account, item.config);
                    } else {
                        if (account.inventory.hasItem(item.id)) {
                            itemStructure.equip(account, item.config);
                        }
                    }
                    reactionMessage.clearListeners();
                    this.displayInventoryWindow(message, interactiveMessage, embed);
                };

                const sellAction = () => {
                    reactionMessage.clearListeners();
                    this.displaySellWindow(item, message, interactiveMessage, embed);
                };

                const retrieveAction = () => {
                    account.inventory.removeOffer(item);
                    reactionMessage.clearListeners();
                    this.displayInventoryWindow(message, interactiveMessage, embed);
                };

                if (isEquipable) {
                    switch (inventoryWindow.selection) {
                        case 0:
                            if (!item.status.tradeOffer) {
                                equipAction();
                            } else {
                                embed.addField(
                                    "Fehler",
                                    "Du darfst den Gegenstand nicht anbieten\nund ihn gleichzeitig ausrüsten."
                                );
                                this.drawMessage(
                                    this.makeInventoryOptionText(inventoryWindow),
                                    interactiveMessage,
                                    embed
                                );
                                embed.fields = [];
                            }
                            break;
                        case 1:
                            if (!itemStructure.isEquipped(account, item.config)) {
                                if (!item.status.tradeOffer) {
                                    sellAction();
                                } else {
                                    retrieveAction();
                                }
                            } else {
                                embed.addField(
                                    "Fehler",
                                    "Du musst den Gegenstand erst abnehmen\n um ihn zu verkaufen."
                                );
                                this.drawMessage(
                                    this.makeInventoryOptionText(inventoryWindow),
                                    interactiveMessage,
                                    embed
                                );
                                embed.fields = [];
                            }
                            break;
                        case 2:
                            closeAction();
                            break;
                    }
                } else {
                    switch (inventoryWindow.selection) {
                        case 0:
                            if (!itemStructure.isEquipped(account, item.config)) {
                                if (!item.status.tradeOffer) {
                                    sellAction();
                                } else {
                                    retrieveAction();
                                }
                            } else {
                                embed.addField("Fehler", "Du musst den Gegenstand erst abnehmen\num ihn zu verkaufen.");
                                this.drawMessage(
                                    this.makeInventoryOptionText(inventoryWindow),
                                    interactiveMessage,
                                    embed
                                );
                                embed.fields = [];
                            }
                            break;
                        case 1:
                            closeAction();
                            break;
                    }
                }
            });

            reactionMessage.setReactionListener(3, (user) => {
                if (user.id === message.author.id) {
                    reactionMessage.clearListeners();
                    this.displayInventoryWindow(message, interactiveMessage, embed);
                }
            });

            const inventoryWindow = new TextSelectionWindow(this.width, 3, optionList);

            this.drawMessage(this.makeInventoryOptionText(inventoryWindow), interactiveMessage, embed);
        }
    }

    private makeInventoryOptionText(window: TextWindow) {
        window.update();
        return "```md\n" + window.render() + "```";
    }

    private displaySellWindow(item: InventoryItem, message: Message, interactiveMessage: Message, embed: MessageEmbed) {
        const reactionMessage = this.getReactionMessage(interactiveMessage);
        const inputDescription = "Schreibe in den Chat die Summe, für die du das Item verkaufen möchtest";
        const verifySell =
            "Ist dies so in Ordnung?\nMit dem Klick auf den Haken wird dieses Item zum Verkauf angeboten.";
        const inputRemoved = "Eingabe wurde abgelehnt. Rufe dieses Fenster erneut auf um dieses Item zu verkaufen";

        const account = this.coinSystem.getAccount(message.author.id);

        const inputHandler = (input: Message) => {
            const inputNumber = Number(input.content);

            if (!isNaN(inputNumber)) {
                if (inputNumber >= 0 && inputNumber <= 1000000000) {
                    this.makeSellInputEmbed(embed, "" + (inputNumber === 0 ? "Gratis" : inputNumber));
                    this.drawMessage(verifySell, interactiveMessage, embed);

                    reactionMessage.setReactionListener(2, (user) => {
                        if (user.id === message.author.id) {
                            if (account.inventory.hasItem(item.id)) {
                                if (!item.status.tradeOffer) {
                                    account.inventory.makeOffer(item, inputNumber);
                                    reactionMessage.clearListeners();
                                    this.displayInventoryWindow(message, interactiveMessage, embed);
                                }
                            } else {
                                embed.addField("Info", "Bitte kehre zu deinem Inventar zurück.");
                                this.drawMessage("Du besitzt dieses Item nicht mehr.", interactiveMessage, embed);
                                embed.fields = [];
                            }
                        }
                    });
                } else {
                    this.makeSellInputEmbed(embed);
                    this.drawMessage("Diese Nummer ist ungültig. Probiere es erneut.", interactiveMessage, embed);
                    this.bot.userInputManager.getUserInput(
                        message.author.id,
                        message.channel.id,
                        inputHandler,
                        this.timeoutDuration,
                        timeoutHandler
                    );
                }
            } else {
                this.makeSellInputEmbed(embed);
                this.drawMessage(
                    "Die Eingabe darf nur eine Nummer enthalten. Probiere es erneut.",
                    interactiveMessage,
                    embed
                );
                this.bot.userInputManager.getUserInput(
                    message.author.id,
                    message.channel.id,
                    inputHandler,
                    this.timeoutDuration,
                    timeoutHandler
                );
            }
        };

        const timeoutHandler = () => () => {
            embed.fields = [];
            this.drawMessage(inputRemoved, interactiveMessage, embed);
        };

        this.bot.userInputManager.getUserInput(
            message.author.id,
            message.channel.id,
            inputHandler,
            this.timeoutDuration,
            timeoutHandler
        );

        this.makeSellInputEmbed(embed);
        this.drawMessage(inputDescription, interactiveMessage, embed);

        reactionMessage.setReactionListener(3, (user) => {
            if (user.id === message.author.id) {
                this.bot.userInputManager.clearUserInput(message.author.id, message.channel.id);
                reactionMessage.clearListeners();
                this.displayInventoryWindow(message, interactiveMessage, embed);
            }
        });
    }

    private makeSellInputEmbed(embed: MessageEmbed, input: string = "        ") {
        embed.fields = [];
        embed.addField("Summe", "`‎ " + input + " ‎`");
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
