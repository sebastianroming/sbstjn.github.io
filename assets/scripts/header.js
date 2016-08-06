$(document).ready(function() {
	var hasChangedWrapper = false
		, hasChangedTagLine = false
		, maxSize = $(window).height()
		, tagSize = $('.about-tagline').outerHeight()
		, isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
		
	if ($('.about-slider').length == 1) {
		maxSize = $('.about-slider').height();
	}
	
	window.requestAnimationFrame(function draw(timestamp) {
		var pos = parseInt($(window).scrollTop(), 10);
		
		if (!hasChangedWrapper && pos > maxSize/2) {
			$('.wrapper-responive').addClass('fix');
			hasChangedWrapper = true;
		}
		
		if (hasChangedWrapper && pos < maxSize/2) {
			$('.wrapper-responive').removeClass('fix');
			hasChangedWrapper = false;
		}
		
		if (!isTouch && !hasChangedTagLine && pos >= (maxSize - tagSize)) {
			$('.about-tagline').addClass('fix');
			hasChangedTagLine = true;
		}
		
		if (!isTouch && hasChangedTagLine && pos < (maxSize - tagSize)) {
			$('.about-tagline').removeClass('fix');
			hasChangedTagLine = false;
		}
			
	  window.requestAnimationFrame(draw);
	});
});