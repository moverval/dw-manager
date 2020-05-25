import dotenv from "dotenv";
import CoinSystem from "./coinsystem/CoinSystem";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/Ping";
import { UserConfig, CoinAmountState, LevelState, UserConfigInitializer } from "./coinsystem/CoinConfig";
import Serializer from "./filesystem/Serializer";
import CoinUser from "./coinsystem/CoinUser";
import { UserSave } from "./coinsystem/components/UserSave";
import SerializeObject from "./filesystem/SerializeObject";
import ReadyEvent from "./discord/events/ReadyEvent";

dotenv.config();

const bot = new Bot({
    token: process.env.BOT_TOKEN,
    prefix: process.env.BOT_PREFIX
});

(async () => {
    await bot.login();
    bot.commandHandler.registerCommand("ping", PingCommand);
    bot.eventHandler.addEventListener("ready", ReadyEvent);
    bot.eventHandler.addEventListener("message", (message) => {
        if(message.member.user.id !== bot.client.user.id) {
            message.channel.send("Test");
        }
    });
})();

const so = new SerializeObject({ test: true });
Serializer.writeObject("test.json", so);
