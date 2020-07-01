export default class Wrapper<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
    }
}
