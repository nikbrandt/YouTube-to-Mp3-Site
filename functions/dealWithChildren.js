const processMp3 = require('../children/processMp3');
const processMp4 = require('../children/processMp4');
const processPlaylist = require('../children/processPlaylist');
const { fork } = require('child_process');

const processes = new Map();
const titles = new Map();

module.exports = {
	getStatus: (id) => {
		return {
			percent: processes.get(id)
		};
	},
	getFileName: (id) => {
		let obj = titles.get(id);
		if (!obj) return undefined;
		return obj.title.replace(/[^A-z0-9 \-()\[\]]/g, '_') + obj.suffix;
	},
	remove: id => {
		if (titles.has(id)) titles.delete(id);
	},
	process: (type, videoType, id, processID, title) => {
		console.log(`processing ${type} with video type ${videoType} with id ${id} with PID ${processID} with title ${title}`);
		if (type === 'video') {
			if (videoType === 'mp4') {
				let child = fork(`${__dirname}/../children/processMp4.js`, [ id, processID ]);
				titles.set(processID, { title, suffix: '.mp4' });

				child.on('message', message => {
					processes.set(processID, message);
				});
			} else if (videoType === 'mp3') {
				let child = fork(`${__dirname}/../children/processMp3.js`, [ id, processID ]);
				titles.set(processID, { title, suffix: '.mp3' });

				child.on('message', message => {
					processes.set(processID, message);
				});
			}
		}
	}
};