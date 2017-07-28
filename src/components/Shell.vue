<template>
  <div class="shell">
    <v-card class="shell__output">
      <v-card-text>{{ selectedClient.domain }}</v-card-text>
    </v-card>
    <v-text-field
      class="shell__input"
      prepend-icon="label"
      single-line
      autofocus
      label="Command"
    ></v-text-field>
  </div>
</template>
<script>
  import { mapState } from 'vuex';

  export default {
    name: 'Shell',
    computed: {
      ...mapState({
        selectedClient: state => state.client.selectedClient,
      }),
    },
  };
</script>

<style lang="scss">
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 88vh;
    &__output {
      flex: 1;
    }
    &__input {
      flex: 0;
    }
  }
</style>
