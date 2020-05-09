import { CoinState } from "../CoinSystem";
import { SerializeValue } from "../../filesystem/Types";
import { LevelState } from "../CoinConfig";

export interface UserSave extends SerializeValue {
    coins: CoinState;
    id: string;
    levelState: LevelState;
}
