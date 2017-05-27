$(function () {
  var $toggle = $('#nav-toggle');
  var $menu = $('#nav-menu');
  let userSearch = $('.user-search-input');
  let searchResult = $('#searchResult');
  let searchBox = $('.search-box');
  $toggle.click(function () {
    $(this).toggleClass('is-active');
    $menu.toggleClass('is-active');
  });

  userSearch.on('input', function () {
    let input = $(this).val();
    if (input.length >= 2) {
      axios.get('/profile/search/' + input).then(response => {
        searchResult.html('');
        if (response.data.length !== 0) {
          searchBox.show();
        }
        response.data.forEach(result => {
          searchResult.append(`<tr><td><a href="/profile/${result.username}">${result.username}</a></td><td><span id="invite" data-username=${result.username} style="margin-left: 10px"><i class="fa fa-user-plus fa-lg"></i></span></td></tr>`);
        });


      });
    } else {
      searchBox.hide();
    }
  });
  //     .focusout(function () {
  //   setTimeout(function () {
  //     searchResult.html('');
  //     searchBox.hide();
  //   }, 2000);
  // });
});
  