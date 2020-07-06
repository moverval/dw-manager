export default class Wrapper<T> {
    private Value: T;

    constructor(value: T) {
        this.Value = value;
    }

    get value(): T {
        return this.Value;
    }

    set value(value: T) {
        this.Value = value;
    }
}
