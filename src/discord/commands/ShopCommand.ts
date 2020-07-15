import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";

export default class ShopCommand extends Command {
    run(message: Message, args: string[]): ReturnValue {
        return ReturnValue.SUCCESS;
    }
}
