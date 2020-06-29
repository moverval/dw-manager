import Command, { ReturnValue } from "../abstract/Command";
import DocumentationObject from "../abstract/DocumentationObject";
import Bot from "../Bot";
import { BotAction } from "../Types";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
    run(action: BotAction, message: Message, args: string[]): ReturnValue {
        if(args.length === 1) {
            const path = args[0].split(".");
            if(this.bot.commandHandler.isCommand(path[0])) {
                const command = this.bot.commandHandler.commands[path.shift()];
                const documentationObject = this.getDocumentationObject(path, command.documentation);

                if(documentationObject) {
                    const embed = new MessageEmbed();
                    embed.setTitle(documentationObject.title)
                            .addField("Beschreibung", documentationObject.description);

                    if(documentationObject.childreen.length > 0) {
                        embed.addField("Unterbegriffe", documentationObject.childreen.map(child => child.nav).join("\n"));
                    }

                    message.channel.send(embed);
                } else {
                    message.channel.send("Keine Dokumentation gefunden :(");
                }
            } else {
                message.channel.send("Keinen Befehl mit diesem Namen gefunden :(");
            }
        } else {
            message.channel.send(this.bot.commandHandler.getPrefix() + "help <CommandName>");
        }

        return ReturnValue.SUCCESS;
    }

    getDocumentationObject(path: string[], documentation: DocumentationObject): DocumentationObject {
        if(path.length === 0) {
            return documentation;
        }
        const navTo = path.shift();
        const found = documentation.childreen.find(docObj => docObj.nav === navTo);
        if(found) {
            return this.getDocumentationObject(path, found);
        } else {
            return null;
        }
    }
}
