import { StringMap } from "../Types";
import { Serializable, SerializeValue } from "./Types";

interface SerializeData extends SerializeValue {
    data: StringMap<any>;
}

export default class SerializeObject implements Serializable<SerializeData> {
    data: StringMap<any>;

    constructor(data: StringMap<any>) {
        this.data = data;
    }

    serialize() {
        return { data: this.data };
    }

    deserialize(s: SerializeData) {
        this.data = s.data;
        return true;
    }
}
