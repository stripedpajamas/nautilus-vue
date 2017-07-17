<template>
  <v-card>
    <v-card-title class="headline">
      Login to access Nautilus:
    </v-card-title>
    <v-card-text>
      <v-text-field label="Username"></v-text-field>
      <v-text-field label="Password" type="password"></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn primary large right bottom>Submit</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
  export default {
    name: 'Login',
  };
</script>
