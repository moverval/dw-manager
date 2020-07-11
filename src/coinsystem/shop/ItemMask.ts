import Account from "../Account";
import CoinSystem from "../CoinSystem";
import Transfer from "../Transfer";
import { ShopItem, BuyStatus } from "./ShopSystem";

export default abstract class ItemMask {
    coinSystem: CoinSystem;

    name: string;
    isStackable: boolean;
    canEquip: boolean;
    canSell: boolean;

    constructor(coinSystem: CoinSystem) {
        this.coinSystem = coinSystem;
    }

    buy(buyer: Account, seller: Account, price: number, structureName: string) {
        if (!this.isStackable) {
            const structure = buyer.inventory.findItemStructure(this.name);
            if(structure) {
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

    abstract onEquip(account: Account): boolean;
    abstract onUnequip(account: Account): boolean;
    abstract onBuy(account: Account): boolean;
    abstract onSell(account: Account): boolean;
}

export interface InventoryItem {
    amount: number;
    structure: string;
}
