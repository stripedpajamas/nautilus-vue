<template>
  <v-app light>
    <v-navigation-drawer
      v-if="isAuthenticated"
      persistent
      enable-resize-watcher
      v-model="leftDrawer"
    >
      <v-list>
        <v-layout row>
          <v-flex xs10 offset-xs1>
            <v-btn v-if="Object.keys(selectedClient).length" @click.native="endSession" block error large>End Session</v-btn>
          </v-flex>
        </v-layout>
        <v-list-group v-if="isAdmin" :value="sidebarAdmin.active" :key="sidebarAdmin.title">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>{{ sidebarAdmin.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ sidebarAdmin.title }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile :to="subitem.route" v-for="subitem in sidebarAdmin.subitems" :key="subitem.title">
            <v-list-tile-content>
              <v-list-tile-title>{{ subitem.title }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>{{ subitem.action }}</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
        <v-list-group :value="sidebarShell.active" :key="sidebarShell.title">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>{{ sidebarShell.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ sidebarShell.title }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile @click.native="(e) => selectClient(client)" v-for="client in clientNames" :key="client">
            <v-list-tile-content>
              <v-list-tile-title :class="activeClientClass(client)">{{ client }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>{{ client.action }}</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-if="isAuthenticated"
      temporary
      v-model="rightDrawer"
      light
      right
      enable-resize-watcher
      overflow
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar tag="div">
            <v-list-tile-avatar class="bubble blue-grey white--text mr-2">
            <span class="bubble__initials">
              {{ userInitials }}
            </span>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ fullName }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense>
        <v-list-tile :to="'/user'">
          <v-list-tile-action>
            <v-icon>vpn_key</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Change Password</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click.native="logout">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark fixed prominent class="blue-grey darken-3">
      <v-toolbar-side-icon v-if="isAuthenticated" @click.native.stop="leftDrawer = !leftDrawer" light></v-toolbar-side-icon>
      <v-toolbar-title><router-link :to="'/'">{{ title }}</router-link></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isAuthenticated" icon dark @click.native.stop="rightDrawer = !rightDrawer">
        <v-icon dark>account_box</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <router-view></router-view>
        </v-slide-y-transition>
        <Notification></Notification>
      </v-container>
    </main>
    <!--<v-footer fixed>-->
    <!--</v-footer>-->
  </v-app>
</template>

<script>
  import { mapActions, mapState, mapGetters } from 'vuex';
  import {
    UPDATE_CLIENT_LIST,
    SELECT_CLIENT,
    LOGOUT,
    END_SESSION,
  } from './store/types';
  import Notification from './components/helpers/Notification';

  export default {
    data() {
      return {
        title: 'Nautilus',
        leftDrawer: true,
        rightDrawer: false,
        sidebarAdmin: {
          icon: 'extension',
          title: 'Administration',
          route: '/admin',
          subitems: [
            {
              title: 'Users',
              route: '/admin/users',
            },
            {
              title: 'Clients',
              route: '/admin/clients',
            },
          ],
        },
        sidebarShell: {
          active: true,
          icon: 'keyboard',
          title: 'Shell',
          route: '/shell',
        },
      };
    },
    computed: {
      ...mapState({
        isAuthenticated: state => state.user.isAuthenticated,
        isAdmin: state => state.user.user.isAdmin,
        fullName: state => state.user.user.fullName,
        clients: state => state.client.clients,
        selectedClient: state => state.shell.selectedClient,
      }),
      ...mapGetters([
        'clientNames',
      ]),
      userInitials() {
        // Grab the first and last initials for the person
        if (!this.fullName || this.fullName.split(' ').length < 2) return '';
        const split = this.fullName.split(' ');
        return `${split[0][0]}${split[split.length - 1][0]}`;
      },
    },
    methods: {
      ...mapActions({
        updateClientList: UPDATE_CLIENT_LIST,
        selectClientAction: SELECT_CLIENT,
        logoutAction: LOGOUT,
        endSessionAction: END_SESSION,
      }),
      activeClientClass(client) {
        return client === this.selectedClient.name ? 'list__tile--active' : '';
      },
      selectClient(clientName) {
        // select client in state
        this.selectClientAction({ clientName });

        // goto client selection
        this.$router.push('/shell');
      },
      logout() {
        this.logoutAction();
        this.$router.push('/login');
      },
      endSession() {
        this.endSessionAction();
        this.$router.push('/');
      },
    },
    components: {
      Notification,
    },
  };
</script>

<style lang="scss">
  a {
    color: inherit;
    text-decoration: none;
  }
  #app {
    overflow-y: hidden;
  }

  .bubble {
    min-width: 30px !important;
    height: 30px;
    border-radius: 50%;
    &__initials {
      width: 100%;
      font-size: 15px;
    }
  }
</style>
