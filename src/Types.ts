export interface StringMap<T> {
    [key: string]: T;
}

export interface NumberMap<T> {
    [key: number]: T;
}

export interface Unloadable {
    unload(): void;
}
