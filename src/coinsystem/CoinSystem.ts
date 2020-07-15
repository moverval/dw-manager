import { StringMap } from "../Types";
import Wrapper from "../Wrapper";
import AccountEarnConfig from "./AccountEarnConfig";
import Account, { AccountValue } from "./Account";
import { Serializable, SerializeValue } from "../filesystem/Types";
import Transfer, { TransferPosition } from "./Transfer";
import ShopSystem, { SerializableShopRegister } from "./shop/ShopSystem";

export default class CoinSystem implements Serializable<CoinSystemSerialized> {
    private Accounts: StringMap<Account>;
    private TransferIds: StringMap<Transfer>;
    private EarnConfig: Wrapper<AccountEarnConfig>;
    private ShopSystem: ShopSystem;

    constructor(earnConfig?: AccountEarnConfig) {
        this.Accounts = {};
        this.TransferIds = {};

        if (earnConfig) {
            this.EarnConfig = new Wrapper(earnConfig);
        } else {
            this.EarnConfig = new Wrapper(null);
        }

        this.ShopSystem = new ShopSystem(this);
    }

    get shopSystem(): ShopSystem {
        return this.ShopSystem;
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

    get transferIds(): StringMap<Transfer> {
        return this.TransferIds;
    }

    /**
     * Creates Account if it doesn't exists.
     * Prefer isAccount and accounts if another account shouldn't be created
     */
    getAccount(id: string) {
        if (!this.isAccount(id)) {
            this.createAccount(id);
        }

        return this.accounts[id];
    }

    registerTransfer(transfer: Transfer) {
        this.TransferIds[transfer.id] = transfer;
    }

    isTransfer(transferId: string) {
        return typeof this.TransferIds[transferId] !== "undefined";
    }

    removeTransfer(transferId: string) {
        this.TransferIds[transferId] = undefined;
    }

    makeTransfer(transferId: string, sender: Account, receiver: Account) {
        if (this.isTransfer(transferId)) {
            const transfer = this.TransferIds[transferId];
            if (sender.makeTransfer(transfer, TransferPosition.SENDER)) {
                receiver.makeTransfer(transfer, TransferPosition.RECEIVER);
            } else {
                return false;
            }
            return true;
        }

        return false;
    }

    makeSystemTransfer(transferId: string, senderId: string, receiverId: string) {
        if (this.isTransfer(transferId)) {
            const transfer = this.TransferIds[transferId];
            if (senderId) {
                this.getAccount(senderId).makeTransfer(transfer, TransferPosition.SENDER);
            }

            if (receiverId) {
                this.getAccount(receiverId).makeTransfer(transfer, TransferPosition.RECEIVER);
            }

            return true;
        }

        return false;
    }

    /*
     * Creates or overrides an Account if userId was already present
     */
    createAccount(id: string) {
        this.addAccount(new Account(this, id));
    }

    isAccount(accountId: string) {
        return typeof this.Accounts[accountId] !== "undefined";
    }

    addAccount(account: Account) {
        this.Accounts[account.userId] = account;
    }

    removeAccount(accountId: string) {
        this.Accounts[accountId] = undefined;
    }

    serialize() {
        const accountData: StringMap<AccountValue> = {};

        for (const account in this.Accounts) {
            if (this.Accounts[account]) {
                accountData[account] = this.Accounts[account].serialize();
            }
        }

        return {
            accounts: accountData,
            // shopSystem: this.ShopSystem.serialize(),
        };
    }

    deserialize(value: CoinSystemSerialized) {
        // this.ShopSystem.deserialize(value.shopSystem);

        for (const accountKey in value.accounts) {
            if (value.accounts[accountKey]) {
                const account = this.getAccount(accountKey);
                account.deserialize(value.accounts[accountKey]);
                this.Accounts[accountKey] = account;
            }
        }

        return true;
    }
}

export interface CoinSystemSerialized extends SerializeValue {
    accounts: StringMap<AccountValue>;
    shopSystem: SerializableShopRegister;
}
