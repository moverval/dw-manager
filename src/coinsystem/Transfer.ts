import uuid from "uuid";
import { SerializeValue, Serializable } from "../filesystem/Types";

export default class Transfer implements Serializable<TransferValue> {
    static rootTransfer() {
        return new Transfer(0, "");
    }

    private Id: string;
    private Amount: number;
    private Reason: string;

    constructor(amount: number, reason?: string) {
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

    get amount(): number {
        return this.Amount;
    }

    serialize() {
        return {
            id: this.Id,
            amount: this.Amount,
            reason: this.Reason,
        };
    }

    deserialize(value: TransferValue) {
        this.Id = value.id;
        this.Amount = value.amount;
        this.Reason = value.reason;
        return true;
    }
}

export interface TransferValue extends SerializeValue {
    id: string;
    amount: number;
    reason: string;
}

export enum TransferPosition {
    SENDER,
    RECEIVER,
}
