import { v4 as uuidv4 } from "uuid";

export default class CoinUser {
    private id: string;
    private coins: {
        count: number,
        freezed: number
    };

    constructor(id: string, coins?: number, freezed?: number) {
        if(id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }
        if(coins) {
            this.coins.count = coins;
        }
        if(freezed) {
            this.coins.freezed = freezed;
        }
    }

    getId() {
        return this.id;
    }
}
