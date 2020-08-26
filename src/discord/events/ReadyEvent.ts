import ClientEvent from "../abstract/ClientEvent";
import Bot from "../Bot";

function Ready() {
    console.log("Bot started");
}

export default class ReadyEvent extends ClientEvent<"ready"> {
    constructor(bot: Bot) {
        super("StartMessage", "ready", bot);
    }

    run() {
        console.log("Bot started");
    }
}
