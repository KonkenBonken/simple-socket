import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(
	import.meta.url));

import app from '../lib/index.js';

const port = 80;

app.get('/', (req, res) => {
	res.send(`<html><head>
      <script src="/socket/script.js" charset="utf-8"></script>
      <script src="/client.js" charset="utf-8" async></script>
      <style>body{background:#444}</style>
    </head><body>Hello World</body></html>`)
})
app.get('/client.js', (req, res) => {
	res.download(__dirname + '/client.js')
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})

app.on('socket', socket => {
	console.log(socket);

	socket.on('add', (n, callback) => {
		console.log({ n });
		callback(n.reduce((a, b) => a + b), 'second argument to send')
	});

	setTimeout(() => {
		socket.send('serverdata', 'Hello');
	}, 3e3)
	setTimeout(() => {
		socket.send('serverdata', 'one');
		socket.send('serverdata', 'two');
		socket.send('serverdata', 'three');
	}, 6e3)
})