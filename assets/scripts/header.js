domready(function() {
	var hasChangedWrapper = false
		, hasChangedTagLine = false
		, maxSize = window.innerHeight
		, tagSize = document.querySelector('.about-tagline').offsetHeight
		, isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
		
	if (document.querySelector('.about-slider')) {
		maxSize = document.querySelector('.about-slider').offsetHeight;
	}
	
	window.requestAnimationFrame(function draw(timestamp) {
		var pos = parseInt(document.body.scrollTop, 10);
		
		if (!hasChangedWrapper && pos > maxSize/2) {
			document.querySelector('.wrapper-responive').classList.add('fix');
			hasChangedWrapper = true;
		}
		
		if (hasChangedWrapper && pos < maxSize/2) {
			document.querySelector('.wrapper-responive').classList.remove('fix');
			hasChangedWrapper = false;
		}
		
		if (!isTouch && !hasChangedTagLine && pos >= (maxSize - tagSize)) {
			document.querySelector('.about-tagline').classList.add('fix');
			hasChangedTagLine = true;
		}
		
		if (!isTouch && hasChangedTagLine && pos < (maxSize - tagSize)) {
			document.querySelector('.about-tagline').classList.remove('fix');
			hasChangedTagLine = false;
		}
			
	  window.requestAnimationFrame(draw);
	});
});