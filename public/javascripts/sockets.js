$(function () {

  var socket = io();
  //socket.emit('join');

  let friendlist = $('#friend-list');
  let noinvites = $('#no-invites');
  let notificationList = $("#notification-list");
  let postButton = $('#sendPost');
  let postInput = $('.post-input');
  let postContainer = $('#posts-container');
  let postToUserButton = $('#sendPostToUser');
  let postToUserInput = $('.post-touser-input');
  let chatContainer = $('.chat-container');
  let openChatButton = $('.open-chat');
  let chatInput = $('.chat-input');
  let privateToAll = $('#private-to-all');

  friendlist.on('click', '.open-chat', function () {
    if ($('#chat-' + $(this).data().user).length > 0) {
      console.log('istnieje');
    } else {
      axios.post('/getchat', {user: $(this).data().user, userid: $(this).data().userid}).then(response => {
        chatContainer.prepend(response.data);
        let thisChat = $('.live-chat').first().find('.chat-history');
        thisChat.scrollTop(thisChat[0].scrollHeight);
      });
    }
  });
  privateToAll.on('click', function () {
    if ($('#chat-all').length > 0) {
      console.log('istnieje');
    } else {
      axios.post('/getchat', {user: "all"}).then(response => {
        chatContainer.prepend(response.data);
        let thisChat = $('.live-chat').first().find('.chat-history');
        thisChat.scrollTop(thisChat[0].scrollHeight);
      });
    }
  });


  socket.on('chatMessage', data => {
    let chatSelector = $('#chat-' + data.from);
    console.log(chatSelector.length);
    if (chatSelector.length > 0) {
      let thisChat = chatSelector.find('.chat-history');
      thisChat.append(`<div class="chat-message myMessage clearfix"><div class="chat-message-content clearfix"><h5>${data.from}</h5><p>${data.content}</p></div></div><hr/>`);
      let count = parseInt(chatSelector.find('.message-count').text());
      chatSelector.find('.message-count').text(count + 1);
      if (!chatSelector.find('.chat').is(':visible')) {
        chatSelector.find('.message-count').show();
      }

      thisChat.scrollTop(thisChat[0].scrollHeight);
    } else if ($('#chat-' + data.from).length === 0) {
      axios.post('/getchat', {user: data.from, userid: data.fromId}).then(response => {

        chatContainer.prepend(response.data);
        let thisChat = $('.live-chat').first().find('.chat-history');
        if (data.toAll) {
          thisChat.append(`<div class="chat-message myMessage clearfix"><div class="chat-message-content clearfix"><h5>${data.from}</h5><p>${data.content}</p></div></div><hr/>`);
        }
        thisChat.scrollTop(thisChat[0].scrollHeight);
      });
    }
  });

  $('.chat-container').on('keyup', '.chat-input', function (e) {
    if (e.keyCode === 13 && $(this).val().length > 0) {
      let thisChat = $('#chat-' + $(this).data().user).find('.chat-history');
      thisChat.append(`<div class="chat-message clearfix"><div class="chat-message-content clearfix"><h5>Me</h5><p>${$(this).val()}</p></div></div><hr/>`);
      thisChat.scrollTop(thisChat[0].scrollHeight);
      socket.emit('chatMessage', {content: $(this).val(), to: $(this).data().user, toid: $(this).data().userid});
      $(this).val('');
    }
  });
  $('#butt').on('click', () => {
    axios.get('/openChats').then(response => {
      console.log(response);
    });
  });
  //delete animation class for notifications

  $('.notification-icon').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
    $('.notification-icon').removeClass('animated bounce');
  });

  //check if there are any invitations, if not append 'not invites'
  let checkInvites = function () {
    $(this).parents('li').fadeOut(300, function () {
      $(this.remove());
      if (notificationList.find("li").length === 0) {
        $("#notification-list").append('<li id="no-invites">No invites</li>');
      }
    });
  };
  postContainer.on('click', '.like', function () {
    $(this).toggleClass('liked');
    axios.post('/like', {post: $(this).data().post}).then(response => {
      $(this).next().html(response.data.likes.length);
    });
  });
  postContainer.on('click', '.share', function () {
    socket.emit('sharePost', $(this).data().post);
    $('body').append(`<div class="animated fadeInLeft notification is-success invite-notification">Post shared on your wall</div>`);
    setTimeout(function () {
      $('.invite-notification').addClass('fadeOutLeft');
    }, 4000);
    $(this).hide();
  });
  //interval to refresh online user list
  setInterval(function () {
    socket.emit('onlineUsers');
  }, 10000);

  postToUserButton.on('click', function () {
    socket.emit('newpost', {
      content: postToUserInput.val(),
      to: $(this).data().user,
      username: $(this).data().username
    });
  });

  notificationList.on('click', '.accept', function () {
    socket.emit('accept', $(this).data().username);
    checkInvites.call($(this));
  });

  notificationList.on('click', '.decline', function () {
    console.log($(this));
    socket.emit('decline', $(this).data().username);
    checkInvites.call($(this));
  });


  $('#searchResult').on('click', '#invite', function () {
    socket.emit('invite', $(this).data().username);
    $('body').append(`<div class="animated fadeInLeft notification is-success invite-notification">Invite sent successfully</div>`);
    setTimeout(function () {
      $('.invite-notification').addClass('fadeOutLeft');
    }, 4000);
    $(this).hide();
  });

  $('#invite').on('click', function () {
    socket.emit('invite', $(this).data().username);
    $('body').append(`<div class="animated fadeInLeft notification is-success invite-notification">Invite sent successfully</div>`);
    setTimeout(function () {
      $('.invite-notification').addClass('fadeOutLeft');
    }, 4000);
    $(this).hide();
  });

  socket.on('online', data => {
    $('#' + data.username).removeClass('offline').addClass('online');
  });
  socket.on('offline', data => {
    $('#' + data.username).removeClass('online').addClass('offline');
  });
  socket.on('onlineUsers', data => {
    friendlist.find('div.status').each((key, obj) => {
      $(obj).removeClass('online').addClass('offline');
    });
    data.forEach(value => {
      $('#' + value).removeClass('offline').addClass('online');
    });
  });
  socket.on('invite', data => {
    $('.notification-icon').addClass('animated wobble').css('color', '#00d1b2');
    if (noinvites) {
      noinvites.remove();
    }
    notificationList.append(`<li class="invite-content">${data.from} sent you an invite<a class="decline" data-username=${data.from}><span class="icon">
    <i class="fa fa-times"></i></span></a><a class="accept" data-username=${data.from}><span class="icon"><i class="fa fa-check"></i></span></a><hr/></li>`);
  });
  socket.on('accept', data => {
    friendlist.append(`<li><div class="online">${data.user.slice(0, 2).toUpperCase()}</div><div>${data.user}</div>
    <span class="icon action-icons"><i class="fa fa-envelope-o open-chat" data-user=${data.user} data-userid=${data.userId}></i><a href="/profile/${data.user}"><i class="fa fa-user-o"></i></a></span></li>`);
  });

  postButton.on('click', function () {
    socket.emit('newpost', {content: postInput.val()});
    postInput.val(" ");
    postInput.focus();
  });

  socket.on('newpost', data => {
    let containerUser = postContainer.data().user;
    if (!data.shared) {
      if (containerUser === data.creator || containerUser === data.to) {
        postContainer.prepend(data.post);
      }
      if (containerUser === undefined) {
        postContainer.prepend(data.post);
      }
    }
    else {
      postContainer.prepend(data.post);
    }
  });

});