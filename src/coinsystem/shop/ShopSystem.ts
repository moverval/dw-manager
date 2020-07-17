import CoinSystem from "../CoinSystem";
import { Serializable, SerializeValue } from "../../filesystem/Types";
import { StringMap } from "../../Types";
import ItemMask from "./ItemMask";
import Account from "../Account";
import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import Transfer from "../Transfer";

export default class ShopSystem implements Serializable<SerializableShopRegister> {
    static findNav(register: ShopRegister, key: string) {
        return register.childreen.find((shopReg) => shopReg.nav === key);
    }

    static findNavIndex(register: ShopRegister, key: string) {
        return register.childreen.findIndex((shopReg) => shopReg.nav === key);
    }

    static getPrice(shopItem: ShopItem) {
        return shopItem.price;
    }

    static getContributorId(shopItem: ShopItem) {
        return shopItem.contributorId;
    }

    static addItem(mark: ShopRegister, account: Account, price: number) {
        mark.items.push({ price, contributorId: account.userId, id: uuidv4() });
    }

    static removeItem(mark: ShopRegister, itemId: string) {
        const index = ShopSystem.findItemIndex(mark, itemId);

        if(index !== -1) {
            this.removeItemByIndex(mark, index);
            return true;
        } else {
            return false;
        }
    }

    static hasItems(mark: ShopRegister) {
        return mark.items.length > 0;
    }

    static hasStructure(mark: ShopRegister) {
        return typeof mark.structure !== "undefined";
    }

    static findCheapest(mark: ShopRegister) {
        return mark.items.sort((itemA, itemB) => itemA.price - itemB.price);
    }

    static rename(mark: ShopRegister, nav: string, name: string) {
        const realElement = ShopSystem.findNav(mark, name);
        if (!realElement) {
            const oldElement = ShopSystem.findNav(mark, nav);
            if (nav) {
                oldElement.nav = name.split(".")[0];
                return true;
            }
        }

        return false;
    }

    static structureConfigSet(mark: ShopRegister, point: string, value: string | number) {
        const type = typeof mark.structureConfig[point];
        const typeValue = typeof value;

        if (type === "undefined") {
            return StructureConfigStatus.NO_PARAMETER;
        }

        if (type === typeValue) {
            mark.structureConfig[point] = value;
            return StructureConfigStatus.SUCCESS;
        } else {
            return StructureConfigStatus.INVALID_TYPE;
        }
    }

    static getStructureConfigType(mark: ShopRegister, point: string) {
        return typeof mark.structureConfig[point];
    }

    static findItemIndex(mark: ShopRegister, itemId: string) {
        return mark.items.findIndex((item) => item.id === itemId);
    }

    static removeItemByIndex(mark: ShopRegister, index: number) {
        mark.items.splice(index, 1);
    }

    static point_create(mark: ShopRegister, current: string) {
        const next: ShopRegister = {
            name: null,
            nav: current,
            items: [],
            structure: "none",
            childreen: [],
            structureConfig: {},
            structureConfigValid: true,
            description: null,
        };

        mark.childreen.push(next);

        return next;
    }

    static point_cancel(mark: ShopRegister, current: string): ShopRegister {
        return null;
    }

    coinSystem: CoinSystem;
    shopRegister: ShopRegister;
    shopItemStructure: StringMap<ItemMask>;

    constructor(coinSystem: CoinSystem) {
        this.coinSystem = coinSystem;
        this.shopRegister = {
            name: null,
            nav: null,
            items: [],
            structure: "none",
            childreen: [],
            structureConfig: {},
            structureConfigValid: true,
            description: null,
        };
        this.shopItemStructure = {};
    }

    addShopItemStructure(name: string, structure: ItemMask) {
        this.shopItemStructure[name] = structure;
    }

    isItemStructure(name: string) {
        return typeof this.shopItemStructure[name] !== "undefined";
    }

    getStructure(mark: ShopRegister) {
        return this.shopItemStructure[mark.structure];
    }

    makeMarkStructure(mark: ShopRegister) {
        const structureObject = this.shopItemStructure[mark.structure];
        mark.structureConfig = lodash.cloneDeep(structureObject.config);
    }

    markStructureVerify(mark: ShopRegister) {
        const structureObject = this.shopItemStructure[mark.structure];
        const verified = structureObject.validConfig(mark.structureConfig);
        mark.structureConfigValid = verified;
        return verified;
    }

    buyItem(mark: ShopRegister, account: Account, itemId: string): BuyStatus {
        if(this.isItemStructure(mark.structure)) {
            const itemIndex = ShopSystem.findItemIndex(mark, itemId);

            if(itemIndex !== -1) {
                const item = mark.items[itemIndex];

                const seller = this.coinSystem.getAccount(item.contributorId);

                const transfer = new Transfer(item.price);
                this.coinSystem.registerTransfer(transfer);
                const success = this.coinSystem.makeTransfer(transfer.id, account, seller);

                if(success) {
                    ShopSystem.removeItemByIndex(mark, itemIndex);
                    account.inventory.addItem(mark.name, mark.structure, mark.structureConfig);

                    return BuyStatus.SUCCESS;
                } else {
                    return BuyStatus.INVALID_TRANSACTION;
                }
            } else {
                return BuyStatus.ITEM_ALREADY_SOLD;
            }
        } else {
            return BuyStatus.INVALID_CATEGORY;
        }
    }

    serialize() {
        return this.shopRegister as SerializableShopRegister;
    }

    deserialize(s: SerializableShopRegister) {
        this.shopRegister = s as ShopRegister;
        return true;
    }

    point(navigation: string, nf: (m: ShopRegister, s: string) => ShopRegister) {
        const keys = navigation.split(".");

        const construct = (splits: string[], mark: ShopRegister): ShopRegister => {
            const current = splits.shift();

            let next = ShopSystem.findNav(mark, current);

            if (!next) {
                next = nf(mark, current);
                if (!next) {
                    return null;
                }
            }

            if (splits.length === 0) {
                return next;
            }

            return construct(splits, next);
        };

        return construct(keys, this.shopRegister);
    }
}

export interface ShopRegister {
    name: string;
    nav: string;
    structure: string;
    items: ShopItem[];
    childreen: ShopRegister[];
    structureConfig: StringMap<string | number>;
    structureConfigValid: boolean;
    description: string;
}

export interface SerializableShopRegister extends ShopRegister, SerializeValue {}

export interface ShopItem {
    contributorId: string;
    price: number;
    id: string;
}

export enum BuyStatus {
    SUCCESS, INVALID_CATEGORY, ITEM_ALREADY_SOLD, INVALID_TRANSACTION
}

export enum StructureConfigStatus {
    SUCCESS,
    NO_PARAMETER,
    INVALID_TYPE,
}
