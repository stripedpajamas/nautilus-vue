<template>
  <iframe id="duo-iframe"></iframe>
</template>
<script>
  import DuoSDK from 'duo_web_sdk';
  import { mapActions, mapState } from 'vuex';
  import {
    AUTH_DUO,
    CONFIGURE_DUO,
  } from '../../store/types';

  export default {
    name: 'Duo',
    mounted() {
      DuoSDK.init({
        iframe: 'duo-iframe',
        host: this.api,
        sig_request: this.signedReq,
        submit_callback: this.sendDuoResponse,
      });
    },
    computed: {
      ...mapState({
        api: state => state.user.duo.api,
        signedReq: state => state.user.duo.signedReq,
      }),
    },
    methods: {
      ...mapActions({
        authDuo: AUTH_DUO,
        configureDuo: CONFIGURE_DUO,
      }),
      sendDuoResponse(form) {
        const value = form.sig_response.value;
        this.configureDuo({ key: 'signedRes', value });
        this.authDuo();
      },
    },
  };
</script>

<style>
  #duo-iframe {
    width: 100%;
    min-width: 304px;
    max-width: 820px;
    height: 330px;
    border: none;
  }
</style>
