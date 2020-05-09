import CoinUser from "./CoinUser";

export default class Coinsystem {
    private users: CoinUser[];
    private lastChange: Date;

    constructor() {
        this.registerChange();
    }

    private registerChange() {
        this.lastChange = new Date();
    }

    addUser(cu: CoinUser) {
        this.users.push(cu);
        this.registerChange();
    }

    removeUser(cu: CoinUser) {
        this.removeUserById(cu.getId());
        this.registerChange();
    }

    removeUserById(cuid: string) {
        const index: number = this.users.findIndex((value) => value.getId() === cuid);
        this.users.slice(index, 1);
        this.registerChange();
    }
}

export interface CoinState {
    amount: number;
    locked: number;
}
