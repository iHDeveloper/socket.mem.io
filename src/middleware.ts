import { MemoryKeyReader, MemoryManager } from "./memory";

export class Middleware {
    private memoryManager: MemoryManager;
    private memoryKeyReader: MemoryKeyReader;

    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
        this.memoryKeyReader = new MemoryKeyReader();
    }

    public isKey(content: string): boolean {
        if (content.startsWith("0x")) {
            const key: string = content.substr(3).replace("-", "");
            const exist: boolean = this.memoryManager.has(key);
            if (exist) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public isKnownForSocket(id: string, key: string): boolean {
        if (!this.isKey(key)) {
            throw new Error("Middleware: Key is not exist! Check if it is exist.");
        }
        if (!this.memoryKeyReader.isClosed()) {
            throw new Error("The reader is being reading something else...");
        }
        let known: boolean = false;
        try {
            const data: string = this.memoryManager.remember(key);
            if (data === undefined) {
                throw new Error("Key with empty data");
            }
            this.memoryKeyReader.read(data);
            known = this.memoryKeyReader.has(id);
        } catch (e) {
            throw new Error("Failed to read memory key data Due to [ " + e + " ]");
        } finally {
            this.memoryKeyReader.close();
        }
        return known;
    }

    public loadKey(content: any[]): string {
        const contentAsString: string = "" + content;
        const uuid = require("uuid/v3");
        const namespace = "1b671a64-40d5-491e-99b0-da01ff1f3341";
        const key = uuid(contentAsString, namespace);
        return key;
    }

    public readKey(key: string): string | undefined {
        if (!this.isKey(key)) {
            throw new Error("Middleware: Key is not exist! Check if it is exist.");
        }
        if (!this.memoryKeyReader.isClosed()) {
            throw new Error("The reader is being reading something else...");
        }
        let content: string | undefined;
        try {
            const data: string = this.memoryManager.remember(key);
            if (data === undefined) {
                throw new Error("Key with empty data");
            }
            this.memoryKeyReader.read(data);
            content = this.memoryKeyReader.content;
        } catch (e) {
            content = undefined;
            throw new Error("Failed to read memory key data Due to [ " + e + " ]");
        } finally {
            this.memoryKeyReader.close();
        }
        return content;
    }

}
