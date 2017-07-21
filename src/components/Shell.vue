<template>
  <div class="shell">
    <v-card class="shell__output">
      <v-card-text>Command output goes here</v-card-text>
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
  export default {
    name: 'Shell',
  };
</script>

<style lang="scss">
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 84vh;
    &__output {
      flex: 1;
    }
    &__input {
      flex: 0;
    }
  }
</style>
