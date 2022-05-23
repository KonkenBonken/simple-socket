/// <reference types="node" />
import { Application, Response } from 'express';
import { EventEmitter } from 'events';
export declare class Socket extends EventEmitter {
    static app: Application;
    static setApp(app: Application): void;
    id?: string;
    options: {
        pingInterval: number;
    };
    private _runningPoll?;
    private eventQueue;
    private sendGroupTimeout?;
    constructor(id: string, options: any);
    get runningPoll(): {
        res: Response<any, Record<string, any>>;
        timeout: NodeJS.Timeout;
    } | undefined;
    set runningPoll(v: {
        res: Response<any, Record<string, any>>;
        timeout: NodeJS.Timeout;
    } | undefined);
    private sendQueue;
    private _sendQueue;
    send(eventName: string, data: any): Promise<void>;
}
