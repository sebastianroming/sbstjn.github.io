domready(function() {
  var headlines = Array.prototype.slice.call(document.querySelectorAll('.post h2'))

  var html = [
    '<ul id="toc">',
    headlines.map(
      function (headline) {
        return '<li><a href="#' + headline.id + '">' + headline.innerHTML + '</a></li>'
      }
    ).join(''),
    '</ul>'
  ].join('')

  var tmp = document.createElement('div')
  tmp.innerHTML = html

  var paragraph = document.querySelectorAll('.post p,h2')[3];

  paragraph.parentNode.insertBefore(tmp.firstChild, paragraph)
});
