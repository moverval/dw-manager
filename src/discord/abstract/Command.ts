import { BotAction } from "../Types";
import { Message } from "discord.js";
import DocumentationObject, { ParentObject } from "./DocumentationObject";
import Bot from "../Bot";

/**
 * @name Command
 *
 * @description
 * Abstract Command class that is used to store and register User commands.
 */
export default abstract class Command {
    bot: Bot;
    documentation: DocumentationObject;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    abstract run(message: Message, args: string[]): ReturnValue;
}

export enum ReturnValue {
    SUCCESS,
    FAILED_EXECUTING,
    WRONG_BOOTUP,
    UNKNOWN_PARAMETER,
}
