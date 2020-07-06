import { StringMap } from "../Types";
import Wrapper from "../Wrapper";
import AccountEarnConfig from "./AccountEarnConfig";
import Account, {AccountValue} from "./Account";
import { Serializable, SerializeValue } from "../filesystem/Types";
import Transfer, { TransferPosition } from "./Transfer";

export default class CoinSystem implements Serializable<CoinSystemSerialized> {
    private Accounts: StringMap<Account>;
    private EarnConfig: Wrapper<AccountEarnConfig>;

    constructor(earnConfig?: AccountEarnConfig) {
        this.Accounts = {};

        if (earnConfig) {
            this.EarnConfig = new Wrapper(earnConfig);
        } else {
            this.EarnConfig = new Wrapper(null);
        }
    }
    get earnConfig(): AccountEarnConfig {
        return this.EarnConfig.value;
    }

    set earnConfig(earnConfig: AccountEarnConfig) {
        this.EarnConfig.value = earnConfig;
    }

    get accounts(): StringMap<Account> {
        return this.Accounts;
    }

    addTransferRequest(sender: Account, receiver: Account, amount: number) {
        const transfer = new Transfer(sender, receiver, amount);
        sender.addTransfer(transfer);
        receiver.addTransfer(transfer);
        return transfer;
    }

    makeTransfer(transfer: Transfer) {
        transfer.accountSender.doTransfer(transfer.id, TransferPosition.SENDER);
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
        return this.Accounts[accountId] !== undefined;
    }

    addAccount(account: Account) {
        this.Accounts[account.userId] = account;
    }

    removeAccount(accountId: string) {
        this.Accounts[accountId] = undefined;
    }

    serialize() {
        const accountData: StringMap<AccountValue> = {};

        for(const account in this.Accounts) {
            if(this.Accounts[account]) {
                accountData[account] = this.Accounts[account].serialize();
            }
        }

        return {
            accounts: accountData
        };
    }

    deserialize(value: CoinSystemSerialized) {
        const accounts: StringMap<Account> = {};

        for(const accountKey in value.accounts) {
            if(value.accounts[accountKey]) {
                const account = Account.rootAccount(this);
                account.deserialize(value.accounts[accountKey]);
                accounts[accountKey] = account;
            }
        }

        this.Accounts = accounts;

        return true;
    }
}

interface CoinSystemSerialized extends SerializeValue {
    accounts: StringMap<AccountValue>;
}
