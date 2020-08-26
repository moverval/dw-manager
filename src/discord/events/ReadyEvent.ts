import EventModule, { ClientEvent } from "../abstract/EventModule";
import Bot from "../Bot";

export default class ReadyEvent extends EventModule {
    constructor(bot: Bot) {
        super("StartMessage", bot);
    }

    @ClientEvent("ready")
    OutputConsoleReadyMessage() {
        console.log("Bot started");
    }
}
