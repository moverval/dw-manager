import { AccountEarnType } from "./AccountEarnConfig";
import CoinSystem from "./CoinSystem";
import Transfer, { TransferPosition } from "./Transfer";
import { StringMap } from "../Types";

export default class Account {
    readonly userId: string;
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
