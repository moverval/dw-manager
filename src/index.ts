import dotenv from "dotenv";
import CoinSystem from "./coinsystem/CoinSystem";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/Ping";
import { UserConfig, CoinAmountState, LevelState, UserConfigInitializer } from "./coinsystem/CoinConfig";
import Serealizer from "./filesystem/Serializer";
import CoinUser from "./coinsystem/CoinUser";
import { UserSave } from "./coinsystem/components/UserSave";

dotenv.config();

const userConfig: UserConfig = new UserConfigInitializer(3000, UserConfigInitializer.defaultLevelState);

const cs: CoinSystem = new CoinSystem("coinsystem.json");
const cu: CoinUser = new CoinUser(userConfig);
cs.addUser(cu);

const key = Serealizer.writeObject("test.json", cu);
Serealizer.writeObject("test2.json", cs);

// const key = Serealizer.makeKey("test.json", "*");
const value = Serealizer.loadObject<UserSave>(key);
Serealizer.parseObject(value, cu);

// if(process.env.BOT_TOKEN) {
//     const bot: Bot = new Bot(process.env.BOT_TOKEN as string, process.env.BOT_PREFIX as string);
//     bot.login();
//     bot.registerCommand("ping", PingCommand);
// }
