import fs from "fs";

export default abstract class Linker<T> {
    path: string;
    abstract value: T;

    constructor(path: string) {
        this.path = path;
    }

    load() {
        const value = fs.readFileSync(this.path, "utf-8");
        this.parse(value);
    }

    protected write(value: string) {
        fs.writeFileSync(this.path, value, "utf-8");
    }

    sourceVisible() {
        return fs.existsSync(this.path);
    }

    abstract save(): void;
    abstract parse(value: string): boolean;
}
