import EventHandler from "./EventHandler";
import { CommandMap } from "../Types";
import { Message } from "discord.js";
import Command from "../abstract/Command";
import { DocumentationLinker } from "../loaders/JsonLinker";

export default class CommandHandler {
    eventHandler: EventHandler;
    commands: CommandMap = {};
    private prefix: string;

    constructor(eventHandler: EventHandler, prefix: string) {
        this.prefix = prefix;
        this.eventHandler = eventHandler;
        this.eventHandler.addEventListener(
            "message",
            CommandHandler.makeMessageListener(prefix, this.commands)
        );
    }

    isCommand(invoke: string) {
        return this.commands[invoke];
    }

    registerCommand(invoke: string, command: Command): boolean {
        if (!this.isCommand(invoke)) {
            this.commands[invoke] = command;
            return true;
        } else {
            return false;
        }
    }

    getPrefix() {
        return this.prefix;
    }

    private static makeMessageListener(prefix: string, commands: CommandMap) {
        return (message: Message) => {
            if (
                message.content.startsWith(prefix) &&
                !message.member.user.bot
            ) {
                const args = message.content.split(" ");
                const invoke = args.shift().slice(prefix.length);
                if (commands[invoke]) {
                    commands[invoke].run(message, args);
                }
            }
        };
    }

    assignDocumentations(linker: DocumentationLinker) {
        for (const cmdDocumentationName in linker.value) {
            if (
                linker.value[cmdDocumentationName] &&
                this.isCommand(cmdDocumentationName)
            ) {
                this.commands[cmdDocumentationName].documentation =
                    linker.value[cmdDocumentationName];
            }
        }
    }
}
