<template>
  <v-tabs dark grow>
    <v-toolbar class="blue-grey darken-1" dark>
      <v-toolbar-title class="headline">User Settings</v-toolbar-title>
      <v-tabs-bar class="blue-grey darken-1" slot="extension" dark>
        <v-tabs-slider class="cyan accent-4"></v-tabs-slider>
        <v-tabs-item :href="'#change-password'">
          Change Password
        </v-tabs-item>
      </v-tabs-bar>
    </v-toolbar>
    <v-tabs-items>
      <v-tabs-content id="change-password">
        <v-card flat>
          <form>
            <v-card-text>
              <v-text-field label="Password" type="password" v-model="changePasswordModel"></v-text-field>
              <v-text-field
                label="Confirm Password"
                type="password"
                v-model="confirmPassword"
                :rules="passwordRules">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" :disabled="saveDisable" @click.native="updateUser" primary bottom right outline>Save</v-btn>
            </v-card-actions>
          </form>
        </v-card>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>
<script>
  import { mapState, mapActions } from 'vuex';
  import {
    SET_USER_TO_UPDATE,
    UPDATE_USER_PASSWORD,
    UPDATE_USER,
  } from '../../store/types';

  export default {
    name: 'UserSettings',
    data() {
      return {
        confirmPassword: undefined,
        passwordRules: [
          val => val === this.changePasswordModel || 'Passwords must match!',
        ],
      };
    },
    mounted() {
      this.setUserToUpdate({ username: 'self' });
    },
    computed: {
      ...mapState({
        user: state => state.user.user,
        userToUpdate: state => state.user.userToUpdate,
      }),
      changePasswordModel: {
        get() {
          return this.userToUpdate.password;
        },
        set(newVal) {
          this.updateUserPassword({ password: newVal });
        },
      },
      saveDisable() {
        const passwordsMatch = this.passwordRules[0](this.confirmPassword) === true;
        return !this.changePasswordModel || !passwordsMatch;
      },
    },
    methods: {
      ...mapActions({
        setUserToUpdate: SET_USER_TO_UPDATE,
        updateUserPassword: UPDATE_USER_PASSWORD,
        updateUserAction: UPDATE_USER,
      }),
      updateUser(e) {
        e.preventDefault();
        this.updateUserAction();
        this.$router.push('/');
      },
    },
  };
</script>
