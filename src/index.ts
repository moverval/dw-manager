import dotenv from "dotenv";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/PingCommand";
import ReadyEvent from "./discord/events/ReadyEvent";
import HelpCommand from "./discord/commands/HelpCommand";
import DataPoint from "./filesystem/DataPoint";
import JsonLinker from "./discord/loaders/JsonLinker";
import { StringMap } from "./Types";
import DocumentationObject from "./discord/abstract/DocumentationObject";
import DocumentationObjectParser from "./discord/components/DocumentationObjectParser";
import CoinSystem, { CoinSystemSerialized } from "./coinsystem/CoinSystem";
import AccountEarnConfig from "./coinsystem/AccountEarnConfig";
import CoinCommand from "./discord/commands/CoinCommand";
import WordManager from "./discord/events/WordManager";
import InviteTracker from "./discord/events/InviteTracker";
import TransferCommand from "./discord/commands/TransferCommand";
import Serializer from "./filesystem/Serializer";
import AdUpvote, { ChannelInformation } from "./discord/events/AdUpvote";
import scheduler from "node-schedule";
import AdminShopCommand from "./discord/commands/admin/AdminShopCommand";
import { SerializableShopRegister } from "./coinsystem/shop/ShopSystem";
import EquipableRoleMask from "./discord/components/EquipableRoleMask";
import ShopCommand from "./discord/commands/ShopCommand";
import fs from "fs";
import BumpEvent from "./discord/events/BumpEvent";
import CheckCommand from "./discord/commands/admin/CheckCommand";
import LeaderboardCommand from "./discord/commands/LeaderboardCommand";
import CreateUserJoined from "./discord/events/CreateUserJoined";
import Welcome, { WelcomeData } from "./discord/events/Welcome";
import EchoCommand from "./discord/commands/EchoCommand";
import WindowTest from "./discord/commands/WindowTest";

dotenv.config();

const bot = new Bot({
    token: process.env.BOT_TOKEN,
    prefix: process.env.BOT_PREFIX,
});

(async () => {
    const rawNavData = new JsonLinker<{
        configDirectory: string;
        dataDirectory: string;
    }>(new DataPoint("./"), "navigation.json");
    rawNavData.load();
    const dpConfig = new DataPoint(rawNavData.value.configDirectory);
    const dpData = new DataPoint(rawNavData.value.dataDirectory);
    bot.util.dp = dpData;
    const documentations = new JsonLinker<StringMap<DocumentationObject>>(dpConfig, "help_information.json");
    documentations.addLoadingComponent(new DocumentationObjectParser(dpConfig, documentations));
    documentations.load();

    const coinSystem = new CoinSystem();
    const accountEarnConfig = new JsonLinker<number[]>(dpConfig, "earn_information.json");

    if (accountEarnConfig.sourceVisible()) {
        accountEarnConfig.load();

        const earnConfig = new AccountEarnConfig(accountEarnConfig.value);
        coinSystem.earnConfig = earnConfig;
    } else {
        console.error("File earn_information.json is missing");
        return;
    }

    const coinSystemLinker = new JsonLinker<{ "*": CoinSystemSerialized }>(dpData, "coinSystem.json");

    if (coinSystemLinker.sourceVisible()) {
        coinSystemLinker.load();
        coinSystem.deserialize(coinSystemLinker.value["*"]);
    }

    const shopSystemLinker = new JsonLinker<{ "*": SerializableShopRegister }>(dpData, "shopSystem.json");

    if (shopSystemLinker.sourceVisible()) {
        shopSystemLinker.load();
        coinSystem.shopSystem.deserialize(shopSystemLinker.value["*"]);
    }

    coinSystem.shopSystem.addShopItemStructure("discord:equipable-role", new EquipableRoleMask(coinSystem, bot));

    const channelInformationLinker = new JsonLinker<StringMap<ChannelInformation>>(
        dpConfig,
        "channelmarker_debug.json"
    );
    channelInformationLinker.load(); // Loading Channel Metadata

    await bot.login();

    bot.commandHandler.registerCommand(new PingCommand(bot, "ping")); // Ping Command
    bot.commandHandler.registerCommand(new HelpCommand(bot, "help")); // Help Command
    bot.commandHandler.registerCommand(new CoinCommand(bot, "money", coinSystem)); // Money Command
    bot.commandHandler.registerCommand(new TransferCommand(bot, "transfer", coinSystem)); // Transfer Command
    bot.commandHandler.registerCommand(new AdminShopCommand(bot, "sysshop", coinSystem)); // Sysshop
    /* bot.commandHandler.registerCommand(new ShopCommand(bot, "shop", coinSystem)); // Shop Command */
    bot.commandHandler.registerCommand(new CheckCommand(bot, "check", coinSystem)); // Administrative Check Command
    bot.commandHandler.registerCommand(new LeaderboardCommand(bot, "leaderboard", coinSystem)); // Leaderboard Command
    bot.commandHandler.registerCommand(new EchoCommand(bot, "echo", false));
    bot.commandHandler.registerCommand(new WindowTest(bot, coinSystem, "test"));

    const welcomeInformationLinker = new JsonLinker<WelcomeData>(dpConfig, "WelcomeData.json");
    welcomeInformationLinker.load();

    // bot.commandHandler.registerCommand(new TestReaction(bot, "test", coinSystem, welcomeInformationLinker));

    bot.commandHandler.assignDocumentations(documentations); // Appends JSON Documentation to Commands

    bot.service.register(new ReadyEvent(bot));
    bot.service.register(new AdUpvote(bot, coinSystem, channelInformationLinker));
    bot.service.register(new InviteTracker(bot, coinSystem));
    bot.service.register(new WordManager(bot, coinSystem, channelInformationLinker));
    bot.service.register(new BumpEvent(bot, coinSystem));

    bot.service.register(new Welcome(bot, coinSystem, channelInformationLinker, welcomeInformationLinker));
    bot.service.register(new CreateUserJoined(bot, coinSystem));

    scheduler.scheduleJob({ hour: 0, minute: 0 }, () => {
        if (!fs.existsSync(dpData.parse("backup"))) {
            fs.mkdirSync(dpData.parse("backup"));
        }

        Serializer.writeObject(dpData.parse("backup/coinSystem-" + new Date().toString() + ".json"), coinSystem);
        Serializer.writeObject(
            dpData.parse("backup/shopSystem-" + new Date().toString() + ".json"),
            coinSystem.shopSystem
        );
    });

    process.stdin.resume();
    const closeHandler = () => {
        Serializer.writeObject(dpData.parse("coinSystem.json"), coinSystem);
        Serializer.writeObject(dpData.parse("shopSystem.json"), coinSystem.shopSystem);
        process.exit(0);
    };

    process.on("exit", closeHandler);
    process.on("SIGINT", closeHandler);
    process.on("SIGUSR1", closeHandler);
    process.on("SIGUSR2", closeHandler);
    process.on("uncaughtException", (error) => {
        console.error(error);
        closeHandler();
    });
})();
