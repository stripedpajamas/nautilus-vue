<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title class="headline">User Management</v-card-title>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <form>
            <v-card-title class="title">Add User</v-card-title>
            <v-card-text>
              <v-text-field label="Full Name" v-model="newUserFullNameModel"
                            autofocus></v-text-field>
              <v-text-field label="Username" v-model="newUsernameModel"></v-text-field>
              <v-text-field label="Password" type="password"
                            v-model="newUserPasswordModel"></v-text-field>
              <v-text-field
                label="Confirm Password"
                type="password"
                v-model="newUserConfirmPassword"
                :rules="newUserPasswordRules">
              </v-text-field>
              <v-switch label="Admin User" v-model="newUserAdminModel"></v-switch>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                @click.native="addNewUser"
                bottom right primary
                :disabled="newUserSaveDisable">
                Save
              </v-btn>
            </v-card-actions>
          </form>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <form>
            <v-card-title class="title">Edit User</v-card-title>
            <v-card-text>
              <v-select
                :items="usernames"
                label="Select User to Edit"
                v-model="userToUpdateModel"
                autocomplete
              ></v-select>
              <transition name="slide-x-transition">
                <v-card v-if="Object.keys(userToUpdate).length">
                  <v-card-text>
                    <v-text-field label="Full Name" v-model="updatedUserFullNameModel"
                                  autofocus></v-text-field>
                    <v-text-field label="Username" v-model="updatedUsernameModel"
                                  autofocus></v-text-field>
                    <v-text-field
                      label="Password"
                      type="password"
                      v-model="updatedPasswordModel"
                      persistent-hint
                      hint="Optionally change user's password">
                    </v-text-field>
                    <v-text-field
                      v-if="updatedPasswordModel"
                      label="Confirm Password"
                      type="password"
                      v-model="updateUserConfirmPassword"
                      :rules="updateUserPasswordRules">
                    </v-text-field>
                    <v-switch label="Admin User" v-model="updatedUserAdminModel"></v-switch>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="cancelUpdateUser" bottom right>Cancel</v-btn>
                    <v-btn @click.native="updateUser" bottom right primary type="submit">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </transition>
            </v-card-text>
          </form>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title class="title">Remove User</v-card-title>
          <v-card-text>
            <v-select
              :items="usernames"
              label="Select User to Remove"
              v-model="userToRemoveModel"
              autocomplete
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click.native="removeUser" bottom right error :disabled="!userToRemove._id">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import {
    UPDATE_USER_LIST,
    SET_NEW_USER_NAME,
    SET_NEW_USER_PASSWORD,
    SET_NEW_USER_FULLNAME,
    SET_NEW_USER_ADMIN,
    ADD_NEW_USER,
    SET_USER_TO_UPDATE,
    UPDATE_USER_NAME,
    UPDATE_USER_PASSWORD,
    UPDATE_USER_FULLNAME,
    UPDATE_USER_ADMIN,
    UPDATE_USER,
    CANCEL_UPDATE_USER,
    SET_USER_TO_REMOVE,
    REMOVE_USER,
  } from '../../store/types';

  export default {
    name: 'UserAdmin',
    data() {
      return {
        newUserConfirmPassword: '',
        updateUserConfirmPassword: '',
        newUserPasswordRules: [
          val => val === this.newUser.password || 'Passwords must match!',
        ],
        updateUserPasswordRules: [
          val => val === this.userToUpdate.password || 'Passwords must match!',
        ],
      };
    },
    mounted() {
      this.updateUserList();
    },
    computed: {
      ...mapState({
        newUser: state => state.user.newUser,
        userToUpdate: state => state.user.userToUpdate,
        userToRemove: state => state.user.userToRemove,
      }),
      ...mapGetters([
        'usernames',
      ]),
      newUserSaveDisable() {
        const passwordsMatch = this.newUserPasswordRules[0](this.newUserConfirmPassword) === true;
        return !this.newUsernameModel || !this.newUserPasswordModel || !passwordsMatch;
      },
      newUsernameModel: {
        get() {
          return this.newUser.username;
        },
        set(newVal) {
          this.setNewUsername({ username: newVal });
        },
      },
      newUserPasswordModel: {
        get() {
          return this.newUser.password;
        },
        set(newVal) {
          this.setNewUserPassword({ password: newVal });
        },
      },
      newUserAdminModel: {
        get() {
          return this.newUser.isAdmin;
        },
        set(newVal) {
          this.setNewUserAdmin({ isAdmin: newVal });
        },
      },
      newUserFullNameModel: {
        get() {
          return this.newUser.fullName;
        },
        set(newVal) {
          this.setNewUserFullName({ fullName: newVal });
        },
      },
      userToUpdateModel: {
        get() {
          return this.userToUpdate.username;
        },
        set(newVal) {
          this.setUserToUpdate({ username: newVal });
        },
      },
      updatedUsernameModel: {
        get() {
          return this.userToUpdate.username;
        },
        set(newVal) {
          this.updateUsername({ username: newVal });
        },
      },
      updatedPasswordModel: {
        get() {
          return this.userToUpdate.password;
        },
        set(newVal) {
          this.updateUserPassword({ password: newVal });
        },
      },
      updatedUserAdminModel: {
        get() {
          return this.userToUpdate.isAdmin;
        },
        set(newVal) {
          this.updateUserAdmin({ isAdmin: newVal });
        },
      },
      updatedUserFullNameModel: {
        get() {
          return this.userToUpdate.fullName;
        },
        set(newVal) {
          this.updateUserFullName({ fullName: newVal });
        },
      },
      userToRemoveModel: {
        get() {
          return this.userToRemove.username;
        },
        set(newVal) {
          this.setUserToRemove({ username: newVal });
        },
      },
    },
    methods: {
      ...mapActions({
        updateUserList: UPDATE_USER_LIST,
        setNewUsername: SET_NEW_USER_NAME,
        setNewUserPassword: SET_NEW_USER_PASSWORD,
        setNewUserFullName: SET_NEW_USER_FULLNAME,
        setNewUserAdmin: SET_NEW_USER_ADMIN,
        addNewUserAction: ADD_NEW_USER,
        setUserToUpdate: SET_USER_TO_UPDATE,
        updateUserFullName: UPDATE_USER_FULLNAME,
        updateUsername: UPDATE_USER_NAME,
        updateUserPassword: UPDATE_USER_PASSWORD,
        updateUserAdmin: UPDATE_USER_ADMIN,
        updateUserAction: UPDATE_USER,
        cancelUpdateUser: CANCEL_UPDATE_USER,
        setUserToRemove: SET_USER_TO_REMOVE,
        removeUser: REMOVE_USER,
      }),
      addNewUser(e) {
        e.preventDefault();
        this.addNewUserAction();
        this.newUserConfirmPassword = '';
      },
      updateUser(e) {
        e.preventDefault();
        this.updateUserAction();
        this.updateUserConfirmPassword = '';
      },
    },
  };
</script>
