export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:id/messages',
  GROUPS = 'groups',
  GROUP_MESSAGES = 'groups/:id/messages',
  GROUP_RECIPIENTS = 'groups/:id/recipients',
  FRIENDS = 'friends',
  FRIEND_REQUESTS = 'friends/requests',
}

export enum Services {
  GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER_SERVICE',
  AUTH = 'AUTH_SERVICE',
  USERS = 'USERS_SERVICE',
  CONVERSATIONS = 'CONVERSATIONS_SERVICE',
  MESSAGES = 'MESSAGES_SERVICE',
  GROUPS = 'GROUPS_SERVICE',
  GROUP_MESSAGES = 'GROUP_MESSAGES_SERVICE',
  GROUP_RECIPIENTS = 'GROUP_RECIPIENTS_SERVICE',
  FRIENDS = 'FRIENDS_SERVICE',
  FRIEND_REQUESTS = 'FRIEND_REQUESTS_SERVICE',
}

export enum ServerEvents {
  FRIEND_REQUEST_ACCEPTED = 'friend.request.accepted',
  FRIEND_REQUEST_REJECTED = 'friend.request.rejected',
  FRIEND_REQUEST_CANCELED = 'friend.request.canceled',
}

export enum WebsocketEvents {
  FRIEND_REQUEST_ACCEPTED = 'onFriendRequestAccepted',
  FRIEND_REQUEST_REJECTED = 'onFriendRequestRejected',
  FRIEND_REQUEST_CANCELED = 'onFriendRequestCanceled',
}
