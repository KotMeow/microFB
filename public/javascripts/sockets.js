$(function () {

  var socket = io();

  let friendlist = $('#friend-list');
  let noinvites = $('#no-invites');
  let notificationList = $("#notification-list");
  let postButton = $('#sendPost');
  let postInput = $('.post-input');
  let postContainer = $('#posts-container');
  let postToUserButton = $('#sendPostToUser');
  let postToUserInput = $('.post-touser-input');
  let chatContainer = $('.chat-container');
  let privateToAll = $('#private-to-all');

  let changeHashtags = function() {
    $('.content').each(function() {
     this.innerHTML = this.innerHTML.replace(/#(\S+)/g,'<a href="/tag/$1" class="hashTag">#$1</a>');
    });
  };
  changeHashtags();
  let readThenSendFile = (data, content) => {
    var reader = new FileReader();
    reader.onload = function (evt) {
      var msg = {};
      msg.file = evt.target.result;
      msg.content = content;
      if (msg.file.split(';')[0].split(':')[1].split('/')[0] === 'image') {
        socket.emit('newpost', msg);
        document.getElementById('upload-image').value = '';
        postInput.val('');
      } else {
        $('body').append(`<div class="animated fadeInLeft notification is-danger wrongfile-notification">Only image files can be posted!</div>`);
        setTimeout(function () {
          $('.wrongfile-notification').addClass('fadeOutLeft');
        }, 2000);
      }
    };
    reader.readAsDataURL(data);
  };

  let readThenSendFileToFriend = (data, content, to, username) => {
    var reader = new FileReader();
    reader.onload = function (evt) {
      var msg = {};
      msg.file = evt.target.result;
      msg.content = content;
      msg.to = to;
      msg.username = username;
      if (msg.file.split(';')[0].split(':')[1].split('/')[0] === 'image') {
        socket.emit('newpost', msg);
        document.getElementById('upload-image').value = '';
        postInput.val('');
      } else {
        $('body').append(`<div class="animated fadeInLeft notification is-danger wrongfile-notification">Only image files can be posted!</div>`);
        setTimeout(function () {
          $('.wrongfile-notification').addClass('fadeOutLeft');
        }, 2000);
      }
    };
    reader.readAsDataURL(data);
  };


  friendlist.on('click', '.open-chat', function () {
    if ($('#chat-' + $(this).data().user).length === 0) {
      axios.post('/getchat', {user: $(this).data().user, userid: $(this).data().userid}).then(response => {
        chatContainer.prepend(response.data);
        let thisChat = $('.live-chat').first().find('.chat-history');
        thisChat.scrollTop(thisChat[0].scrollHeight);
      });
    }
  });

  privateToAll.on('click', function () {
    if ($('#chat-all').length === 0) {
      axios.post('/getchat', {user: "all"}).then(response => {
        chatContainer.prepend(response.data);
        let thisChat = $('.live-chat').first().find('.chat-history');
        thisChat.scrollTop(thisChat[0].scrollHeight);
      });
    }
  });


  socket.on('chatMessage', data => {
    let chatSelector = $('#chat-' + data.from);
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
      $(this).next().html(response.data.length);
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


  notificationList.on('click', '.accept', function () {
    socket.emit('accept', $(this).data().username);
    checkInvites.call($(this));
  });

  notificationList.on('click', '.decline', function () {
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

  postToUserButton.on('click', function () {
    let file = document.getElementById('upload-image').files[0];
    if (file && postToUserInput.val().length > 2) {
      readThenSendFileToFriend(file, postToUserInput.val(), $(this).data().user, $(this).data().username);
    } else if (postToUserInput.val().length > 2) {
      socket.emit('newpost', {
        content: postToUserInput.val(),
        to: $(this).data().user,
        username: $(this).data().username
      });
    }
  });

  postButton.on('click', function () {
    let file = document.getElementById('upload-image').files[0];
    if (file && postInput.val().length > 2) {
      readThenSendFile(file, postInput.val());
    } else if (postInput.val().length > 2) {
      socket.emit('newpost', {content: postInput.val()});
      document.getElementById('upload-image').value = '';
      postInput.val('');
    }
    postInput.focus();
  });

  socket.on('newpost', data => {
    let containerUser = postContainer.data().user;
    let containerTag = postContainer.data().tag;
    console.log(data.tags);
    if (!data.shared) {
      if (containerUser === data.creator || containerUser === data.to) {
        postContainer.prepend(data.post);
        changeHashtags();
      }
      if ($.inArray(containerTag, data.tags) !== -1) {
        postContainer.prepend(data.post);
        changeHashtags();
      }
      if (containerUser === undefined && containerTag === undefined) {
        postContainer.prepend(data.post);
        changeHashtags();
      }
    }
    else {
      postContainer.prepend(data.post);
      changeHashtags();
    }
  });
  var colors = ['is-primary', 'is-danger', 'is-warning', 'is-success', 'is-primary is-bold', 'is-success is-bold', 'is-warning is-bold', 'is-danger is-bold'];
  var index = Math.floor(Math.random() * colors.length);
  var color = colors[index];
  $('#hashtag').addClass(color);
});