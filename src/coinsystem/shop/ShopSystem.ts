import CoinSystem from "../CoinSystem";
import { Serializable, SerializeValue } from "../../filesystem/Types";
import { StringMap } from "../../Types";
import ItemMask from "./ItemMask";
import Account from "../Account";

export default class ShopSystem implements Serializable<SerializableShopRegister> {
    static findItem<T>(list: ShopItem[], getter: (s: ShopItem) => T, value: T) {
        return list.find((shopItem) => getter(shopItem) === value);
    }

    static findItems<T>(list: ShopItem[], getter: (s: ShopItem) => T, value: T) {
        return list.filter((shopItem) => getter(shopItem) === value);
    }

    static findNav(register: ShopRegister, key: string) {
        return register.childreen.find((shopReg) => shopReg.nav === key);
    }

    static getPrice(shopItem: ShopItem) {
        return shopItem.price;
    }

    static getContributorId(shopItem: ShopItem) {
        return shopItem.contributorId;
    }

    static addItem(mark: ShopRegister, item: ShopItem) {
        mark.items.push(item);
    }

    static removeItem(mark: ShopRegister, item: ShopItem) {
        const index = mark.items.indexOf(item);
        if(index) {
            mark.items.splice(index, 1);
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
        };
        this.shopItemStructure = {};
    }

    getStructure(mark: ShopRegister) {
        return this.shopItemStructure[mark.structure];
    }

    buyItem(mark: ShopRegister, account: Account, sorter: (mark: ShopRegister) => ShopItem[]): BuyStatus {
        if (mark.structure !== "none") {
            const itemStructure = this.shopItemStructure[mark.structure];
            if (itemStructure) {
                const sortedArray = sorter(mark);
                const selectedItem = sortedArray[0];
                if(selectedItem) {
                    const seller = this.coinSystem.getAccount(selectedItem.contributorId);
                    const buyStatus = itemStructure.buy(account, seller, selectedItem.price, itemStructure.name);
                    if(buyStatus === BuyStatus.BUY_SUCCESS) {
                        const index = mark.items.indexOf(selectedItem);
                        mark.items.splice(index, 1);
                    }

                    return buyStatus;
                } else {
                    return BuyStatus.ITEMS_OUT;
                }
            } else {
                return BuyStatus.INVALID_ITEM;
            }
        } else {
            return BuyStatus.INVALID_ITEM;
        }
    }

    serialize() {
        return this.shopRegister as SerializableShopRegister;
    }

    deserialize(s: SerializableShopRegister) {
        this.shopRegister = s as ShopRegister;
        return true;
    }

    point(navigation: string) {
        const keys = navigation.split(".");

        const construct = (splits: string[], mark: ShopRegister): ShopRegister => {
            const current = splits.shift();

            let next = ShopSystem.findNav(mark, current);

            if (!next) {
                next = {
                    name: null,
                    nav: current,
                    items: [],
                    structure: "none",
                    childreen: [],
                };

                mark.childreen.push(next);
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
}

export interface SerializableShopRegister extends ShopRegister, SerializeValue {}

export interface ShopItem {
    contributorId: string;
    price: number;
}

export enum BuyStatus {
    BUY_SUCCESS, INVALID_ITEM, MONEY_MISSING, ITEMS_OUT, UNIQUE_ITEM_BOUGHT_TWICE
}
