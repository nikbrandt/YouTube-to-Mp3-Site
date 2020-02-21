let action = null;

var ID = function () {
	return '_' + Math.random().toString(36).substr(2, 9);
};

$('#form').on('submit', function (event) {
	event.preventDefault();

	let urlElement = $('#url');
	let mp3Element = $('#mp3');
	let mp4Element = $('#mp4');
	let formElement = $('#form');
	let checkboxElement = $('#advanced-box');

	// mp3Element.addClass('disabled');
	mp4Element.addClass('disabled');
	checkboxElement.addClass('disabled');
	urlElement.prop('disabled', false);
	urlElement.removeClass('invalid');

	let data = {
		url: urlElement.val(), action, advanced: checkboxElement.is(':checked')
	};

	$.ajax({
		url: '/',
		data: data,
		method: 'POST'
	}).then(function (response) {
		if (response.status === 'invalid') {
			urlElement.addClass('validate invalid');
			mp3Element.removeClass('disabled');
			mp4Element.removeClass('disabled');
			checkboxElement.removeClass('disabled');
			urlElement.prop('disabled', false);
		} else if (response.status === 'processing') {
			if (response.type === 'video') {
				let htmlUUID = ID();

				formElement.append(`
					<div style="margin-top: 20px" class="col s12 m8 offset-m2">
						<div id="video${htmlUUID}" class="card horizontal scale-transition scale-out">
							<div class="card-image">
								<a href="${response.info.url}" target="_blank">
									<img src="${response.info.thumbnail}"> 
								</a> 
							</div> 
							<div class="card-stacked"> 
								<div class="card-content"> 
									<p> 
										<b>${response.info.title}</b><br/>
										By <a href="${response.info.authorURL}">${response.info.author}</a><br/>
										Length: ${response.info.length}
									</p> 
								</div> 
								<div id="video-download-div${htmlUUID}" class="card-action hide">
									<a id="video-download-link${htmlUUID}">Download Video</a>
								</div>
							</div> 
						</div> 
						<div class="progress"> 
							<div id="loader${htmlUUID}" class="determinate" style="width: 0"></div> 
						</div> 
					</div>
				`);
				setTimeout(() => {$(`#video${htmlUUID}`).addClass('scale-in');}, 100);
				pollStatus(response.id, htmlUUID);
			}
		}
	}).catch(console.error)
});

function pollStatus (id, htmlUUID) {
	$.ajax({
		url: '/status',
		data: { id },
		method: 'POST'
	}).then(function (response) {
		if (!response) return;
		let loader = $(`#loader${htmlUUID}`);
		loader.css('width', response.percent + '%');
		if (response.percent >= 100) {
			setTimeout(() => {
				loader.parent().addClass('hide');
				$(`#video-download-div${htmlUUID}`).removeClass('hide');
			}, 500);
			$(`#video-download-link${htmlUUID}`).prop('href', '/download?id=' + id);
		} else {
			setTimeout(() => {
				pollStatus(id, htmlUUID);
			}, 1000);
		}
	}).catch(console.error)
}

$('#mp3').click(function () {
	action = 'mp3';
});

$('#mp4').click(function () {
	action = 'mp4';
});