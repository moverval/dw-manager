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
    channelInformationLinker.load();

    await bot.login();

    bot.commandHandler.registerCommand(new PingCommand(bot, "ping"));
    bot.commandHandler.registerCommand(new HelpCommand(bot, "help"));
    bot.commandHandler.registerCommand(new CoinCommand(bot, "coins", coinSystem));
    bot.commandHandler.registerCommand(new TransferCommand(bot, "transfer", coinSystem));
    bot.commandHandler.registerCommand(new AdminShopCommand(bot, "sysshop", coinSystem));
    bot.commandHandler.registerCommand(new ShopCommand(bot, "shop", coinSystem));

    bot.commandHandler.assignDocumentations(documentations);

    bot.eventHandler.addEventListener("ready", ReadyEvent);
    AdUpvote(channelInformationLinker, bot, coinSystem);

    InviteTracker(coinSystem, bot);

    scheduler.scheduleJob({ hour: 0, minute: 0 }, () => {
        if(!fs.existsSync("backup")) {
            fs.mkdirSync(dpData.parse("backup"));
        }

        Serializer.writeObject(dpData.parse("backup/coinSystem-" + new Date().toString() + ".json"), coinSystem);
        Serializer.writeObject(dpData.parse("backup/shopSystem-" + new Date().toString() + ".json"), coinSystem.shopSystem);
    });

    process.stdin.resume();
    const closeHandler = () => {
        Serializer.writeObject(dpData.parse("coinSystem.json"), coinSystem);
        Serializer.writeObject(dpData.parse("shopSystem.json"), coinSystem.shopSystem);
        process.exit(0);
    };

    bot.eventHandler.addEventListener("message", WordManager(coinSystem, channelInformationLinker));

    process.on("exit", closeHandler);
    process.on("SIGINT", closeHandler);
    process.on("SIGUSR1", closeHandler);
    process.on("SIGUSR2", closeHandler);
    process.on("uncaughtException", (error) => {
        console.error(error);
        closeHandler();
    });
})();
