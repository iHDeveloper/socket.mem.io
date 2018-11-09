import { EventEmitter } from "events";
import * as SocketIO from "socket.io";

export class Server {
    public readonly options: ServerOptions;
    private server: SocketIO.Server;
    private emitter: EventEmitter;

    constructor(srv?: any, options?: ServerOptions) {
        if (options === undefined) {
            this.options = new ServerOptions();
        } else {
            this.options = options;
        }
        this.server = SocketIO.default(srv, this.options);
        this.emitter = new EventEmitter();
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
        this.server.on(event, (args: any) => {
            this.emitter.emit(event, args);
        });
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
