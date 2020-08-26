import { StringMap } from "../../Types";

export default class Service {
    private name: string;

    calls: StringMap<GeneralServiceFunction>;

    constructor(name: string) {
        this.calls = {};
        this.name = name;
    }

    get Name() {
        return this.name;
    }

    call(serviceCall: keyof ServiceCalls, ...args: object[]) {
        try {
            return this.calls[serviceCall](...args);
        } catch (err) {
            console.log("Error in Service '" + name + "'");
            console.error(err);
            return null;
        }
    }

    set(serviceCall: keyof ServiceCalls, func: GeneralServiceFunction) {
        this.calls[serviceCall] = func;
    }

    has(key: string) {
        return this.calls[key] !== undefined;
    }
}

export type GeneralServiceFunction = (...args: any[]) => any;

interface ServiceCalls extends StringMap<GeneralServiceFunction> {
    main: GeneralServiceFunction;
}
