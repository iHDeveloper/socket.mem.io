export class MemoryManager {
    private storeManager: StoreManager;

    constructor() {
        this.storeManager = new StoreManager();
    }

    public property(key: string, value?: any): this | any {
        return this.get("$" + key, value);
    }

    public remember(key: string, value?: any): this | any {
        return this.get("#", key, value);
    }

    private get(locate: string, key: string, value?: any): this | any {
        if (value) {
            this.storeManager.store(locate + key, value);
        } else {
            return this.storeManager.get(locate + key);
        }
        return this;
    }

}

export class StoreManager {
    private map: Map<string, any>;

    constructor() {
        this.map = new Map();
    }

    public store(key: string, value: any): this {
        this.map.set(key, value);
        return this;
    }

    public get(key: string): any | undefined {
        return this.map.get(key);
    }

}
