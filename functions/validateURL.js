const videoExpression = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-z0-9_-]{11})(&.*)?$/;
const playlistExpression = /^(https?:\/\/)?(www\.)?(youtube\.com\/)(watch\?v=[A-z0-9_-]{11}&list=|playlist\?list=)([A-z0-9_-]+)(&.*)?$/;

function validateURL (url) {
	if (!url) return undefined;

	if (videoExpression.test(url)) return {
		type: 'video',
		id: url.match(videoExpression)[4]
	};

	if (playlistExpression.test(url)) return {
		type: 'playlist',
		id: url.match(playlistExpression)[5]
	};

	return undefined;
}

module.exports = validateURL;