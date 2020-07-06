import Account, {AccountValue} from "./Account";
import uuid from "uuid";
import {SerializeValue, Serializable} from "../filesystem/Types";
import CoinSystem from "./CoinSystem";

export default class Transfer implements Serializable<TransferValue> {

    static rootTransfer(coinSystem: CoinSystem) {
        return new Transfer(Account.rootAccount(coinSystem), Account.rootAccount(coinSystem), 0, "");
    }

    private Id: string;
    private AccountSender: Account;
    private AccountReceiver: Account;
    private Amount: number;
    private Reason: string;

    constructor(accountSender: Account, accountReceiver: Account, amount: number, reason?: string) {
        this.AccountSender = accountSender;
        this.AccountReceiver = accountReceiver;
        this.Amount = amount;
        this.Id = uuid.v4();
        this.Reason = reason;
    }

    get reason(): string {
        return this.Reason;
    }

    get id(): string {
        return this.Id;
    }

    get accountSender(): Account {
        return this.AccountSender;
    }

    get accountReceiver(): Account {
        return this.AccountReceiver;
    }

    get amount(): number {
        return this.Amount;
    }

    serialize() {
        return {
            id: this.Id,
            accountSenderId: this.AccountSender.userId,
            accountReceiverId: this.AccountReceiver.userId,
            amount: this.Amount,
            reason: this.Reason
        };
    }

    deserialize(value: TransferValue) {
        this.Id = value.id;
        this.AccountSender = this.AccountSender.coinSystem.getAccount(value.accountSenderId);
        this.AccountReceiver = this.AccountReceiver.coinSystem.getAccount(value.accountReceiverId);
        this.Amount = value.amount;
        this.Reason = value.reason;
        return true;
    }
}

export interface TransferValue extends SerializeValue {
    id: string;
    accountSenderId: string;
    accountReceiverId: string;
    amount: number;
    reason: string;
}

export enum TransferPosition {
    SENDER, RECEIVER,
}
