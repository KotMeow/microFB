$(function () {

  var socket = io();
  socket.emit('join');
  var friendlist = $('#friend-list');
  var noinvites = $('#no-invites');
  var notificationList = $("#notification-list");
  let checkInvites = function () {
    $(this).parents('li').fadeOut(300, function () {
      $(this.remove());
      if (notificationList.find("li").length === 0) $("#notification-list").append('<li id="no-invites">No invites</li>')
    });
  };
  $('#butt').on('click', () => {
    $('.notification-icon').addClass('animated bounce').css('color', '#00d1b2');
    // socket.emit('message', {
    //   age: 15
    // });
  });
  setInterval(function () {
    socket.emit('onlineUsers');
  }, 10000);

  notificationList.on('click', '.accept', function () {
    socket.emit('accept', $(this).data().username);
    checkInvites.call($(this));
  });

  notificationList.on('click', '.decline', function () {
    console.log($(this));
    socket.emit('decline', $(this).data().username);
    checkInvites.call($(this));
  });

  $('.notification-icon').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
    $('.notification-icon').removeClass('animated bounce');
  });
  $('#invite').on('click', function () {
    socket.emit('invite', $(this).data().username)
  });
  socket.on('message', function (data) {
    friendlist.append(`<li><div class="online">${data.init}</div><div>${data.name}</div></li>`);
  });
  socket.on('online', data => {
    $('#' + data.username).removeClass('offline').addClass('online');
  });
  socket.on('offline', data => {
    $('#' + data.username).removeClass('online').addClass('offline');
  });
  socket.on('onlineUsers', data => {
    friendlist.find('div.status').each((key,obj) => {
      $(obj).removeClass('online').addClass('offline');
    });
    data.forEach(value => {
      $('#' + value).removeClass('offline').addClass('online');
    })
  });
  socket.on('invite', data => {
    $('.notification-icon').addClass('animated wobble').css('color', '#00d1b2');
    if (noinvites) noinvites.remove();
    notificationList.append(`<li class="invite-content">${data.from} sent you an invite<a class="decline" data-username=${data.from}><span class="icon">
    <i class="fa fa-times"></i></span></a><a class="accept" data-username=${data.from}><span class="icon"><i class="fa fa-check"></i></span></a><hr/></li>`)
  });
  socket.on('accept', data => {
    console.log(data);
    friendlist.append(`<li><div class="online">${data.slice(0, 2).toUpperCase()}</div><div>${data}</div>
<span class="icon action-icons"><i class="fa fa-envelope-o"></i><a href="/profile/${data}"><i class="fa fa-user-o"></i></a></span></li>`);
  });
});