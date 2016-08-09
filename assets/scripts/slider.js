domready(function() {
  var photoLabels = ['one', 'two', 'three', 'four', 'five', 'six'];
	var allImagesInSlider = Array.from(document.querySelectorAll('.about-images li'));
	var slider = document.querySelector('.about-slider');
	var teaser = document.querySelector('.about-teaser');
	
	if (allImagesInSlider.length === 0) {
		return;
	}

  var getCurrentPhoto = function() {
    var hash = location.hash;

    if (hash.indexOf('#photo-') > -1) {
      return photoLabels.indexOf(hash.substr(7));
    } else {
      return 0;
    }
  };

  var showPhoto = function(next, init) {
    slider.setAttribute('data-position', next);
		location.hash = '#photo-' + photoLabels[next];
		
		allImagesInSlider.map(
			function(el) {
    		el.style.transform = 'translateX(' + (-1 * 100 * next) + '%)';
    	}
		);
		
		if (init) {
	    setTimeout(function() {
		    teaser.classList.add('init');
	    }, 25);  
		}
  };
	
	slider.addEventListener("click", function(e) {
		e.preventDefault();
		
		if (e.target && e.target.nodeName == "A") {
	    var pos = parseInt(slider.getAttribute('data-position'), 10)
				, dir = parseInt(e.target.getAttribute('data-move'), 10);

	    if ((pos == 0 && dir == -1) || (pos == (allImagesInSlider.length - 1) && dir == 1)) {
	      return;
	    } else {
	    	showPhoto(pos + dir);
	    }
		}
	});
	
	showPhoto(getCurrentPhoto(), true);
		
  new Hammer(teaser).on("swipe", function(ev) {
		document.querySelector('.about-slider a[data-move="' + (ev.velocityX > 0 ? '-1' : '1') + '"]').click();
  });
});
