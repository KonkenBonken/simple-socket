declare function post(path?: string, body?: any, socketID?: any): Promise<Response>;
interface options {
    pingInterval?: number;
}
declare class Socket {
    id?: string;
    options: options;
    private eventTargets;
    private _online;
    constructor(id: string, options: options);
    private set online(value);
    private reconnect;
    private emit;
    private poll;
    on(eventName: string, callback: (...args: any) => void): this;
    send(eventName: string, data: any, callback?: (...args: any) => void): Promise<any[]>;
}
declare function SimpleSocket(options: options | undefined, callback: (Socket: any) => void): Promise<Socket>;
