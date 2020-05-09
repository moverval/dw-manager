import CoinUser from "../CoinUser";
import { SerializeValue } from "../../filesystem/Types";
import { StringMap } from "../../Types";

export interface SystemSave extends SerializeValue {
    users: StringMap<CoinUser>;
    lastChange: Date;
}
