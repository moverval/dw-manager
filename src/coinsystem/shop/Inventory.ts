import Account from "../Account";
import { StringMap } from "../../Types";
import { v4 as uuidv4 } from "uuid";
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

    addItem(name: string, structure: string, structureConfig: StringMap<string | number>) {
        if (this.shopSystem.isItemStructure(structure)) {
            const id = uuidv4();
            this.inventoryMap[id] = {
                name,
                structure,
                config: structureConfig,
            };
        }
    }

    removeItem(id: string) {
        if (this.hasItem(id)) {
            this.inventoryMap[id] = undefined;
            return true;
        } else {
            return false;
        }
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
    name: string;
    structure: string;
    config: StringMap<string | number>;
}

export interface SerializableInventory extends SerializeValue {
    items: StringMap<InventoryItem>;
}
