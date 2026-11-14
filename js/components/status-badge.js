Vue.component('status-badge', {
  template: '#tpl-badge',
  props: {
    qty: {
      type: Number,
      required: true
    },
    safety: {
      type: Number,
      required: true
    }
  },
  computed: {
    statusInfo: function () {
      if (this.qty === 0) {
        return {
          label: 'Kosong',
          icon: '⛔',
          className: 'badge-danger'
        };
      } else if (this.qty < this.safety) {
        return {
          label: 'Menipis',
          icon: '⚠️',
          className: 'badge-warn'
        };
      } else {
        return {
          label: 'Aman',
          icon: '✅',
          className: 'badge-safe'
        };
      }
    }
  }
});
