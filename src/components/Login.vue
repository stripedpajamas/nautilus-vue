<template>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3 class="pt-4">
      <v-card>
        <v-card-title class="headline">
          Login to access Nautilus:
        </v-card-title>
        <v-card-text>
          <v-text-field label="Username" v-model="usernameModel" autofocus></v-text-field>
          <v-text-field label="Password" type="password" v-model="passwordModel" @keyup.enter.native="authenticateUser"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click.native="authenticateUser" primary large right bottom>Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import {
    CHECK_COOKIE,
    AUTHENTICATE_USER,
    SET_LOGIN_USERNAME,
    SET_LOGIN_PASSWORD,
  } from '../store/types';

  export default {
    name: 'Login',
    watch: {
      isAuthenticated() {
        if (this.isAuthenticated) {
          this.$router.push('/');
        }
      },
    },
    beforeMount() {
      if (!this.isAuthenticated) {
        this.checkCookie();
      }
    },
    computed: {
      ...mapState({
        isAuthenticated: state => state.user.isAuthenticated,
        loginUsername: state => state.user.loginUsername,
        loginPassword: state => state.user.loginPassword,
      }),
      usernameModel: {
        get() {
          return this.loginUsername;
        },
        set(newVal) {
          this.setLoginUsername({ username: newVal });
        },
      },
      passwordModel: {
        get() {
          return this.loginPassword;
        },
        set(newVal) {
          this.setLoginPassword({ password: newVal });
        },
      },
    },
    methods: {
      ...mapActions({
        checkCookie: CHECK_COOKIE,
        setLoginUsername: SET_LOGIN_USERNAME,
        setLoginPassword: SET_LOGIN_PASSWORD,
        authenticateUser: AUTHENTICATE_USER,
      }),
    },
  };
</script>
