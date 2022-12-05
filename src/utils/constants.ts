export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:id/messages',
  GROUPS = 'groups',
  GROUP_MESSAGES = 'groups/:id/messages',
}

export enum Services {
  GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER_SERVICE',
  AUTH = 'AUTH_SERVICE',
  USERS = 'USERS_SERVICE',
  CONVERSATIONS = 'CONVERSATIONS_SERVICE',
  MESSAGES = 'MESSAGES_SERVICE',
  GROUPS = 'GROUPS_SERVICE',
  GROUP_MESSAGES = 'GROUP_MESSAGES_SERVICE',
}
