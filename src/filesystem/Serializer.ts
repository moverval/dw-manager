import { Serializeable, Serialized, SerializedValue, KeySerializeable } from "./Types";
import fs from "fs";

export default class Serializer {
    static writeObject<T>(path: string, s: Serializeable<T>): Serialized<T> {
        const seralizeValue = s.serialize();
        fs.writeFileSync(path, JSON.stringify({ "*": seralizeValue }));
        return { path, key: "*" };
    }

    static writeObjects<T>(path: string, s: KeySerializeable<T>[]): Serialized<T>[] {
        const serealizeValue: {
            [key: string]: Serializeable<T>
        } = {};
        const serealizedArray: Serialized<T>[] = [];
        for(const serealizeable of s) {
            serealizeValue[serealizeable.key] = serealizeable.serealizeable;
            serealizedArray.push({ path, key: serealizeable.key });
        }
        fs.writeFileSync(path, JSON.stringify(serealizeValue));
        return serealizedArray;
    }

    static loadObjects<T>(s: Serialized<T>[]): T[] {
        const content: SerializedValue<T> = JSON.parse(fs.readFileSync(s[0].path, "utf-8"));
        const arr: T[] = [];
        for(const serealized of s) {
            arr.push(content[serealized.key]);
        }

        return arr;
    }

    static loadObject<T>(s: Serialized<T>): T {
        return this.loadObjects([s])[0];
    }

    static parseObject<T>(value: T, object: Serializeable<T>): void {
        object.deserialize(value);
    }

    static makeKey<T>(path: string, key: string): Serialized<T> {
        return { path, key };
    }
}
