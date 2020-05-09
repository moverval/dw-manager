import { CoinState } from "../CoinSystem";
import { SerializeValue } from "../../filesystem/Types";

export interface UserSave extends SerializeValue {
    coins: CoinState;
    id: string;
}
