import ItemMask from "../../coinsystem/shop/ItemMask";
import Account from "../../coinsystem/Account";
import { StringMap } from "../../Types";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";
import { Guild } from "discord.js";

export default class EquipableRoleMask extends ItemMask {
    bot: Bot;
    mainGuild: Guild;
    equipped: boolean;

    constructor(coinSystem: CoinSystem, bot: Bot) {
        super(coinSystem);
        this.bot = bot;
        this.mainGuild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);
        this.equipped = false;
    }

    equip(account: Account, config: StringMap<string | number>): boolean {
        const user = this.mainGuild.members.cache.get(account.userId);
        if(user) {
            user.roles.add(config.roleId as string);
            return true;
        }

        return false;
    }
    unequip(account: Account, config: StringMap<string | number>): boolean {
        const user = this.mainGuild.members.cache.get(account.userId);
        if(user) {
            user.roles.remove(config.roleId as string);
            return true;
        }

        return false;
    }
    sell(account: Account, config: StringMap<string | number>): boolean {
        throw new Error("Method not implemented.");
    }
    setConfig(): void {
        this.Config = {
            roleId: "<!Not Set!>",
        };
    }
    validConfig(structureConfig: StringMap<string | number>): boolean {
        const mainGuild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);
        if(mainGuild) {
            const role = mainGuild.roles.cache.get(structureConfig.roleId as string);
            if(role) {
                return true;
            }
        }

        return false;
    }
}
