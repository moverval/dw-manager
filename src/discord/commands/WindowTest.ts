import Bot from "../Bot";
import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";
import TextWindowManager from "../../window/windowSystem/TextWindowManager";
import TextSelectionWindow from "../../window/windowSystem/TextSelectionWindow";
import Timeout from "../../window/windowSystem/addin/Timeout";
import CloseWindow from "../../window/windows/CloseWindow";
import WindowClose from "../../window/windowSystem/addin/WindowClose";
import CoinSystem from "../../coinsystem/CoinSystem";
import {makeHomeWindow} from "./shop/HomeWindow";
import TimeoutNotify from "../../window/windowSystem/addin/TimeoutNotify";

export default class WindowTest extends Command {
    coinSystem: CoinSystem;

    constructor(bot: Bot, coinSystem: CoinSystem, invoke: string) {
        super(bot, invoke, true);
        this.coinSystem = coinSystem;
    }

    run(user_message: Message, _args: string[]): ReturnValue {
        user_message.channel.send("Laden...").then((message) => {
            const homeWindow = makeHomeWindow(this.coinSystem, 30);
            const windowManager = new TextWindowManager(this.bot, message, homeWindow, user_message.author.id);
            windowManager.addin(new Timeout(windowManager, 30));
            windowManager.addin(new TimeoutNotify(
                windowManager,
                "Das Fenster wird sich in 10 Sekunden\nschließen um Ressourcen zu sparen.\n" +
                "Interagiere um den Timeout zu verhindern.",
                20
            ));
            windowManager.addin(new WindowClose(windowManager, new CloseWindow()));

            windowManager.activate();
        });

        return ReturnValue.SUCCESS;
    }
}
