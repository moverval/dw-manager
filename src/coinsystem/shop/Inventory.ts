import ShopSystem, { ShopRegister, ShopItem } from "./ShopSystem";
import Account from "../Account";

export default class Inventory {
    shopSystem: ShopSystem;
    inventoryData: ShopRegister[];
    account: Account;

    constructor(shopSystem: ShopSystem, account: Account) {
        this.shopSystem = shopSystem;
        this.account = account;
    }

    findItemStructure(itemStructure: string) {
        return this.inventoryData.find((iis) => iis.structure === itemStructure);
    }

    hasItemStructure(itemStructure: string) {
        return typeof this.findItemStructure(itemStructure) !== "undefined";
    }

    addItemStructure(itemStructure: string) {
        const itemStructureObject: ShopRegister = {
            name: null,
            structure: itemStructure,
            childreen: [],
            items: [],
            nav: null,
            structureConfig: {},
            structureConfigValid: true
        };

        this.inventoryData.push(itemStructureObject);

        return itemStructureObject;
    }

    addToStructure(itemStructure: string, shopItem: ShopItem) {
        const itemStructureObject = this.findItemStructure(itemStructure);
        itemStructureObject.items.push(shopItem);
    }

    addItem(itemStructure: string) {
        let itemStructureObject = this.findItemStructure(itemStructure);
        if(!itemStructureObject) {
            itemStructureObject = this.addItemStructure(itemStructure);
        }

        const shopItem: ShopItem = {
            contributorId: this.account.userId,
            price: 0
        };

        itemStructureObject.items.push(shopItem);
    }

    removeItem(itemStructure: string) {
        const itemStructureObject = this.findItemStructure(itemStructure);

        if(itemStructureObject) {
            if(itemStructureObject.items.length > 0) {
                itemStructureObject.items.shift();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
