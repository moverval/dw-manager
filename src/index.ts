import dotenv from "dotenv";
import CoinSystem from "./coinsystem/CoinSystem";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/PingCommand";
import { UserConfig, CoinAmountState, LevelState, UserConfigInitializer } from "./coinsystem/CoinConfig";
import Serializer from "./filesystem/Serializer";
import CoinUser from "./coinsystem/CoinUser";
import { UserSave } from "./coinsystem/components/UserSave";
import SerializeObject from "./filesystem/SerializeObject";
import ReadyEvent from "./discord/events/ReadyEvent";
import GuildMemberAddEvent from './discord/events/GuildMemberAddEvent';
import { GuildMember } from "discord.js";
import GuildMemberRemove from "./discord/events/GuildMemberRemoveEvent";

dotenv.config();

const bot = new Bot({
    token: process.env.BOT_TOKEN,
    prefix: process.env.BOT_PREFIX
});

(async () => {
    await bot.login();
    await bot.client.user.setActivity('düdelidü', { type: "WATCHING" } );
    bot.commandHandler.registerCommand("ping", PingCommand);

    bot.eventHandler.addEventListener("ready", ReadyEvent);
    bot.eventHandler.addEventListener('guildMemberAdd', (member) => GuildMemberAddEvent(member));
    bot.eventHandler.addEventListener('guildMemberRemove', (member) => GuildMemberRemove(member));
})();

const so = new SerializeObject({ test: true });
Serializer.writeObject("test.json", so);
