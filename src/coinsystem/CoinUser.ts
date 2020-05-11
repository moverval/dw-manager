import { v4 as uuidv4 } from "uuid";
import { CoinState } from "./CoinSystem";
import { UserConfig, LevelState } from "./CoinConfig";
import { UserSave } from "./components/UserSave";
import { Serializable } from "../filesystem/Types";

export default class CoinUser implements Serializable<UserSave> {
    private id: string;
    private coins = {} as CoinState;
    private levelState = {} as LevelState;

    constructor(uc?: UserConfig) {
        if(uc) {
            this.id = uuidv4();
            this.coins.amount = uc.initAmount;
            this.coins.locked = 0;
            this.levelState = uc.levelState;
        }
    }

    serialize(): UserSave {
        return { id: this.id, coins: this.coins, levelState: this.levelState };
    }

    deserialize(s: UserSave): boolean {
        this.coins = s.coins;
        this.id = s.id;
        this.levelState = s.levelState;
        return true;
    }

    setCoins(coins: number) {
        this.coins.amount = coins;
    }

    getId() {
        return this.id;
    }
}
