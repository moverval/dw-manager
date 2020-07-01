import { AccountEarnType } from "./AccountEarnConfig";
import CoinSystem from "./CoinSystem";

export default class Account {
    private _coins: number;
    readonly userId: string;
    coinSystem: CoinSystem;

    constructor(coinSystem: CoinSystem, userId: string) {
        this.userId = userId;
        this.coinSystem = coinSystem;
        this._coins = coinSystem.earnConfig.get(AccountEarnType.USER_JOINED);
    }

    get coins(): number {
        return this._coins;
    }

    add(eat: AccountEarnType, times: number) {
        this._coins += this.coinSystem.earnConfig.get(eat) * times;
    }
}
