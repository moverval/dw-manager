import Account from "../Account";
import CoinSystem from "../CoinSystem";
import Transfer from "../Transfer";
import { BuyStatus } from "./ShopSystem";
import {StringMap} from "../../Types";

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

    buy(buyer: Account, seller: Account, price: number, structureName: string) {
        if (!this.isStackable) {
            const structure = buyer.inventory.findItemStructure(this.name);
            if (structure) {
                return BuyStatus.UNIQUE_ITEM_BOUGHT_TWICE;
            }
        }

        const transfer = new Transfer(price);
        this.coinSystem.registerTransfer(transfer);
        this.coinSystem.makeTransfer(transfer.id, buyer, seller);
        this.coinSystem.removeTransfer(transfer.id);

        buyer.inventory.addItem(this.name);

        return BuyStatus.BUY_SUCCESS;
    }

    abstract equip(account: Account, config: StringMap<string | number>): boolean;
    abstract unequip(account: Account, config: StringMap<string | number>): boolean;
    abstract sell(account: Account, config: StringMap<string | number>): boolean;
    abstract setConfig(): void;
    abstract validConfig(structureConfig: StringMap<string | number>): boolean;
}

export interface InventoryItem {
    amount: number;
    structure: string;
}
