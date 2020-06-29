import Path from "path";

export default class DataPoint {
    path: string;

    constructor(path: string) {
        this.path = path;
    }

    parse(path: string): string {
        return Path.join(this.path, path);
    }
}

export type DataPointCollection = DataPoint[];
