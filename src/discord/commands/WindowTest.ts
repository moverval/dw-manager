import Bot from "../Bot";
import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";
import TextWindowManager from "../../window/windowSystem/TextWindowManager";
import TextSelectionWindow from "../../window/windowSystem/TextSelectionWindow";

export default class WindowTest extends Command {
    constructor(bot: Bot, invoke: string) {
        super(bot, invoke, true);
    }

    run(user_message: Message, _args: string[]): ReturnValue {
        user_message.channel.send("Loading...").then((message) => {
            const list = "123456789123456789".split("").map((val) => "Test-" + val);
            const selectionWindow = new TextSelectionWindow(message, 25, 7, list);
            const windowManager = new TextWindowManager(this.bot, selectionWindow, user_message.author.id);

            windowManager.activate();
        });

        return ReturnValue.SUCCESS;
    }
}
