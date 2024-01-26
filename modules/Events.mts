export default Object.freeze(class Events {
    #callbacks = new Map<string, Set<Function>>();
    static #instance = new Events();

    constructor() {
        Object.freeze(this);
    }

    static count(name: string): number { return this.#instance.count(name); }
    count(name: string): number { return this.#callbacks.get(name)?.size ?? 0; }

    static dispatch(name: string, ...args: any[]): number { return this.#instance.dispatch(name, args); }
    dispatch(name: string, ...args: any[]): number {
        const callbacks = this.#callbacks.get(name);
        if (callbacks == null) return 0;
        args = args[0];
        let count = 0;

        for (let callback of callbacks) {
            callback(...args);
            count++;
        }
        return count;
    }

    static register(name: string, callback: Function): boolean { return this.#instance.register(name, callback); }
    register(name: string, callback: Function): boolean {
        const callbacks = this.#callbacks.get(name) ?? new Set<Function>();
        this.#callbacks.set(name, callbacks);
        
        if (callbacks.has(callback)) return false;
        else callbacks.add(callback);
        return true;
    }

    static unregister(name: string, callback?: Function|null): number { return this.#instance.unregister(name, callback); }
    unregister(name: string, callback?: Function|null): number {
        const callbacks = this.#callbacks.get(name);
        let count = 0;

        if (callbacks == null) count = 0;
        else if (callback === undefined) {
            count = callbacks.size;
            callbacks.clear();
        }
        else if (callback === null)
            for (let callback of callbacks)
                if (!callback.name && callbacks.delete(callback)) count++;
        else count = callbacks.delete(callback) ? 1 : 0;
        return count;
    }
});