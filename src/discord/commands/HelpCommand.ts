import Command, { ReturnValue } from "../abstract/Command";
import DocumentationObject from "../abstract/DocumentationObject";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
    run(message: Message, args: string[]): ReturnValue {
        if (args.length === 0) {
            const embed = new MessageEmbed();
            embed
                .setTitle("Übersicht")
                .setDescription(
                    "Dies ist die Übersicht aller Befehle. Nutze \n``" +
                        this.bot.commandHandler.prefix +
                        this.invoke +
                        " " +
                        "<befehl>``\n Um Hilfe zu einem Befehl anzuzeigen."
                );
            for (const commandName in this.bot.commandHandler.commands) {
                if (this.bot.commandHandler.commands[commandName]) {
                    const command = this.bot.commandHandler.commands[commandName];

                    embed.addField(
                        command.invoke,
                        "```" + this.bot.commandHandler.prefix + this.invoke + " " + command.invoke + "```"
                    );
                }
            }

            message.channel.send(embed);
        } else if (args.length === 1) {
            const path = args[0].split(".");

            if (this.bot.commandHandler.isCommand(path[0])) {
                const command = this.bot.commandHandler.commands[path.shift()];
                const documentationObject = this.getDocumentationObject(path, command.documentation);

                if (documentationObject) {
                    const embed = new MessageEmbed();
                    embed
                        .setTitle(documentationObject.title)
                        .addField(
                            "Beschreibung",
                            this.bot.util.convertStringVariables(
                                documentationObject.description,
                                this.bot.util.getGlobalVariables()
                            )
                        );

                    if (documentationObject.childreen.length > 0) {
                        embed.addField(
                            "Unterbegriffe",
                            documentationObject.childreen.map((child) => child.nav).join("\n")
                        );
                    }

                    message.channel.send(embed);
                } else {
                    message.channel.send("Keine Dokumentation gefunden :(");
                }
            } else {
                message.channel.send("Keinen Befehl mit diesem Namen gefunden :(");
            }
        } else if (args.length === 2) {
            if (args[1] === "tree") {
                const path = args[0].split(".");
                const command = this.bot.commandHandler.commands[path.shift()];

                if (command) {
                    const docObj = this.getDocumentationObject(path, command.documentation);
                    const embed = new MessageEmbed();
                    embed
                        .setTitle("Eingänge")
                        .setDescription("```" + this.getDocumentationObjectStringified(docObj) + "```");

                    message.channel.send(embed);
                }
            }
        } else {
            message.channel.send(
                this.bot.commandHandler.getPrefix() +
                    "help <CommandName>. Nutze ``" +
                    this.bot.commandHandler.prefix +
                    "help help`` um mehr Informationen zu dem Befehl zu bekommen"
            );
        }

        return ReturnValue.SUCCESS;
    }

    getDocumentationObject(path: string[], documentation: DocumentationObject): DocumentationObject {
        if (path.length === 0) {
            return documentation;
        }

        const navTo = path.shift();
        const found = documentation.childreen.find((docObj) => docObj.nav === navTo);

        if (found) {
            return this.getDocumentationObject(path, found);
        } else {
            return null;
        }
    }

    getDocumentationObjectStringified(documentation: DocumentationObject, indents: number = 0): string {
        let value =
            " ".repeat(indents) +
            documentation.title +
            " -> " +
            (documentation.nav !== null ? documentation.nav : "") +
            "\n";
        documentation.childreen.forEach((doc) => (value += this.getDocumentationObjectStringified(doc, indents + 2)));

        return value;
    }
}
