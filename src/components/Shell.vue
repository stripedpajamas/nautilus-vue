<template>
  <div>
    <div class="shell">
      <v-card flat class="shell__output" ref="shellOutput">
        <v-card-text class="subheading">
          <div v-for="item in response">
            <span v-if="item.from === 'self'" class="shell__output__self">
              > {{ item.data }}
            </span>
            <span v-else class="shell__output__server" v-html="item.data"></span>
          </div>
        </v-card-text>
      </v-card>
      <v-text-field
        v-model="commandInput"
        @keyup.enter.native="sendCommand"
        class="shell__input"
        prepend-icon="label"
        single-line
        autofocus
        label="Command"
      ></v-text-field>
    </div>
    <v-dialog persistent v-model="credsDialog" width="400">
      <v-card>
        <form>
          <v-card-title class="headline">Enter Credentials</v-card-title>
          <v-card-text>
            <div>
              This client it set to use custom credentials. Please enter them below to connect.
            </div>
            <v-text-field label="Username" required v-model="usernameModel"></v-text-field>
            <v-text-field label="Password" type="password" required v-model="passwordModel"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn bottom right outline @click.native="cancelCreds">Cancel</v-btn>
            <v-btn type="submit "primary bottom right outline @click.native="submitCreds">Login</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import { mapState, mapActions } from 'vuex';
  import {
    SET_CUSTOM_USERNAME,
    SET_CUSTOM_PASSWORD,
    INITIALIZE,
    SEND_COMMAND,
    END_SESSION,
  } from '../store/types';

  export default {
    name: 'Shell',
    data() {
      return {
        commandInput: '',
        credsDialog: false,
      };
    },
    watch: {
      response() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      'selectedClient.domain'(newVal) { /* eslint object-shorthand: off */
        if (newVal) {
          this.init();
        }
      },
    },
    computed: {
      ...mapState({
        selectedClient: state => state.shell.selectedClient,
        response: state => state.shell.response,
      }),
      usernameModel: {
        get() {
          return this.selectedClient.username;
        },
        set(newVal) {
          this.setCustomUsername({ username: newVal });
        },
      },
      passwordModel: {
        get() {
          return this.selectedClient.password;
        },
        set(newVal) {
          this.setCustomPassword({ password: newVal });
        },
      },
    },
    methods: {
      ...mapActions({
        setCustomUsername: SET_CUSTOM_USERNAME,
        setCustomPassword: SET_CUSTOM_PASSWORD,
        initialize: INITIALIZE,
        sendCommandAction: SEND_COMMAND,
        endSession: END_SESSION,
      }),
      init() {
        if (this.selectedClient.domain) {
          if (this.selectedClient.defaultCreds) {
            this.initialize();
          } else {
            this.credsDialog = true;
          }
        } else {
          this.$nextTick(() => {
            this.init();
          });
        }
      },
      sendCommand() {
        if (this.commandInput.toLowerCase() === 'exit') {
          this.endSession();
          this.$router.push('/');
        } else {
          this.sendCommandAction({ command: this.commandInput });
        }
        this.commandInput = '';
      },
      scrollToBottom() {
        const so = this.$refs.shellOutput;
        so.scrollTop = so.scrollHeight;
      },
      submitCreds(e) {
        e.preventDefault();
        this.credsDialog = false;
        this.initialize();
      },
      cancelCreds() {
        this.$router.push('/');
      },
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {
      this.endSession();
    },
  };
</script>

<style lang="scss">
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 85vh;
    &__output {
      border-width: 1px;
      border-style: solid;
      border-color: rgba(0, 0, 0, .1);
      max-height: 75vh;
      overflow: scroll;
      flex: 1;
      &__self {
        font-weight: bold;
      }
      &__server {

      }
    }
    &__input {
      max-height: 4vh;
      flex: 0;
    }
  }
</style>
