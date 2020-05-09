import { v4 as uuidv4 } from "uuid";
import { CoinState } from "./CoinSystem";
import { UserConfigInitializer, UserConfig } from "./CoinConfig";
import { UserSave } from "./components/UserSave";
import { Serializeable } from "../filesystem/Types";

export default class CoinUser implements Serializeable<UserSave> {
    private id: string;
    private coins = {} as CoinState;

    constructor(uc?: UserConfig) {
        if(uc) {
            this.id = uuidv4();
            this.coins.amount = uc.initAmount;
            this.coins.locked = 0;
        }
    }

    serialize(): UserSave {
        return { id: this.id, coins: this.coins };
    }

    deserialize(s: UserSave): boolean {
        this.coins = s.coins;
        this.id = s.id;
        return true;
    }

    getId() {
        return this.id;
    }
}
