import { Serializable, Serialized, SerializedValue, KeySerializable, SerializeValue } from "./Types";
import fs from "fs";

export default class Serializer {
    static writeObject<T extends SerializeValue>(path: string, s: Serializable<T>): Serialized<T> {
        const seralizeValue = s.serialize();
        fs.writeFileSync(path, JSON.stringify({ "*": seralizeValue }));
        return { path, key: "*" };
    }

    static writeObjects<T extends SerializeValue>(path: string, s: KeySerializable<T>[]): Serialized<T>[] {
        const serealizeValue: {
            [key: string]: Serializable<T>
        } = {};
        const serealizedArray: Serialized<T>[] = [];
        for(const serealizable of s) {
            serealizeValue[serealizable.key] = serealizable.serializable;
            serealizedArray.push({ path, key: serealizable.key });
        }
        fs.writeFileSync(path, JSON.stringify(serealizeValue));
        return serealizedArray;
    }

    static loadObjects<T extends SerializeValue>(s: Serialized<T>[]): T[] {
        const content: SerializedValue<T> = JSON.parse(fs.readFileSync(s[0].path, "utf-8"));
        const arr: T[] = [];
        for(const serialized of s) {
            arr.push(content[serialized.key]);
        }

        return arr;
    }

    static loadObject<T extends SerializeValue>(s: Serialized<T>): T {
        return this.loadObjects([s])[0];
    }

    static parseObject<T>(value: T, object: Serializable<T>): void {
        object.deserialize(value);
    }

    static makeKey<T>(path: string, key: string): Serialized<T> {
        return { path, key };
    }

    static makeKeySerializable<T>(key: string, serializable: Serializable<T>): KeySerializable<T> {
        return { key, serializable };
    }
}
