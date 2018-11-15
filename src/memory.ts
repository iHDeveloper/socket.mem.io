import { Until } from "./until";

export class MemoryKeyModule {
    public content: string | undefined;
    public ids: string[] | undefined;
}

export class MemoryKeyReader {
    public content: string | undefined;
    public ids: string[] | undefined;

    constructor(content?: string, ids?: string[]) {
        this.content = content;
        if (ids) {
            this.ids = ids;
        } else {
            this.ids = [];
        }
    }

    public read(jsonContent: string) {
        const jsonObject: MemoryKeyModule = JSON.parse(jsonContent);
        this.content = jsonObject.content;
        this.ids = jsonObject.ids;
    }

    public close() {
        this.content = undefined;
        this.ids = undefined;
    }

    public isClosed(): boolean {
        if (this.content === undefined || this.ids === undefined) {
            return true;
        }
        return false;
    }

    public has(id: string): boolean {
        if (this.isClosed()) {
            throw new Error("The memory key reader is closed!");
        }
        return Until.hasInArray(this.ids as string[], id);
    }

    public add(id: string): this {
        if (this.isClosed()) {
            throw new Error("The memory key reader is closed!");
        }
        (this.ids as string[]).push(id);
        return this;
    }

    public remove(id: string): this {
        if (this.isClosed()) {
            throw new Error("The memory key reader is closed!");
        }
        const ids: string[] = this.ids as string[];
        if (this.has(id)) {
            const index: number | undefined = Until.indexInArray(ids, id);
            if (index !== undefined) {
                ids.splice(index, 1);
            }
        }
        return this;
    }

    public write(): string {
        const module: MemoryKeyModule = new MemoryKeyModule();
        module.ids = this.ids;
        module.content = this.content;
        return JSON.stringify(module);
    }
}

export class MemoryManager {
    private storeManager: StoreManager;

    constructor() {
        this.storeManager = new StoreManager();
    }

    public has(key: string): boolean {
        return this.storeManager.has(key);
    }

    public remember(key: string, value?: any): this | any {
        return this.get("0x", key, value);
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

    public has(key: string): boolean {
        return this.map.has(key);
    }

}
