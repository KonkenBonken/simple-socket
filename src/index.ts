import express, { Express, Application, Request, Response } from 'express';
import { nanoid as newId } from 'nanoid'

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { Socket } from './socket.js';

export const app: Application = express();
export default app;

Socket.setApp(app);

const onlineSockets = new Map<string, Socket>();

app.use(express.json());

app.get('/socket/script.js', (req: Request, res: Response) =>
  res.download(__dirname + '/client.js')
)

interface options {
  pingInterval?: number
}

app.post('/socket/init/', (req: Request, res: Response) => {
  const id = newId();
  const socket = new Socket(id, req.body);


  onlineSockets.set(id, socket);
  res.json({ id, options: socket.options });
  console.log(onlineSockets);
})

app.post('/socket/reinit/', (req: Request, res: Response) => {
  const [id, options]: [string, options] = req.body;
  const socket = new Socket(id, options);


  onlineSockets.set(id, socket);
  res.status(204).end();
  console.log(onlineSockets);
})

app.post('/socket/', (req: Request, res: Response) => {
  // @ts-expect-error
  const id: string = req.headers['socket-id'];

  if (!onlineSockets.has(id)) throw 'socket not found';
  const socket = onlineSockets.get(id) as Socket;

  if (req.body && Object.keys(req.body).length !== 0) { // if sent from client
    const [eventName, body]: [string, any] = req.body;

    console.log([eventName, body]);

    socket.emit(eventName, body, (...a) => res.status(200).json(a));
  } else // if poll
    socket.runningPoll = {
      res,
      timeout: setTimeout(() => {
        // @ts-expect-error
        socket.runningPoll.res.status(204).end();
        socket.runningPoll = undefined;
      }, socket.options.pingInterval)
    }
})
