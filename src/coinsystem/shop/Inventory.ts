import Account from "../Account";
import { StringMap } from "../../Types";
import { Serializable, SerializeValue } from "../../filesystem/Types";
import ShopSystem from "./ShopSystem";

export default class Inventory implements Serializable<SerializableInventory> {
    shopSystem: ShopSystem;
    inventoryMap: StringMap<InventoryItem>;
    account: Account;

    constructor(shopSystem: ShopSystem, account: Account) {
        this.inventoryMap = {};
        this.shopSystem = shopSystem;
        this.account = account;
    }

    hasItem(id: string) {
        return typeof this.inventoryMap[id] !== "undefined";
    }

    addItem(name: string, structure: string, structureConfig: StringMap<string | number>, id: string) {
        if (this.shopSystem.isItemStructure(structure)) {
            this.inventoryMap[id] = {
                id,
                name,
                structure,
                config: structureConfig,
                status: {},
            };
        }
    }

    removeItem(id: string) {
        if (this.hasItem(id)) {
            delete this.inventoryMap[id];
            return true;
        } else {
            return false;
        }
    }

    makeOffer(item: InventoryItem, price: number) {
        if (item.status.tradeOffer) {
            return false;
        }

        const matchingCategories = this.shopSystem.findItemCategories(
            this.shopSystem.shopRegister,
            item.structure,
            item.config
        );

        if (matchingCategories.length > 0) {
            ShopSystem.addItem(matchingCategories[0], this.account, price, item.id);
            item.status.tradeOffer = true;
            return true;
        }

        return false;
    }

    removeOffer(item: InventoryItem) {
        if (!item.status.tradeOffer) {
            return false;
        }

        const matchingCategories = this.shopSystem.findItemCategories(
            this.shopSystem.shopRegister,
            item.structure,
            item.config
        );

        let success = false;

        matchingCategories.forEach((category) => {
            const index = ShopSystem.findItemIndex(category, item.id);

            if (index > -1) {
                ShopSystem.removeItemByIndex(category, index);
                item.status.tradeOffer = undefined;
                success = true;
                return;
            }
        });

        return success;
    }

    isEmpty() {
        return JSON.stringify(this.inventoryMap) === "{}";
    }

    serialize() {
        return {
            items: this.inventoryMap,
        };
    }

    deserialize(invObj: SerializableInventory) {
        this.inventoryMap = invObj.items;
        return true;
    }
}

export interface InventoryItem {
    id: string;
    name: string;
    structure: string;
    config: StringMap<string | number>;
    status: {
        tradeOffer?: boolean;
    };
}

export interface SerializableInventory extends SerializeValue {
    items: StringMap<InventoryItem>;
}
