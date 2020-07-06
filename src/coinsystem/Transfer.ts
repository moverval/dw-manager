import Account from "./Account";
import uuid from "uuid";

export default class Transfer {
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
}

export enum TransferPosition {
    SENDER, RECEIVER,
}
