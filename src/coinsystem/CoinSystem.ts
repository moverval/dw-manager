import { StringMap } from "../Types";
import Wrapper from "../Wrapper";
import AccountEarnConfig from "./AccountEarnConfig";
import Account from "./Account";
import { Serializable } from "../filesystem/Types";

export default class CoinSystem implements Serializable<CoinSystemSerialized> {
    private _accounts: StringMap<Account>;
    private _earnConfig: Wrapper<AccountEarnConfig>;

    get earnConfig(): AccountEarnConfig {
        return this._earnConfig.value;
    }

    set earnConfig(earnConfig: AccountEarnConfig) {
        this._earnConfig.value = earnConfig;
    }

    get accounts(): StringMap<Account> {
        return this._accounts;
    }

    /**
     * Creates Account if it doesn't exists.
     * Prefer isAccount and accounts if another account shouldn't be created
     */
    getAccount(id: string) {
        if (!this.isAccount(id)) {
            this.addAccount(new Account(this, id));
        }

        return this.accounts[id];
    }

    isAccount(accountId: string) {
        return this._accounts[accountId] !== undefined;
    }

    constructor(earnConfig?: AccountEarnConfig) {
        this._accounts = {};

        if (earnConfig) {
            this._earnConfig = new Wrapper(earnConfig);
        } else {
            this._earnConfig = new Wrapper(null);
        }
    }

    addAccount(account: Account) {
        this._accounts[account.userId] = account;
    }

    removeAccount(accountId: string) {
        this._accounts[accountId] = undefined;
    }

    serialize() {
        return {
            accounts: this._accounts,
            earnConfigEat: this._earnConfig.value.eat,
        };
    }

    deserialize(s: CoinSystemSerialized) {
        this._accounts = s.accounts;
        this._earnConfig.value.eat = s.earnConfigEat;
        return true;
    }
}

interface CoinSystemSerialized {
    accounts: StringMap<Account>;
    earnConfigEat: number[];
}
