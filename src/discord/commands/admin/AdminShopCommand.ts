import Command, { ReturnValue } from "../../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../../Bot";
import CoinSystem from "../../../coinsystem/CoinSystem";
import ShopSystem, { ShopRegister, StructureConfigStatus } from "../../../coinsystem/shop/ShopSystem";
import Account from "../../../coinsystem/Account";

export default class AdminShopCommand extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem) {
        super(bot, invoke, false);
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        if (message.guild.id === process.env.MAIN_GUILD) {
            if (message.member.permissions.has("ADMINISTRATOR")) {
                if (args.length > 0) {
                    switch (args[0].toLowerCase()) {
                        case "create_category":
                        case "cc":
                            {
                                if (args.length === 2) {
                                    this.createCategory(message, args[1]);
                                } else {
                                    message.channel.send("CC benötigt ein Argument.");
                                }
                            }
                            break;

                        case "set_name":
                        case "sn":
                            {
                                if (args.length >= 3) {
                                    this.setName(message, args[1], args.slice(2).join(" "));
                                } else {
                                    message.channel.send("SN benötigt zwei Argumente.");
                                }
                            }
                            break;

                        case "set_structure":
                        case "ss":
                            {
                                if (args.length === 3) {
                                    this.setStructure(message, args[1], args[2]);
                                } else {
                                    message.channel.send("SS benötigt zwei Argumente.");
                                }
                            }
                            break;

                        case "delete_category":
                        case "dc":
                            {
                                if (args.length === 3) {
                                    this.deleteCategory(message, args[1], args[2]);
                                } else {
                                    message.channel.send(
                                        "DC Befehl benötigt einen Pfad sowie den Nav Namen des zu löschenden Elements."
                                    );
                                }
                            }
                            break;

                        case "ls":
                            {
                                this.listCategories(message);
                            }
                            break;

                        case "info":
                        case "i":
                            {
                                if (args.length === 2) {
                                    this.getInfo(message, args[1]);
                                } else {
                                    message.channel.send("Info Befehl benötigt einen Pfad.");
                                }
                            }
                            break;

                        case "rn":
                        case "rename":
                            {
                                if (args.length === 4) {
                                    this.rename(message, args[1], args[2], args[3]);
                                } else {
                                    message.channel.send("RN Befehl benötigt drei Argumente.");
                                }
                            }
                            break;

                        case "set_structure_config":
                        case "ssc":
                            {
                                if (args.length === 4) {
                                    this.setStructureConfig(message, args[1], args[2], args[3]);
                                } else {
                                    message.channel.send("SSC Befehl benötigt drei Argumente");
                                }
                            }
                            break;

                        case "scls":
                            {
                                if (args.length === 2) {
                                    this.structureConfigList(message, args[1]);
                                } else {
                                    message.channel.send("SCLS benötigt ein Argument");
                                }
                            }
                            break;

                        case "sd":
                        case "set_description":
                            {
                                if (args.length >= 3) {
                                    this.setDescription(message, args[1], args.slice(2).join(" "));
                                }
                            }
                            break;

                        case "ai":
                        case "add_item":
                            {
                                if (args.length === 3) {
                                    const num = Number(args[2]);

                                    if (!isNaN(num)) {
                                        this.addItem(message, args[1], num);
                                    } else {
                                        message.channel.send("Zweites Argument muss eine Nummer sein.");
                                    }
                                } else {
                                    message.channel.send("AI Befehl benötigt zwei Argumente.");
                                }
                            }
                            break;

                        case "ais":
                        case "add_items":
                            {
                                if (args.length === 4) {
                                    const num1 = Number(args[2]);
                                    const num2 = Number(args[3]);

                                    if (!isNaN(num1) && !isNaN(num2)) {
                                        this.addItems(message, args[1], num1, num2);
                                    } else {
                                        message.channel.send("Zweites und drittes Argument muss ein Nummer sein.");
                                    }
                                } else {
                                    message.channel.send("AIS Befehl benötigt drei Argumente.");
                                }
                            }
                            break;

                        case "ri":
                        case "remove_item":
                            {
                                if (args.length === 3) {
                                    this.removeItem(message, args[1], args[2]);
                                } else {
                                    message.channel.send("RI Befehl benötigt zwei Argumente.");
                                }
                            }
                            break;

                        case "imls":
                            {
                                if (args.length === 2) {
                                    this.listItems(message, args[1]);
                                } else {
                                    message.channel.send("IMLS benötigt ein Argument.");
                                }
                            }
                            break;
                    }
                }
            }
        } else {
            return ReturnValue.INVALID_COMMAND;
        }
        return ReturnValue.SUCCESS;
    }

    createCategory(message: Message, categoryName: string) {
        const mark = this.coinSystem.shopSystem.point(categoryName, ShopSystem.point_create);
        if (mark) {
            message.channel.send("Kategorie ist nun verfügbar.");
        } else {
            message.channel.send("Kategorie konnte nicht erstellt werden.");
        }
    }

    setName(message: Message, category: string, name: string) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        if (sr) {
            sr.name = name;
            message.channel.send("Name wurde gesetzt.");
        } else {
            message.channel.send("Kategorie nicht gefunden.");
        }
    }

    setStructure(message: Message, category: string, structure: string) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        if (sr) {
            sr.structure = structure;

            if (this.coinSystem.shopSystem.isItemStructure(structure)) {
                this.coinSystem.shopSystem.makeMarkStructure(sr);
                this.coinSystem.shopSystem.markStructureVerify(sr);
                message.channel.send("Struktur wurde geändert.");
            } else {
                message.channel.send("Dies ist keine Struktur.");
            }
        } else {
            message.channel.send("Kategorie wurde nicht gefunden.");
        }
    }

    deleteCategory(message: Message, category: string, nav: string) {
        let sr;
        if (category === "*") {
            sr = this.coinSystem.shopSystem.shopRegister;
        } else {
            sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        }
        if (sr) {
            const registerIndex = ShopSystem.findNavIndex(sr, nav);
            if (registerIndex !== -1) {
                sr.childreen.splice(registerIndex, 1);
                message.channel.send("Kategorie wurde gelöscht.");
            } else {
                message.channel.send("Unterkategorie nicht gefunden.");
            }
        } else {
            message.channel.send("Kategoriekette existiert nicht.");
        }
    }

    listCategories(message: Message) {
        const embed = new MessageEmbed();
        embed.setTitle("Liste der Kategorien");

        const text = this.listCat(this.coinSystem.shopSystem.shopRegister, "", 0);
        embed.setDescription(text);
        message.channel.send(embed);
    }

    listCat(sr: ShopRegister, message: string, indent: number) {
        message +=
            "=".repeat(indent) +
            `| ${sr.nav === null ? "**ShopSystem**" : sr.nav} ` +
            (sr.name === null ? "" : "-> " + sr.name) +
            `\n`;
        indent += 2;
        sr.childreen.forEach((subSr) => {
            message = this.listCat(subSr, message, indent);
        });

        return message;
    }

    getInfo(message: Message, category: string) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        if (sr) {
            const embed = new MessageEmbed();
            embed
                .setTitle(`Information: ${category}`)
                .addField(
                    "Generell",
                    "**Name:** " +
                        (sr.name === null ? "<!Nicht gesetzt!>" : sr.name) +
                        "\n**Struktur:** " +
                        (sr.structure === null ? "<!Nicht gesetzt!>" : sr.structure) +
                        "\n**Navigation:** " +
                        sr.nav +
                        "\n**Beschreibung:** " +
                        (sr.description ? sr.description : "Nicht festgelegt")
                )
                .addField("Zusätzlich", "**Verkaufsangebote:** " + sr.items.length);

            embed.addField(
                "Struktur Informationen",
                "Struktur muss konfiguriert werden: " + (sr.structureConfigValid ? "nein" : "**ja**")
            );

            if (sr.childreen.length > 0) {
                let subCategoryStr = "";
                sr.childreen.forEach((cat) => (subCategoryStr += cat.nav + "\n"));
                embed.addField("Unterkategorien", subCategoryStr);
            }

            message.channel.send(embed);
        } else {
            message.channel.send("Kategorie nicht gefunden.");
        }
    }

    rename(message: Message, parent: string, nav: string, name: string) {
        const parentElement = this.coinSystem.shopSystem.point(parent, ShopSystem.point_cancel);
        if (parentElement) {
            if (ShopSystem.rename(parentElement, nav, name)) {
                message.channel.send("Umbenennen erfolgreich.");
            } else {
                message.channel.send("Fehler beim Umbenennen (Nav nicht gefunden oder Name schon vergeben).");
            }
        } else {
            message.channel.send("Kategorie nicht gefunden.");
        }
    }

    setStructureConfig(message: Message, category: string, structurePath: string, value: string) {
        const categoryElement = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        const stcoType = ShopSystem.getStructureConfigType(categoryElement, structurePath);

        if (!categoryElement) {
            message.channel.send("Kategorie wurde nicht gefunden.");
            return;
        }

        if (stcoType !== "undefined") {
            if (stcoType === "string") {
                const returnValue = ShopSystem.structureConfigSet(categoryElement, structurePath, value);
                if (returnValue === StructureConfigStatus.SUCCESS) {
                    this.coinSystem.shopSystem.markStructureVerify(categoryElement);
                    message.channel.send("Wert wurde geändert.");
                } else {
                    message.channel.send("Wert konnte nicht geändert werden.");
                }
            } else if (stcoType === "number") {
                const valueNumber = Number(value);
                if (!isNaN(valueNumber)) {
                    const returnValue = ShopSystem.structureConfigSet(categoryElement, structurePath, valueNumber);
                    if (returnValue === StructureConfigStatus.SUCCESS) {
                        this.coinSystem.shopSystem.markStructureVerify(categoryElement);
                        message.channel.send("Wert wurde geändert.");
                    } else {
                        message.channel.send("Wert konnte nicht geändert werden.");
                    }
                } else {
                    message.channel.send("Eingegebener Wert ist keine Nummer.");
                }
            } else {
                message.channel.send("Dieser Typ kann nicht verändert werden.");
            }
        } else {
            message.channel.send("Diese Variable existiert nicht.");
        }
    }

    structureConfigList(message: Message, category: string) {
        const categoryElement = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);

        if (!categoryElement) {
            message.channel.send("Kategorie wurde nicht gefunden.");
            return;
        }

        const embed = new MessageEmbed();
        embed.setTitle("Structure Config");

        let output = "";

        Object.keys(categoryElement.structureConfig).forEach((key) => {
            output +=
                key +
                ": " +
                typeof categoryElement.structureConfig[key] +
                ": " +
                categoryElement.structureConfig[key] +
                "\n";
        });

        if (output === "") {
            output += "Keine Config verfügbar.";
        }

        embed.setDescription(output);
        message.channel.send(embed);
    }

    setDescription(message: Message, category: string, text: string) {
        const mark = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);
        if (!mark) {
            message.channel.send("Kategorie nicht gefunden.");
            return;
        }

        mark.description = text;
        message.channel.send("Beschreibung wurde geändert.");
    }

    addItem(message: Message, category: string, price: number) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);

        if (sr) {
            ShopSystem.addItem(sr, Account.rootAccount(this.coinSystem), price);
            message.channel.send("Item wurde hinzugefügt.");
        } else {
            message.channel.send("Kategorie wurde nicht gefunden.");
        }
    }

    addItems(message: Message, category: string, price: number, amount: number) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);

        if (sr) {
            const rootAccount = Account.rootAccount(this.coinSystem);

            for (let i = 0; i < amount; i++) {
                ShopSystem.addItem(sr, rootAccount, price);
            }
            message.channel.send("Items wurden hinzugefügt.");
        } else {
            message.channel.send("Kategorie wurde nicht gefunden.");
        }
    }

    removeItem(message: Message, category: string, id: string) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);

        if (sr) {
            if (ShopSystem.removeItem(sr, id)) {
                message.channel.send("Item wurde entfernt.");
            } else {
                message.channel.send("Item nicht gefunden.");
            }
        } else {
            message.channel.send("Kategorie nicht gefunden.");
        }
    }

    listItems(message: Message, category: string) {
        const sr = this.coinSystem.shopSystem.point(category, ShopSystem.point_cancel);

        if (sr) {
            let text = "";

            sr.items.forEach((item) => {
                text += `ID: ${item.id}; Price: ${item.price}C; Contributor: ${item.contributorId}\n`;
            });

            const embed = new MessageEmbed();

            if (text === "") {
                text = "Keine Items gefunden.";
            }

            embed.setTitle("Items").setDescription(text);
            message.channel.send(embed);
        } else {
            message.channel.send("Kategorie wurde nicht gefunden.");
        }
    }
}
