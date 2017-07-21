<template>
  <v-app light>
    <v-navigation-drawer
      persistent
      enable-resize-watcher
      v-model="leftDrawer"
    >
      <v-list>
        <v-list-tile
          :to="item.route"
          value="true"
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon light v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      temporary
      v-model="rightDrawer"
      light
      right
      enable-resize-watcher
      overflow
      absolute
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar tag="div">
            <v-list-tile-avatar class="bubble blue-grey white--text mr-2">
            <span class="bubble__initials">
              PS
            </span>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>Peter Squicciarini</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>vpn_key</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Change Password</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
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
      <v-toolbar-side-icon @click.native.stop="leftDrawer = !leftDrawer" light></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon dark @click.native.stop="rightDrawer = !rightDrawer">
        <v-icon dark>account_box</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <router-view></router-view>
        </v-slide-y-transition>
      </v-container>
    </main>
    <v-footer fixed>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data() {
      return {
        title: 'Nautilus',
        leftDrawer: true,
        rightDrawer: false,
        items: [
          { icon: 'keyboard', title: 'Shell', route: '/shell' },
          { icon: 'extension', title: 'Administration', route: '/admin' },
        ],
      };
    },
  };
</script>

<style lang="scss">
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
