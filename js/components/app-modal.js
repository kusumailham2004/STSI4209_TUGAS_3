Vue.component('app-modal', {
  template: '#tpl-modal',
  data: function () {
    return {
      visible: false,
      title: 'Konfirmasi Penghapusan',
      message: '',
      detail: '',
      onConfirmCallback: null
    };
  },
  methods: {
    open: function (options) {
      this.title = options.title || 'Konfirmasi';
      this.message = options.message || 'Apakah Anda yakin ingin melanjutkan?';
      this.detail = options.detail || '';
      this.onConfirmCallback = options.onConfirm || null;
      this.visible = true;
    },
    close: function () {
      this.visible = false;
      this.onConfirmCallback = null;
    },
    confirm: function () {
      if (typeof this.onConfirmCallback === 'function') {
        this.onConfirmCallback();
      }
      this.close();
    }
  }
});
