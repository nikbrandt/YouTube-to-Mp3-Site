if (!process.argv[2]) return;

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

let stream = ytdl(process.argv[2], { itag: 22 });
let duration;

console.log('got to processing, with id ' + process.argv[2])

ffmpeg(stream)
	.save(`${__dirname}/../temp/${process.argv[3]}.mp4`)
	.on('stderr', line => {
		if (line.trim().startsWith('Duration')) {
			let thingy = line.trim().match(/Duration: ([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{2})/);
			duration = thingy[1] + thingy[2] + thingy[3];
		} else if (line.startsWith('frame=')) {
			let thingy = line.match(/time=([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{2})/);
			let total = thingy[1] + thingy[2] + thingy[3];
			let percent = ((total / duration) * 100).toFixed(0);
			process.send(percent);
		}
	});