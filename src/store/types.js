/**
 * Administrative actions
 */
export const ADD_ERROR = 'ADD_ERROR';
export const ADD_SUCCESS = 'ADD_SUCCESS';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const CLEAR_SUCCESS = 'CLEAR_SUCCESS';
export const UPDATE_CLIENT_LIST = 'UPDATE_CLIENT_LIST';
export const UPDATE_USER_LIST = 'UPDATE_USER_LIST';
export const SET_TOKEN = 'SET_TOKEN';
export const CLEAR_TOKEN = 'CLEAR_TOKEN';

/**
 * Authentication actions
 */
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const SET_LOGIN_USERNAME = 'SET_LOGIN_USERNAME';
export const SET_LOGIN_PASSWORD = 'SET_LOGIN_PASSWORD';
export const LOGOUT = 'LOGOUT';

/**
 * Shell-specific actions
 */
export const SELECT_CLIENT = 'SELECT_CLIENT';
export const END_SESSION = 'END_SESSION';

/**
 * Adding a client
 */
export const SET_NEW_CLIENT_NAME = 'SET_NEW_CLIENT_NAME';
export const SET_NEW_CLIENT_DOMAIN = 'SET_NEW_CLIENT_DOMAIN';
export const SET_NEW_CLIENT_CREDS = 'SET_NEW_CLIENT_CREDS';
export const ADD_NEW_CLIENT = 'ADD_NEW_CLIENT';

/**
 * Updating a client
 */
export const SET_CLIENT_TO_UPDATE = 'SET_CLIENT_TO_UPDATE';
export const UPDATE_CLIENT_NAME = 'UPDATE_CLIENT_NAME';
export const UPDATE_CLIENT_DOMAIN = 'UPDATE_CLIENT_DOMAIN';
export const UPDATE_CLIENT_CREDS = 'UPDATE_CLIENT_CREDS';
export const UPDATE_CLIENT = 'UPDATE_CLIENT';
export const CANCEL_UPDATE_CLIENT = 'CANCEL_UPDATE_CLIENT';

/**
 * Removing a client
 */
export const SET_CLIENT_TO_REMOVE = 'SET_CLIENT_TO_REMOVE';
export const REMOVE_CLIENT = 'REMOVE_CLIENT';

/**
 * Adding a user
 */
export const SET_NEW_USER_NAME = 'SET_NEW_USER_NAME';
export const SET_NEW_USER_PASSWORD = 'SET_NEW_USER_PASSWORD';
export const SET_NEW_USER_FULLNAME = 'SET_NEW_USER_FULLNAME';
export const SET_NEW_USER_ADMIN = 'SET_NEW_USER_ADMIN';
export const ADD_NEW_USER = 'ADD_NEW_USER';

/**
 * Updating a user
 */
export const SET_USER_TO_UPDATE = 'SET_USER_TO_UPDATE';
export const UPDATE_USER_NAME = 'UPDATE_USER_NAME';
export const UPDATE_USER_PASSWORD = 'UPDATE_USER_PASSWORD';
export const UPDATE_USER_FULLNAME = 'UPDATE_USER_FULLNAME';
export const UPDATE_USER_ADMIN = 'UPDATE_USER_ADMIN';
export const UPDATE_USER = 'UPDATE_USER';
export const CANCEL_UPDATE_USER = 'CANCEL_UPDATE_USER';

/**
 * Removing a user
 */
export const SET_USER_TO_REMOVE = 'SET_USER_TO_REMOVE';
export const REMOVE_USER = 'REMOVE_USER';
