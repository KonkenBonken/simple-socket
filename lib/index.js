import express from 'express';
import { nanoid as newId } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { Socket } from './socket.js';
export const app = express();
export default app;
Socket.setApp(app);
const onlineSockets = new Map();
app.use(express.json());
app.get('/socket/script.js', (req, res) => res.download(__dirname + '/client.js'));
app.post('/socket/init/', (req, res) => {
    const id = newId();
    const socket = new Socket(id, req.body);
    onlineSockets.set(id, socket);
    res.json({ id, options: socket.options });
    console.log(onlineSockets);
});
app.post('/socket/reinit/', (req, res) => {
    const [id, options] = req.body;
    const socket = new Socket(id, options);
    onlineSockets.set(id, socket);
    res.status(204).end();
    console.log(onlineSockets);
});
app.post('/socket/', (req, res) => {
    // @ts-expect-error
    const id = req.headers['socket-id'];
    if (!onlineSockets.has(id))
        throw 'socket not found';
    const socket = onlineSockets.get(id);
    if (req.body && Object.keys(req.body).length !== 0) { // if sent from client
        const [eventName, body] = req.body;
        console.log([eventName, body]);
        socket.emit(eventName, body, (...a) => res.status(200).json(a));
    }
    else // if poll
        socket.runningPoll = {
            res,
            timeout: setTimeout(() => {
                // @ts-expect-error
                socket.runningPoll.res.status(204).end();
                socket.runningPoll = undefined;
            }, socket.options.pingInterval)
        };
});
