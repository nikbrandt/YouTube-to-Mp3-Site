const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');

fs.readdir(__dirname + '/temp', (err, files) => {
	if (err) console.error(err);
	files.forEach(f => {
		fs.unlink(__dirname + '/temp/' + f, err => {
			if (err) console.error(err);
		});
	});
});

const app = express();

const validateURL = require('./functions/validateURL');
const getInfo = require('./functions/getInfo');
const dealWithChildren = require('./functions/dealWithChildren');

app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/download', (req, res) => {
	let filename = dealWithChildren.getFileName(req.query.id);
	if (!filename) {
		res.status(404);
		return res.sendFile(__dirname + '/index.html');
	}
	let suffix = filename.substr(filename.length - 4);
	res.download(__dirname + '/temp/' + req.query.id + suffix, dealWithChildren.getFileName(req.query.id), (err) => {
		if (err) return;
		dealWithChildren.remove(req.query.id);
		fs.unlink(__dirname + '/temp/' + req.query.id + suffix, err => {
			if (err) console.error(err);
		});
	});
});

app.post('/status', (req, res) => {
	let { id } = req.body;
	res.send(dealWithChildren.getStatus(id))
});

app.post('/', async (req, res) => {
	let urlObject = validateURL(req.body.url);
	console.log(req.body);
	if (!urlObject) return res.send({ status: 'invalid' });

	let id = crypto.randomBytes(13).toString('hex');
	let info;

	try {
		info = await getInfo(urlObject.type, urlObject.id)
	} catch (e) {
		return res.send({status: 'invalid'});
	}

	if (!info) return res.send({status: 'invalid'});

	let importantInfo = urlObject.type === 'video' ? info : info.length;

	res.send({
		status: 'processing',
		type: urlObject.type,
		info: importantInfo,
		id
	});

	console.log(req.body);

	dealWithChildren.process(urlObject.type, req.body.action, urlObject.id, id, info.title);
});

app.listen(80, () => {console.log('Server up on port 80.')});