let action = null;

$('#form').on('submit', function (event) {
	event.preventDefault();

	let urlElement = $('#url');
	let mp3Element = $('#mp3');
	let mp4Element = $('#mp4');
	let formElement = $('#form');
	let checkboxElement = $('#advanced-box');

	mp3Element.addClass('disabled');
	mp4Element.addClass('disabled');
	checkboxElement.addClass('disabled');
	urlElement.prop('disabled', true);
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
				formElement.append(`
					<div style="margin-top: 20px" class="col s12 m8 offset-m2">
						<div id="video" class="card horizontal scale-transition scale-out">
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
								<div id="video-download-div" class="card-action hide">
									<a id="video-download-link">Download Video</a>
								</div>
							</div> 
						</div> 
						<div class="progress"> 
							<div id="loader" class="determinate" style="width: 0"></div> 
						</div> 
					</div>
				`);
				setTimeout(() => {$('#video').addClass('scale-in');}, 100);
				pollStatus(response.id);
			}
		}
	}).catch(console.error)
});

function pollStatus (id) {
	$.ajax({
		url: '/status',
		data: { id },
		method: 'POST'
	}).then(function (response) {
		if (!response) return;
		let loader = $('#loader');
		loader.css('width', response.percent + '%');
		if (response.percent >= 100) {
			setTimeout(() => {
				loader.parent().addClass('hide');
				$('#video-download-div').removeClass('hide');
			}, 500);
			$('#video-download-link').prop('href', '/download?id=' + id);
		} else {
			setTimeout(() => {
				pollStatus(id)
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