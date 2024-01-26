const GetTypeOfObject = (obj: any, cache: Map<any, string>, subtype?: string): string => {
    let type = subtype || (obj === null ? 'null' : typeof obj);
    switch(type) {
        case 'Array':
            if (obj.length == 0) return 'Array<undefined>';
            else if (cache.has(obj)) return cache.get(obj) || 'Array<any>';
            else cache.set(obj, 'Array<undefined>');

            type = GetTypeOfObject(obj[0], cache);
            if (!obj.every((o: any) => GetTypeOfObject(o, cache) == type)) type = 'any';
            cache.set(obj, type = `Array<${type}>`);
            return type;
        case 'function':
            const length = Object.keys(Object.getOwnPropertyDescriptors(obj)).length;

            if (length < 4) return 'function';
            else if (obj.name) return obj.name;
            else console.warn("bad argument #1 to 'object' (Unhandled 'function' type)");
            return type;
        case 'object':
            type = obj.constructor.name;
            if (type == 'object') return type;
            else return GetTypeOfObject(obj, cache, type); //subtype => Object, Array
        case 'Object':
            type = obj.toString().slice(8, -1);
            if (type == 'Object') type = 'object';
            return type;
        default:
            return type;
    }
}

export default Object.freeze(class TypeOf {
    static #instance = new TypeOf();
    #lastObjType: string = "";

    constructor() {
        Object.freeze(this);
    }

    static get lastObjType(): string { return this.#instance.lastObjType }
    get lastObjType(): string {
        return typeof this.#lastObjType == 'string' ? this.#lastObjType : '???';
    }

    static assert(data: Array<any>, types: Array<string>, max?: number) { return this.#instance.assert(data, types, max) }
    assert(data: Array<any>, types: Array<string>, max?: number) {
          if (!this.is(data, 'Array<any>')) throw new TypeError(`bad argument #1 to 'assert' (Array<any> expected, got ${this.lastObjType})`);
        else if (!this.is(types, 'Array<string>')) throw new TypeError(`bad argument #2 to 'assert' (Array<string> expected, got ${this.lastObjType})`);
        else if (!this.is(max, 'number|undefined')) throw new TypeError(`bad argument #3 to 'assert' (number expected, got ${this.lastObjType})`);
        else if (this.lastObjType == 'number') max = max as number;
        else max = types.length;

        if (max >= 0 && data.length > max) throw new RangeError(`bad argument #1 to 'assert' (expected ${max} args (max), got ${data.length})`);
        for (let i = 0; i < types.length; i++) {
            if (!this.is(data[i], types[i]))
                throw new TypeError(`bad argument #1[${i}] to 'assert' (${types[i]} expected, got ${this.lastObjType})`);
        }
    }

    static is(obj: any, is: string): boolean { return this.#instance.is(obj, is); }
    is(obj: any, is: string): boolean {
            if (typeof is != 'string') throw new TypeError(`bad argument #2 to 'is' (string expected, got ${typeof is})`);
            const type = this.object(obj);
            const types = is.split('|');

            for (let i = 0; i < types.length; i++)
                switch(types[i]) {
                    case 'Array<any>':
                        if (type.startsWith('Array<')) return true;
                        break;
                    default:
                        if (type == types[i]) return true;
                }
            return false;
    }

    static object(obj: any): string { return this.#instance.object(obj); }
    object(obj: any): string {
        this.#lastObjType = GetTypeOfObject(obj, new Map<any, string>());
        return this.lastObjType;
    }
});