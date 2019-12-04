const ytdl = require('ytdl-core');
const { playlistInfo } = require('youtube-playlist-info');
const config = require('../config.json');

function secSpread(sec) {
	let hours = Math.floor(sec / 3600);
	let mins = Math.floor((sec - hours * 3600) / 60);
	let secs = sec - (hours * 3600 + mins * 60);
	return {
		h: hours,
		m: mins,
		s: secs
	}
}

function getInfo (type, url) {
	return new Promise (async (resolve, reject) => {
		if (type === 'video') {
			let info;

			try {
				info = await ytdl.getInfo(url)
			} catch (e) {
				return reject(e);
			}

			if (!info) return reject();
			if (info.livestream) return reject();

			let secObj = secSpread(info.length_seconds);

			resolve({
				title: info.title,
				url: 'https://youtu.be/' + url,
				author: info.author.name,
				authorURL: info.author.channel_url,
				length: `${secObj.h ? `${secObj.h}h ` : ''}${secObj.m ? `${secObj.m}m ` : ''}${secObj.s}s`,
				thumbnail: info.thumbnail_url || info.player_response.videoDetails.thumbnail.thumbnails[0].url
			})
		} else if (type === 'playlist') {
			playlistInfo(config.youtubeKey, url, items => {
				console.log(items);

				resolve({
					length: items.length,
					items
				})
			});
		} else resolve(undefined);
	});
}

module.exports = getInfo;
