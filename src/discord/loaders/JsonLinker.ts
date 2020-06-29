import Linker from "./Linker";
import DocumentationObject from "../abstract/DocumentationObject";
import { StringMap } from "../../Types";
import LoadingComponent from "./LoadingComponent";
import DataPoint from "../../filesystem/DataPoint";

export default class JsonLinker<T> extends Linker<T> {
    value: T;
    private loadingComponents: LoadingComponent[];

    constructor(fileRoot: DataPoint, path: string) {
        super(fileRoot.parse(path));
        this.loadingComponents = [];
    }

    save(): void {
        this.write(JSON.stringify(this.value));
    }

    parse(value: string): boolean {
        this.value = JSON.parse(value);
        this.loadingComponents.forEach(lc => lc.parse());
        return true;
    }

    addLoadingComponent(loadingComponent: LoadingComponent) {
        this.loadingComponents.push(loadingComponent);
    }
}

export type DocumentationLinker = JsonLinker<StringMap<DocumentationObject>>;
