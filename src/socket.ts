import { Application, Response } from 'express';
import { EventEmitter } from 'events';


export class Socket extends EventEmitter {
  static app: Application;
  static setApp(app: Application) {
    Socket.app = app;
  }

  id?: string;
  options = { pingInterval: 10000 };
  private _runningPoll?: { res: Response, timeout: NodeJS.Timeout };
  private eventQueue: [string, any][] = [];
  private sendGroupTimeout?: NodeJS.Timeout;

  constructor(id: string, options) {
    super();

    this.id = id;
    this.options = { ...this.options, ...options };

    Socket.app.emit('socket', this);
  }

  get runningPoll() { return this._runningPoll }
  set runningPoll(v) {
    if (this._runningPoll && v === undefined)
      // @ts-expect-error
      clearTimeout(this.runningPoll.timeout);
    this._runningPoll = v;
    this.sendQueue();
  }

  private sendQueue() {
    if (!this.sendGroupTimeout)
      this.sendGroupTimeout = setTimeout(() => {
        this._sendQueue()
        this.sendGroupTimeout = undefined;
      }, 100);
  }
  private _sendQueue() {
    if (!this.runningPoll || !this.eventQueue.length)
      return false;

    if (this.eventQueue.length == 1)
      this.runningPoll.res.status(200).json(this.eventQueue[0]);
    else
      this.runningPoll.res.status(207).json(this.eventQueue);

    this.eventQueue = [];
    this.runningPoll = undefined;
    return true;
  }

  async send(eventName: string, data: any) {
    this.eventQueue.push([eventName, data])
    console.log(this.eventQueue)
    this.sendQueue();
  }
}
