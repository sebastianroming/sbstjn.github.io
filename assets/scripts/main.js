$(document).ready(function() {
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

    $container.attr('data-position', next = pos + dir);
    $('.about-images li').css('transform', 'translateX(' + (-1 * 100 * next) + '%)');
  });

  $(document).bind('touchmove', function(e) {
     e.preventDefault();
  });
});
