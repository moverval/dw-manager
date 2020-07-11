import { AccountEarnType } from "./AccountEarnConfig";
import CoinSystem from "./CoinSystem";
import Transfer, { TransferPosition } from "./Transfer";
import { Serializable } from "../filesystem/Types";
import Inventory from "./shop/Inventory";

export default class Account implements Serializable<AccountValue> {
    static rootAccount(coinSystem: CoinSystem) {
        return coinSystem.getAccount("*");
    }

    userId: string;
    coinSystem: CoinSystem;
    inventory: Inventory;

    private Coins: number;

    constructor(coinSystem: CoinSystem, userId: string) {
        this.userId = userId;
        this.inventory = new Inventory(this.coinSystem.shopSystem, this);
        this.coinSystem = coinSystem;
        this.Coins = coinSystem.earnConfig.get(AccountEarnType.USER_JOINED);
    }

    get coins(): number {
        return this.Coins;
    }

    serialize() {
        return {
            userId: this.userId,
            coins: this.Coins,
        };
    }

    deserialize(value: AccountValue) {
        this.userId = value.userId;
        this.Coins = value.coins;

        return true;
    }

    add(eat: AccountEarnType, times: number) {
        this.Coins += this.coinSystem.earnConfig.get(eat) * times;
    }

    makeTransfer(transfer: Transfer, transferPosition: TransferPosition) {
        if (this.coinSystem.isTransfer(transfer.id)) {
            if (transferPosition === TransferPosition.SENDER) {
                if (this.Coins - transfer.amount < 0) {
                    return false;
                }

                this.Coins -= transfer.amount;
            } else if (transferPosition === TransferPosition.RECEIVER) {
                this.Coins += transfer.amount;
            }

            return true;
        } else {
            return false;
        }
    }
}

export interface AccountValue {
    userId: string;
    coins: number;
}
