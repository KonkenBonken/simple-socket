// This will run client-side

function post(path = '/socket', body?, socketID?) {
  return fetch(path, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'socket-id': socketID
    },
    body: body == null ? undefined : JSON.stringify(body)
  })
}

interface options {
  pingInterval?: number
}

class Socket {
  id?: string;
  options: options = {};
  private eventTargets: Map<string, Array<(...args: any) => void>> = new Map();
  private _online: boolean = false;

  constructor(id: string, options: options) {
    this.id = id;
    this.options = options;
    this.online = true;
  }

  private set online(value: boolean) {
    this._online = value;
    if (value)
      this.poll();
    else
      this.reconnect()
  }

  private async reconnect() {
    const res = await post('/socket/reinit/', [this.id, this.options], this.id)
      // @ts-expect-error
      .catch((): Response => ({ ok: false }));

    if (res.status == 204)
      this.online = true;
    else
      setTimeout(() => this.reconnect(), this.options.pingInterval);
  }


  private async emit(eventName: string, ...args) {
    if (!this.eventTargets.has(eventName))
      return;
    // @ts-expect-error
    for (const callback of this.eventTargets.get(eventName))
      await callback(...args)
  }


  private async poll() {
    const res = await post('/socket', null, this.id)
      // @ts-expect-error
      .catch((): Response => ({ ok: false }));

    if (!res.ok)
      return this.online = false;

    if (res.status === 200) {
      const [eventName, data]: [string, any] = await res.json();
      this.emit(eventName, data);
    }
    else if (res.status === 207) {
      const events: [string, any][] = await res.json();
      for (const [eventName, data] of events)
        this.emit(eventName, data);
    }
    this.poll();
  }

  on(eventName: string, callback: (...args: any) => void) {
    if (this.eventTargets.has(eventName))
      // @ts-expect-error
      this.eventTargets.get(eventName).push(callback);
    else
      this.eventTargets.set(eventName, [callback]);
    return this;
  }

  async send(eventName: string, data: any, callback?: (...args: any) => void) {
    const args: any[] = await post('/socket', [eventName, data], this.id)
      .then(res => res.json());

    if (callback)
      callback(...args);
    return args;
  }
}

function SimpleSocket(
  options: options = {},
  callback: (Socket) => void
): Promise<Socket> {
  const promise: Promise<Socket> = new Promise(async (resolve, reject) => {
    const { id, options: _options } = await post('/socket/init', options)
      .then(res => res.json());
    const socket: Socket = new Socket(id, _options);

    // @ts-expect-error
    SimpleSocket = undefined;
    resolve(socket);
  });

  if (callback)
    promise.then(callback)
  return promise;
};
