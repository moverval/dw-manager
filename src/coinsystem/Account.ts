import { AccountEarnType } from "./AccountEarnConfig";
import CoinSystem from "./CoinSystem";
import Transfer, { TransferPosition, TransferValue } from "./Transfer";
import { StringMap } from "../Types";
import { Serializable, SerializeValue } from "../filesystem/Types";

export default class Account implements Serializable<AccountValue> {
    static rootAccount(coinSystem: CoinSystem) {
        return coinSystem.getAccount("*");
    }

    userId: string;
    coinSystem: CoinSystem;
    private transferQueue: StringMap<Transfer>;
    private AcceptedTransferQueue: StringMap<Transfer>;

    private Coins: number;

    constructor(coinSystem: CoinSystem, userId: string) {
        this.userId = userId;
        this.coinSystem = coinSystem;
        this.Coins = coinSystem.earnConfig.get(AccountEarnType.USER_JOINED);
        this.transferQueue = {};
        this.AcceptedTransferQueue = {};
    }

    get coins(): number {
        return this.Coins;
    }

    get acceptedTransferQueue() {
        return this.AcceptedTransferQueue;
    }

    serialize() {
        const qTransfer: StringMap<TransferValue> = {};
        const qAcceptedTransfer: StringMap<TransferValue> = {};

        for (const transferKey in this.transferQueue) {
            if (this.transferQueue[transferKey]) {
                qTransfer[transferKey] = this.transferQueue[transferKey].serialize();
            }
        }

        for (const transferKey in this.acceptedTransferQueue) {
            if (this.acceptedTransferQueue[transferKey]) {
                qAcceptedTransfer[transferKey] = this.acceptedTransferQueue[transferKey].serialize();
            }
        }

        return {
            userId: this.userId,
            coins: this.Coins,
            transferQueue: qTransfer,
            acceptedTransferQueue: qAcceptedTransfer,
        };
    }

    deserialize(value: AccountValue) {
        this.userId = value.userId;
        this.Coins = value.coins;

        for(const transferKey in value.transferQueue) {
            if(value.transferQueue[transferKey]) {
                const transfer = Transfer.rootTransfer(this.coinSystem);
                transfer.deserialize(value.transferQueue[transferKey]);
            }
        }

        for(const transferKey in value.acceptedTransferQueue) {
            if(value.acceptedTransferQueue[transferKey]) {
                const transfer = Transfer.rootTransfer(this.coinSystem);
                transfer.deserialize(value.acceptedTransferQueue[transferKey]);
            }
        }

        return true;
    }

    add(eat: AccountEarnType, times: number) {
        this.Coins += this.coinSystem.earnConfig.get(eat) * times;
    }

    addTransfer(transfer: Transfer) {
        this.transferQueue[transfer.id] = transfer;
    }

    doTransfer(id: string, transferPosition?: TransferPosition) {
        const transfer = this.transferQueue[id];
        let partner: Account = null;

        if (!transferPosition) {
            transferPosition = transfer.accountSender === this ? TransferPosition.SENDER : TransferPosition.RECEIVER;
        }

        if (transferPosition === TransferPosition.SENDER) {
            this.Coins -= transfer.amount;
            partner = transfer.accountReceiver;
        } else {
            this.Coins += transfer.amount;
            partner = transfer.accountSender;
        }

        this.transferQueue[id] = null;
        this.AcceptedTransferQueue[id] = transfer;

        if (!partner.acceptedTransferQueue[id]) {
            partner.doTransfer(id);
        }
    }
}

export interface AccountValue {
    userId: string;
    coins: number;
    transferQueue: StringMap<TransferValue>;
    acceptedTransferQueue: StringMap<TransferValue>;
}
