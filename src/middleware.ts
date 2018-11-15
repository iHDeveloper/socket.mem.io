import { MemoryKeyReader, MemoryManager } from "./memory";

export class Middleware {
    private memoryManager: MemoryManager;
    private memoryKeyReader: MemoryKeyReader;

    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
        this.memoryKeyReader = new MemoryKeyReader();
    }

    public isKey(content: any[] | string): boolean {
        let contentAsString: string;
        if (typeof content === typeof String) {
            contentAsString = content as string;
        } else {
            contentAsString = "" + content;
        }
        if (contentAsString.startsWith("0x")) {
            const key: string = contentAsString.substr(3).replace("-", "");
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

    public loadKey(content: any[] | string): string {
        if (typeof content === typeof String) {
            if (this.isKey(content as string)) {
                return content as string;
            }
        }
        const contentAsString: string = "" + content;
        let uuid = require("uuid/v3");
        const namespace = "1b671a64-40d5-491e-99b0-da01ff1f3341";
        const key = "0x" + (uuid(contentAsString, namespace) as string).replace("-", "");
        uuid = undefined;
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
