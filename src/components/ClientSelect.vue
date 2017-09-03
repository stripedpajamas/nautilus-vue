<template>
  <v-card flat class="client-select">
    <form>
      <v-card-title class="title">Select a client to get started:</v-card-title>
      <v-card-text>
        <v-select
          :tab="0"
          :items="clientNames"
          label="Select a client"
          v-model="selectedClientName"
          @keyup.enter.native="selectClient"
          autocomplete
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="!selectedClientName" primary bottom right outline @click.native="selectClient">Connect</v-btn>
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
<style>
  .client-select {
    border-width: 1px;
    border-style: solid;
    border-color: rgba(0, 0, 0, .1);
  }
</style>
