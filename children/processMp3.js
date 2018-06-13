// track progress with ffmpeg.on('progress', (progress) => { progress.percent })
// process.argv[2]
if (!process.argv[2]) return;

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

let stream = ytdl(process.argv[2], { quality: 'highestaudio' });
let duration;

ffmpeg(stream)
	.audioBitrate(128)
	.save(`${__dirname}/../temp/${process.argv[3]}.mp3`)
	.on('stderr', line => {
		if (line.trim().startsWith('Duration')) {
			let thingy = line.trim().match(/Duration: ([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{2})/);
			duration = thingy[1] + thingy[2] + thingy[3];
		} else if (line.startsWith('size=')) {
			let thingy = line.match(/time=([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{2})/);
			let total = thingy[1] + thingy[2] + thingy[3];
			let percent = ((total / duration) * 100).toFixed(0);
			process.send(percent);
		}
	});
	/*.on('progress', progress => {
		console.log(progress.percent);
		process.send(progress.percent);
	});*/