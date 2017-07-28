/**
 * Administrative actions
 */
export const ADD_ERROR = 'ADD_ERROR';
export const ADD_SUCCESS = 'ADD_SUCCESS';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const CLEAR_SUCCESS = 'CLEAR_SUCCESS';
export const UPDATE_CLIENT_LIST = 'UPDATE_CLIENT_LIST';
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

/**
 * Removing a client
 */
export const SET_CLIENT_TO_REMOVE = 'SET_CLIENT_TO_REMOVE';
export const REMOVE_CLIENT = 'REMOVE_CLIENT';
