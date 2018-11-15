import { EventEmitter } from "events";
import * as SocketIO from "socket.io";
import { MemoryKeyModule, MemoryKeyReader, MemoryManager } from "./memory";
import { Middleware } from "./middleware";
import { Until } from "./until";

export class Server extends Until {
    public readonly options: ServerOptions;
    public middleware: Middleware;
    public memoryManager: MemoryManager;
    private server: SocketIO.Server;
    private emitter: EventEmitter;
    private eventsArray: string[];

    constructor(srv?: any, options?: ServerOptions) {
        super();
        if (options === undefined) {
            this.options = new ServerOptions();
        } else {
            this.options = options;
        }
        this.memoryManager = new MemoryManager();
        this.middleware = new Middleware(this.memoryManager);
        this.server = SocketIO.default(srv, this.options);
        this.emitter = new EventEmitter();
        this.eventsArray = [];
    }

    public listen(port?: number): void {
        if (port === undefined) {
            port = this.options.port;
        } else {
            this.options.port = port;
        }
        this.server.listen(port, this.options);
    }

    public emit(event: string, ...args: any[]): this {
        this.emitter.emit(event, args);
        return this;
    }

    public on(event: string, listener: (...args: any[]) => void): this {
        this.emitter.on(event, listener);
        const exist: boolean = this.has(this.eventsArray, event);
        if (!exist) {
            if (event === "connection") {
                this.server.on(event, (socketIO: SocketIO.Socket) => {
                    const socket: Socket = new Socket(this, socketIO);
                    this.emitter.emit(event, socket);
                });
            } else {
                this.server.on(event, (args: any) => {
                    this.emitter.emit(event, args);
                });
            }
            this.eventsArray.push(event);
        }
        return this;
    }
}

export class Socket extends Until {
    private server: Server;
    private socket: SocketIO.Socket;
    private emitter: EventEmitter;
    private eventsArray: string[];

    constructor(server: Server, socket: SocketIO.Socket) {
        super();
        this.server = server;
        this.socket = socket;
        this.emitter = new EventEmitter();
        this.eventsArray = [];
    }

    public emit(event: string, ...args: any[]): this {
        const content: string = "" + args;
        const middleware: Middleware = this.server.middleware;
        const loadedKey: string = middleware.loadKey(content);
        if (middleware.isKey(loadedKey)) {
            if (middleware.isKnownForSocket(this.socket.id, loadedKey)) {
                this.socket.emit(event, loadedKey);
            } else {
                this.socket.emit(event, args);
                const memoryKeyReader: MemoryKeyReader = new MemoryKeyReader();
                memoryKeyReader.read(this.server.memoryManager.remember(loadedKey));
                memoryKeyReader.add(this.socket.id);
                const data: string = memoryKeyReader.write();
                memoryKeyReader.close();
                this.server.memoryManager.remember(loadedKey, data);
            }
        } else {
            this.socket.emit(event, args);
            const memoryKeyReader: MemoryKeyReader = new MemoryKeyReader();
            const module: MemoryKeyModule = new MemoryKeyModule();
            module.content = "" + args;
            module.ids = [];
            memoryKeyReader.read(JSON.stringify(module));
            memoryKeyReader.add(this.socket.id);
            const data: string = memoryKeyReader.write();
            memoryKeyReader.close();
            this.server.memoryManager.remember(loadedKey, data);
        }
        this.socket.emit(event, args);
        return this;
    }

    public on(event: string, listener: (...args: any[]) => void): this {
        this.emitter.on(event, listener);
        const exist: boolean = this.has(this.eventsArray, event);
        if (!exist) {
            this.socket.on(event, (args: any[]) => {
                const content: string = "" + args;
                const middleware: Middleware = this.server.middleware;
                const loadedKey: string = middleware.loadKey(content);
                if (middleware.isKey(loadedKey)) {
                    const memoryKeyReader: MemoryKeyReader = new MemoryKeyReader();
                    memoryKeyReader.read(this.server.memoryManager.remember(loadedKey));
                    const contentFromMemory: string | undefined = memoryKeyReader.content;
                    memoryKeyReader.close();
                    if (contentFromMemory === undefined) {
                        this.emitter.emit(event, args);
                    }
                    this.emitter.emit(event, contentFromMemory);
                } else {
                    this.emitter.emit(event, args);
                    const module: MemoryKeyModule = new MemoryKeyModule();
                    module.ids = [];
                    module.content = content;
                    const memoryKeyReader: MemoryKeyReader = new MemoryKeyReader();
                    memoryKeyReader.read(JSON.stringify(module));
                    memoryKeyReader.add(this.socket.id);
                    const data: string = memoryKeyReader.write();
                    memoryKeyReader.close();
                    this.server.memoryManager.remember(loadedKey, data);
                }
                this.emitter.emit(event, args);
            });
            this.eventsArray.push(event);
        }
        return this;
    }
}

export class ServerOptions implements SocketIO.ServerOptions {
    public port: number = 8000;
    public path: string = "/socket.io";
    public serveClient: boolean = true;
    public adapter: SocketIO.Adapter | undefined;
    public origins: string|string[] = "*:*";
    public pingTimeout: number = 60 * 1000;
    public pingInterval: number = 25 * 1000;
    public maxHttpBufferSize: number = 10E7;
    public transports: string[] = ["polling", "websocket"];
    public allowUpgrades: boolean = true;
    public perMessageDeflate: object | boolean = true;
    public httpCompression: object | boolean = true;
    public cookie: string | boolean = "io";
}
