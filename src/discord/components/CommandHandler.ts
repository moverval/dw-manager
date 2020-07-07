import EventHandler from "./EventHandler";
import { CommandMap } from "../Types";
import { Message, MessageEmbed } from "discord.js";
import Command, { ReturnValue } from "../abstract/Command";
import { DocumentationLinker } from "../loaders/JsonLinker";

export default class CommandHandler {
    private static makeMessageListener(prefix: string, commands: CommandMap) {
        return (message: Message) => {
            if (message.content.startsWith(prefix) && !message.member.user.bot) {
                const args = message.content.split(" ");
                const invoke = args.shift().slice(prefix.length);
                if (commands[invoke]) {
                    const value = commands[invoke].run(message, args);

                    switch (value) {
                        case ReturnValue.WRONG_NOTATION: {
                            const embed = new MessageEmbed();
                            embed
                                .setTitle("Falsche Schreibweise")
                                .setDescription(
                                    `Nutze \`\`${prefix}help ${commands[invoke].invoke}\`\` um Hilfe für den Befehl zu erhalten`
                                );
                            message.channel.send(embed);
                        }
                    }
                }
            }
        };
    }

    eventHandler: EventHandler;
    commands: CommandMap = {};
    readonly prefix: string;

    constructor(eventHandler: EventHandler, prefix: string) {
        this.prefix = prefix;
        this.eventHandler = eventHandler;
        this.eventHandler.addEventListener("message", CommandHandler.makeMessageListener(prefix, this.commands));
    }

    isCommand(invoke: string) {
        return this.commands[invoke];
    }

    registerCommand(command: Command): boolean {
        if (!this.isCommand(command.invoke)) {
            this.commands[command.invoke] = command;
            return true;
        } else {
            return false;
        }
    }

    getPrefix() {
        return this.prefix;
    }

    assignDocumentations(linker: DocumentationLinker) {
        for (const cmdDocumentationName in linker.value) {
            if (linker.value[cmdDocumentationName] && this.isCommand(cmdDocumentationName)) {
                this.commands[cmdDocumentationName].documentation = linker.value[cmdDocumentationName];
            }
        }
    }
}
