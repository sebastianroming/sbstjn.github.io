$(document).ready(function() {
  var photoLabels = ['one', 'two', 'three', 'four', 'five', 'six'];

  var getPhotoMappingReverse = function(name) {
    return photoLabels.indexOf(name);
  };

  var getPhotoMapping = function(index) {
    return photoLabels[index];
  };

  var getCurrentPhoto = function() {
    var hash = location.hash;

    if (hash.indexOf('#photo-') > -1) {
      return getPhotoMappingReverse(hash.substr(7));
    } else {
      return 0;
    }
  };

  var showPhoto = function(next, init) {
    $('.about-slider').attr('data-position', next);
    $('.about-images li').css('transform', 'translateX(' + (-1 * 100 * next) + '%)');

    if (init) {
      setTimeout(function() {
        $('.about-images li').addClass('init')
      }, 25);
    }

    location.hash = '#photo-' + getPhotoMapping(next);
  };

  $('.about-slider').on('click', 'a', function(event) {
    event.preventDefault();

    var $container = $('.about-slider')
      , pos = parseInt($container.attr('data-position'), 10)
      , dir = parseInt($(event.currentTarget).data('move'), 10)
      , max = $('.about-images li').length
      , next = null;

    if (
      (pos == 0 && dir == -1) ||
      (pos == (max - 1) && dir == 1)
    ) {
      return;
    }

    showPhoto(pos + dir);
  });
	
	if ($('.about-teaser').length === 1) {
		showPhoto(getCurrentPhoto(), true);
			
	  var mc = new Hammer($('.about-teaser')[0]);
	  mc.on("swipe", function(ev) {
	    $('.about-slider a[data-move="' + (ev.velocityX > 0 ? '-1' : '1') + '"]').click();
	  });
	}
});
