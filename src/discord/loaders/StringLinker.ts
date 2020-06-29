import Linker from "./Linker";

export default class StringLinker extends Linker<string> {
    value: string;

    save(): void {
        this.write(this.value);
    }

    parse(value: string): boolean {
        this.value = value;
        return true;
    }
}
