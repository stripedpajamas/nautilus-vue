<template>
  <v-snackbar transition="slide-y-transition"
              top :timeout="0"
              :success="successColor"
              :error="errorColor"
              v-model="showNotification">
    {{ error || success }}
  </v-snackbar>
</template>
<script>
  import { mapState, mapActions } from 'vuex';
  import { CLEAR_ERROR, CLEAR_SUCCESS } from '../../store/types';

  export default {
    name: 'Notification',
    data() {
      return {
        showNotification: false,
      };
    },
    watch: {
      error() {
        this.fireNotification();
      },
      success() {
        this.fireNotification();
      },
    },
    computed: {
      ...mapState({
        error: state => state.main.error,
        success: state => state.main.success,
      }),
      errorColor() {
        return !!this.error;
      },
      successColor() {
        return !!this.success;
      },
    },
    methods: {
      ...mapActions({
        clearError: CLEAR_ERROR,
        clearSuccess: CLEAR_SUCCESS,
      }),
      fireNotification() {
        if (this.error || this.success) {
          this.showNotification = true;
          setTimeout(() => {
            this.showNotification = false;
            if (this.error) this.clearError();
            if (this.success) this.clearSuccess();
          }, 3000);
        }
      },
    },
  };
</script>
