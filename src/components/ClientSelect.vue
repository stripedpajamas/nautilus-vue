<template>
  <v-card>
    <form>
      <v-card-title class="title">Select a client to get started:</v-card-title>
      <v-card-text>
        <v-select
          :tab="0"
          :items="clientNames"
          label="Select a client"
          v-model="selectedClientName"
          autocomplete
          @keyup.enter.native="selectClient"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="!selectedClientName" primary bottom right @click.native="selectClient">Connect</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import {
    SELECT_CLIENT,
  } from '../store/types';

  export default {
    name: 'ClientSelect',
    data() {
      return {
        selectedClientName: null,
      };
    },
    computed: {
      ...mapGetters([
        'clientNames',
      ]),
    },
    methods: {
      ...mapActions({
        selectClientAction: SELECT_CLIENT,
      }),
      selectClient(e) {
        e.preventDefault();
        if (this.selectedClientName) {
          this.selectClientAction({ clientName: this.selectedClientName });
          this.$router.push('/shell');
        }
      },
    },
  };
</script>
