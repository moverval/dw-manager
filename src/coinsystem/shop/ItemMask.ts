import Account from "../Account";
import CoinSystem from "../CoinSystem";
import { StringMap } from "../../Types";

export default abstract class ItemMask {
    coinSystem: CoinSystem;

    name: string;

    protected Config: StringMap<string | number>;

    constructor(coinSystem: CoinSystem) {
        this.coinSystem = coinSystem;
        this.setConfig();
    }

    get config() {
        return this.Config;
    }

    equalConfig(config1: StringMap<string | number>, config2: StringMap<string | number>) {
        return config1 === config2;
    }

    abstract equip(account: Account, config: StringMap<string | number>): boolean;
    abstract unequip(account: Account, config: StringMap<string | number>): boolean;
    abstract isEquipable(account: Account, config: StringMap<string | number>): boolean;
    abstract isEquipped(account: Account, config: StringMap<string | number>): boolean;
    abstract setConfig(): void;
    abstract validConfig(structureConfig: StringMap<string | number>): boolean;
}

export interface InventoryItem {
    amount: number;
    structure: string;
}
