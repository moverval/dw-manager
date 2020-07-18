import ItemMask from "../../coinsystem/shop/ItemMask";
import Account from "../../coinsystem/Account";
import { StringMap } from "../../Types";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";

export default class EquipableRoleMask extends ItemMask {
    bot: Bot;
    equipped: boolean;

    constructor(coinSystem: CoinSystem, bot: Bot) {
        super(coinSystem);
        this.bot = bot;
        this.equipped = false;
    }

    equip(account: Account, config: StringMap<string | number>): boolean {
        const mainGuild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);
        const user = mainGuild.members.cache.get(account.userId);

        if(!mainGuild) {
            return false;
        }

        if(user) {
            user.roles.add(config.roleId as string).catch();
            return true;
        }

        return false;
    }
    unequip(account: Account, config: StringMap<string | number>): boolean {
        const mainGuild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);

        if(!mainGuild) {
            return false;
        }

        const user = mainGuild.members.cache.get(account.userId);
        if(user) {
            user.roles.remove(config.roleId as string).catch();
            return true;
        }

        return false;
    }
    isEquipped(account: Account, config: StringMap<string | number>) {
        const mainGuild = this.bot.client.guilds.cache.get(process.env.MAIN_GUILD);

        if(mainGuild) {
            const role = mainGuild.roles.cache.get(config.roleId as string);

            if(role) {
                const user = mainGuild.members.cache.get(account.userId);

                if(user) {
                    return user.roles.cache.has(role.id);
                }
            }
        }

        return false;
    }
    isEquipable(account: Account, config: StringMap<string | number>) {
        return true;
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
