$(function () {
  var $toggle = $('#nav-toggle');
  var $menu = $('#nav-menu');
  let userSearch = $('.user-search-input');

  $toggle.click(function () {
    $(this).toggleClass('is-active');
    $menu.toggleClass('is-active');
  });

  userSearch.on('input', function () {
    let input = $(this).val();
    if (input.length >= 2) {
      axios.get('/profile/search/' + input).then(response => {
        console.log(response);
      });
    }
  });
});
  