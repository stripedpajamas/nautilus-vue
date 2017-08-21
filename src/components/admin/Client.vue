<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title class="headline">Client Management</v-card-title>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <form>
            <v-card-title class="title">Add Client</v-card-title>
            <v-card-text>
              <v-text-field label="Name" v-model="newClientNameModel" autofocus></v-text-field>
              <v-text-field label="Domain" v-model="newClientDomainModel"></v-text-field>
              <v-switch label="Default Credentials" v-model="newClientCredsModel"></v-switch>
              <v-switch label="Include in Password Expiry Notices" v-model="newClientExpireModel"></v-switch>
              <v-switch label="Include in License Check" v-model="newClientLicenseModel"></v-switch>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click.native="addNewClient" bottom right primary
                     :disabled="!newClientNameModel || !newClientDomainModel"
                     type="submit">Save
              </v-btn>
            </v-card-actions>
          </form>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title class="title">Edit Client</v-card-title>
          <v-card-text>
            <v-select
              :items="clientNames"
              label="Select Client to Edit"
              v-model="clientToUpdateModel"
              autocomplete
            ></v-select>
            <transition name="slide-x-transition">
              <v-card v-if="Object.keys(clientToUpdate).length">
                <form>
                  <v-card-text>
                    <v-text-field label="Name" v-model="updatedClientNameModel" required
                                  autofocus></v-text-field>
                    <v-text-field label="Domain" v-model="updatedClientDomainModel"
                                  required></v-text-field>
                    <v-switch label="Default Credentials"
                              v-model="updatedClientCredsModel"></v-switch>
                    <v-switch label="Include in Password Expiry Notices" v-model="updatedClientExpireModel"></v-switch>
                    <v-switch label="Include in License Check" v-model="updatedClientLicenseModel"></v-switch>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="cancelUpdateClient" bottom right>Cancel</v-btn>
                    <v-btn @click.native="updateClient" bottom right primary type="submit">Save</v-btn>
                  </v-card-actions>
                </form>
              </v-card>
            </transition>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title class="title">Remove Client</v-card-title>
          <v-card-text>
            <v-select
              :items="clientNames"
              label="Select Client to Remove"
              v-model="clientToRemoveModel"
              autocomplete
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click.native="removeClient" bottom right error :disabled="!clientToRemove._id">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapState, mapActions, mapGetters } from 'vuex';
  import {
    SET_NEW_CLIENT,
    SET_CLIENT_TO_UPDATE,
    UPDATE_CLIENT_INFO,
    SET_CLIENT_TO_REMOVE,
    CANCEL_UPDATE_CLIENT,
    ADD_NEW_CLIENT,
    UPDATE_CLIENT,
    REMOVE_CLIENT,
  } from '../../store/types';

  export default {
    name: 'ClientAdmin',
    computed: {
      ...mapState({
        newClient: state => state.client.newClient,
        clientToUpdate: state => state.client.clientToUpdate,
        clientToRemove: state => state.client.clientToRemove,
      }),
      ...mapGetters([
        'clientNames',
      ]),
      newClientNameModel: {
        get() {
          return this.newClient.name;
        },
        set(newVal) {
          this.setNewClient({ key: 'name', value: newVal });
        },
      },
      newClientDomainModel: {
        get() {
          return this.newClient.domain;
        },
        set(newVal) {
          this.setNewClient({ key: 'domain', value: newVal });
        },
      },
      newClientCredsModel: {
        get() {
          return this.newClient.defaultCreds;
        },
        set(newVal) {
          this.setNewClient({ key: 'defaultCreds', value: newVal });
        },
      },
      newClientExpireModel: {
        get() {
          return this.newClient.includeExpireCheck;
        },
        set(newVal) {
          this.setNewClient({ key: 'includeExpireCheck', value: newVal });
        },
      },
      newClientLicenseModel: {
        get() {
          return this.newClient.includeLicenseCheck;
        },
        set(newVal) {
          this.setNewClient({ key: 'includeLicenseCheck', value: newVal });
        },
      },
      clientToUpdateModel: {
        get() {
          return this.clientToUpdate.name;
        },
        set(newVal) {
          this.setClientToUpdate({ clientName: newVal });
        },
      },
      updatedClientNameModel: {
        get() {
          return this.clientToUpdate.name;
        },
        set(newVal) {
          this.updateClientInfo({ key: 'name', value: newVal });
        },
      },
      updatedClientDomainModel: {
        get() {
          return this.clientToUpdate.domain;
        },
        set(newVal) {
          this.updateClientInfo({ key: 'domain', value: newVal });
        },
      },
      updatedClientCredsModel: {
        get() {
          return this.clientToUpdate.defaultCreds;
        },
        set(newVal) {
          this.updateClientInfo({ key: 'defaultCreds', value: newVal });
        },
      },
      updatedClientExpireModel: {
        get() {
          return this.clientToUpdate.includeExpireCheck;
        },
        set(newVal) {
          this.updateClientInfo({ key: 'includeExpireCheck', value: newVal });
        },
      },
      updatedClientLicenseModel: {
        get() {
          return this.clientToUpdate.includeLicenseCheck;
        },
        set(newVal) {
          this.updateClientInfo({ key: 'includeLicenseCheck', value: newVal });
        },
      },
      clientToRemoveModel: {
        get() {
          return this.clientToRemove.name;
        },
        set(newVal) {
          this.setClientToRemove({ clientName: newVal });
        },
      },
    },
    methods: {
      ...mapActions({
        setNewClient: SET_NEW_CLIENT,
        setClientToUpdate: SET_CLIENT_TO_UPDATE,
        updateClientInfo: UPDATE_CLIENT_INFO,
        setClientToRemove: SET_CLIENT_TO_REMOVE,
        cancelUpdateClient: CANCEL_UPDATE_CLIENT,
        addNewClientAction: ADD_NEW_CLIENT,
        updateClientAction: UPDATE_CLIENT,
        removeClient: REMOVE_CLIENT,
      }),
      addNewClient(e) {
        e.preventDefault();
        this.addNewClientAction();
      },
      updateClient(e) {
        e.preventDefault();
        this.updateClientAction();
      },
    },
  };
</script>
