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
    readonly visible: boolean;
    readonly invoke: string;

    constructor(bot: Bot, invoke: string, visible?: boolean) {
        this.bot = bot;
        this.invoke = invoke;
        if (typeof visible !== "undefined") {
            this.visible = visible;
        } else {
            this.visible = true;
        }
    }

    abstract run(message: Message, args: string[]): ReturnValue;
}

export enum ReturnValue {
    SUCCESS,
    FAILED_EXECUTING,
    WRONG_BOOTUP,
    UNKNOWN_PARAMETER,
    WRONG_NOTATION,
    INVALID_COMMAND
}
