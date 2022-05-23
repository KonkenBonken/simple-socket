let socket;
SimpleSocket({}, s => {
	socket = s;
	console.log(socket)
	socket.send('add', [1, 2], (a, even) => console.log(a, 'is ' + even));
	socket.on('serverdata', console.log)
})