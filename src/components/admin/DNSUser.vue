<template>
  <v-tabs dark grow>
    <v-toolbar class="blue-grey darken-1" dark>
      <v-toolbar-title class="headline">DNS User Management</v-toolbar-title>
      <v-tabs-bar class="blue-grey darken-1" slot="extension" dark>
        <v-tabs-slider class="cyan accent-4"></v-tabs-slider>
        <v-tabs-item
          v-for="(item, i) in items"
          :key="i"
          :href="`#tab-${(i + 1)}`"
        >
          {{ item }}
        </v-tabs-item>
      </v-tabs-bar>
    </v-toolbar>
    <v-tabs-items>
      <v-tabs-content id="tab-1">
        <v-card flat>
          <v-form ref="newUserForm">
            <v-card-title class="title">Add DNS User</v-card-title>
            <v-card-text>
              <v-text-field autofocus label="Company" v-model="newUserCompanyModel"></v-text-field>
              <v-text-field label="Username" v-model="newUsernameModel"></v-text-field>
              <v-text-field label="Password" type="password"
                            v-model="newUserPasswordModel"></v-text-field>
              <v-text-field
                label="Confirm Password"
                type="password"
                v-model="newUserConfirmPassword"
                :rules="newUserPasswordRules">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                @click.native="addNewUser"
                bottom right primary outline
                :disabled="newUserSaveDisable">
                Save
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-tabs-content>
      <v-tabs-content id="tab-2">
        <v-card flat>
          <form>
            <v-card-title class="title">Edit DNS User</v-card-title>
            <v-card-text>
              <v-select
                :items="DNSUsernames"
                label="Select DNS User to Edit"
                v-model="userToUpdateModel"
                :disabled="!!DNSUserToUpdate._id"
                autocomplete
              ></v-select>
              <transition name="slide-x-transition">
                <v-card flat v-if="Object.keys(DNSUserToUpdate).length">
                  <v-card-text>
                    <v-text-field autofocus label="Company" v-model="updatedUserCompanyModel"></v-text-field>
                    <v-text-field label="Username" v-model="updatedUsernameModel"></v-text-field>
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
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="cancelUpdateDNSUser" bottom right outline>Cancel</v-btn>
                    <v-btn @click.native="updateUser" bottom right primary outline type="submit">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </transition>
            </v-card-text>
          </form>
        </v-card>
      </v-tabs-content>
      <v-tabs-content id="tab-3">
        <v-card flat>
          <v-card-title class="title">Remove DNS User</v-card-title>
          <v-card-text>
            <v-select
              :items="removeTargets"
              label="Select DNS User to Remove"
              v-model="userToRemoveModel"
              :disabled="!!DNSUserToRemove._id"
              autocomplete
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click.native="cancelRemoveDNSUser" bottom right outline v-if="DNSUserToRemove._id">Cancel</v-btn>
            <v-btn @click.native="removeDNSUser" bottom right error outline :disabled="!DNSUserToRemove._id">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tabs-content>
      <v-tabs-content id="tab-4">
        <v-card flat>
          <v-card-title class="title">Reports</v-card-title>
          <v-card-text>
            <v-select
              :items="companiesDropdown"
              label="Filter by Company"
              v-model="selectedDNSCompany"
            ></v-select>
            <v-data-table
              :headers="headers"
              :items="filteredCompanies"
              item-key="username"
            >
              <template slot="items" scope="props">
                <td>{{ props.item.company }}</td>
                <td>{{ props.item.username }}</td>
              </template>
              <template slot="pageText" scope="props">
                Total items: {{ props.itemsLength }}
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
          </v-card-actions>
        </v-card>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import {
    UPDATE_DNS_USER_LIST,
    SET_NEW_DNS_USER_COMPANY,
    SET_NEW_DNS_USER_NAME,
    SET_NEW_DNS_USER_PASSWORD,
    ADD_NEW_DNS_USER,
    SET_DNS_USER_TO_UPDATE,
    UPDATE_DNS_USER_COMPANY,
    UPDATE_DNS_USER_NAME,
    UPDATE_DNS_USER_PASSWORD,
    UPDATE_DNS_USER,
    CANCEL_UPDATE_DNS_USER,
    SET_DNS_USER_TO_REMOVE,
    CANCEL_REMOVE_DNS_USER,
    REMOVE_DNS_USER,
  } from '../../store/types';

  export default {
    name: 'DNSUserAdmin',
    data() {
      return {
        items: ['Add DNS User', 'Edit DNS User', 'Remove DNS User', 'Reports'],
        newUserConfirmPassword: '',
        updateUserConfirmPassword: '',
        newUserPasswordRules: [
          val => val === this.newDNSUser.password || 'Passwords must match!',
        ],
        updateUserPasswordRules: [
          val => val === this.DNSUserToUpdate.password || 'Passwords must match!',
        ],
        headers: [
          {
            text: 'Company',
            value: 'company',
            align: 'left',
            sortable: true,
          },
          {
            text: 'Username/Hostname',
            value: 'username',
            align: 'left',
            sortable: true,
          },
        ],
        selectedDNSCompany: '',
      };
    },
    mounted() {
      this.updateDNSUserList();
    },
    computed: {
      ...mapState({
        dnsUsers: state => state.dnsuser.DNSUsers,
        newDNSUser: state => state.dnsuser.newDNSUser,
        DNSUserToUpdate: state => state.dnsuser.DNSUserToUpdate,
        DNSUserToRemove: state => state.dnsuser.DNSUserToRemove,
      }),
      ...mapGetters([
        'DNSUsernames',
        'DNSCompanies',
      ]),
      companiesDropdown() {
        return ['Show All'].concat(this.DNSCompanies);
      },
      filteredCompanies() {
        return this.selectedDNSCompany && this.selectedDNSCompany !== 'Show All'
          ? this.dnsUsers.filter(dnsUser => dnsUser.company === this.selectedDNSCompany)
          : this.dnsUsers;
      },
      removeTargets() {
        return this.DNSUsernames;
      },
      newUserSaveDisable() {
        const passwordsMatch = this.newUserPasswordRules[0](this.newUserConfirmPassword) === true;
        return !this.newUsernameModel || !this.newUserPasswordModel || !passwordsMatch;
      },
      newUserCompanyModel: {
        get() {
          return this.newDNSUser.company;
        },
        set(newVal) {
          this.setNewDNSUserCompany({ company: newVal });
        },
      },
      newUsernameModel: {
        get() {
          return this.newDNSUser.username;
        },
        set(newVal) {
          this.setNewDNSUsername({ username: newVal });
        },
      },
      newUserPasswordModel: {
        get() {
          return this.newDNSUser.password;
        },
        set(newVal) {
          this.setNewDNSUserPassword({ password: newVal });
        },
      },
      userToUpdateModel: {
        get() {
          return this.DNSUserToUpdate.username;
        },
        set(newVal) {
          this.setDNSUserToUpdate({ username: newVal });
        },
      },
      updatedUserCompanyModel: {
        get() {
          return this.DNSUserToUpdate.company;
        },
        set(newVal) {
          this.updateDNSUserCompany({ company: newVal });
        },
      },
      updatedUsernameModel: {
        get() {
          return this.DNSUserToUpdate.username;
        },
        set(newVal) {
          this.updateDNSUsername({ username: newVal });
        },
      },
      updatedPasswordModel: {
        get() {
          return this.DNSUserToUpdate.password;
        },
        set(newVal) {
          this.updateDNSUserPassword({ password: newVal });
        },
      },
      userToRemoveModel: {
        get() {
          return this.DNSUserToRemove.username;
        },
        set(newVal) {
          this.setDNSUserToRemove({ username: newVal });
        },
      },
    },
    methods: {
      ...mapActions({
        updateDNSUserList: UPDATE_DNS_USER_LIST,
        setNewDNSUserCompany: SET_NEW_DNS_USER_COMPANY,
        setNewDNSUsername: SET_NEW_DNS_USER_NAME,
        setNewDNSUserPassword: SET_NEW_DNS_USER_PASSWORD,
        addNewDNSUserAction: ADD_NEW_DNS_USER,
        setDNSUserToUpdate: SET_DNS_USER_TO_UPDATE,
        updateDNSUserCompany: UPDATE_DNS_USER_COMPANY,
        updateDNSUsername: UPDATE_DNS_USER_NAME,
        updateDNSUserPassword: UPDATE_DNS_USER_PASSWORD,
        updateDNSUserAction: UPDATE_DNS_USER,
        cancelUpdateDNSUser: CANCEL_UPDATE_DNS_USER,
        setDNSUserToRemove: SET_DNS_USER_TO_REMOVE,
        cancelRemoveDNSUser: CANCEL_REMOVE_DNS_USER,
        removeDNSUser: REMOVE_DNS_USER,
      }),
      addNewUser(e) {
        e.preventDefault();
        this.addNewDNSUserAction();
        this.newUserConfirmPassword = '';
        this.$refs.newUserForm.reset();
      },
      updateUser(e) {
        e.preventDefault();
        this.updateDNSUserAction();
        this.updateUserConfirmPassword = '';
      },
    },
  };
</script>
