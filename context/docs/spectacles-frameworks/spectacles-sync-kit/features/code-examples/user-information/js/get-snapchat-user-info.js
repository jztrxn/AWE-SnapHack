var sessionController = global.sessionController;

function onAwake() {
  print('GetSnapchatUserScript: onAwake called');

  if (sessionController) {
    sessionController.notifyOnReady(onReady);
  } else {
    print('SessionController not available');
  }
}

function onReady() {
  print('GetSnapchatUserScript: onReady called');

  var session = sessionController.getSession();
  if (!session) {
    print('No session available');
    return;
  }

  var localUserInfo = sessionController.getLocalUserInfo();
  if (!localUserInfo) {
    print('No local user info available');
    return;
  }

  // Get Snapchat user info for the local user
  session.getSnapchatUser(localUserInfo, function (snapchatUser) {
    if (!snapchatUser) {
      print(
        'getSnapchatUser returned null (expected in singleplayer/offline mode)'
      );
      return;
    }

    var name = snapchatUser.displayName || snapchatUser.userName || '<unknown>';
    print(
      'Got SnapchatUser: ' + name + ', hasBitmoji=' + snapchatUser.hasBitmoji
    );
  });
}

// Initialize the script
onAwake();
