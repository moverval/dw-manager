import CoinUser from "./CoinUser";
import { Serializable } from "../filesystem/Types"
import { SystemSave } from "./components/SystemSave";
import Serializer from "../filesystem/Serializer";
import { StringMap } from "../Types";

export default class Coinsystem implements Serializable<SystemSave> {
    private users: StringMap<CoinUser> = {};
    private lastChange: Date = new Date();
    private savePath: string;
    private changeNumber: NodeJS.Timeout;
    private changeWaitTime: number = 2e4;

    constructor(path: string) {
        this.savePath = path;
    }

    private registerChange() {
        this.lastChange = new Date();
        if(this.changeNumber) {
            clearTimeout(this.changeNumber);
        }
        this.changeNumber = setTimeout(() => {
            this.save();
        }, this.changeWaitTime);
    }

    save() {
        Serializer.writeObject(this.savePath, this);
    }

    addUser(cu: CoinUser) {
        this.users[cu.getId()] = cu;
        this.registerChange();
    }

    removeUser(cu: CoinUser) {
        this.removeUserById(cu.getId());
        this.registerChange();
    }

    removeUserById(cuid: string) {
        this.users[cuid] = undefined;
        this.registerChange();
    }

    serialize(): SystemSave {
        return { users: this.users, lastChange: this.lastChange }
    }

    deserialize(s: SystemSave): boolean {
        this.users = s.users;
        this.lastChange = s.lastChange;
        return true;
    }

    findUser(id: string) {
        return this.users[id];
    }
}

export interface CoinState {
    amount: number;
    locked: number;
}
