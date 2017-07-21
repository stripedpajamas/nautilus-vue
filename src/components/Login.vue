<template>
  <v-layout>
    <v-flex xs12 sm6 offset-sm3 class="pt-4">
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
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    name: 'Login',
  };
</script>
