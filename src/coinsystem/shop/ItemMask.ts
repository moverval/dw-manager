import Account from "../Account";
import CoinSystem from "../CoinSystem";
import { StringMap } from "../../Types";

export default abstract class ItemMask {
    coinSystem: CoinSystem;

    name: string;
    isStackable: boolean;
    canEquip: boolean;
    canSell: boolean;

    protected Config: StringMap<string | number>;

    constructor(coinSystem: CoinSystem) {
        this.coinSystem = coinSystem;
        this.setConfig();
    }

    get config() {
        return this.Config;
    }

    abstract equip(account: Account, config: StringMap<string | number>): boolean;
    abstract unequip(account: Account, config: StringMap<string | number>): boolean;
    abstract setConfig(): void;
    abstract validConfig(structureConfig: StringMap<string | number>): boolean;
}

export interface InventoryItem {
    amount: number;
    structure: string;
}
