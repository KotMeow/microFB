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
          let appendResult = `<tr><td><a href="/profile/${result.user}">${result.user}</a></td>`;
          if (!result.isFriend) {
            appendResult += `<td><span id="invite" data-username=${result.user}><i class="fa fa-user-plus fa-lg search-result"></i></span>`;
          }
          appendResult += `</td></tr>`;
          searchResult.append(appendResult);
        });
      });
    } else {
      searchBox.hide();
    }
  });
});
  