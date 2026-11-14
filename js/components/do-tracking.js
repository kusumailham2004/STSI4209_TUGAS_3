Vue.component('do-tracking', {
  template: '#tpl-tracking',
  props: {
    data: {
      type: Array,
      required: true
    },
    paketList: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      searchInput: '',
      activeQuery: '',
      progressInputs: {},
      progressErrors: {}
    };
  },
  computed: {
    filteredTrackingList: function () {
      var q = this.activeQuery.toLowerCase();
      if (!q) {
        return this.data;
      }
      return this.data.filter(function (doObj) {
        var keys = Object.keys(doObj);
        if (keys.length === 0) return false;
        var noDO = keys[0];
        var detail = doObj[noDO];
        return (
          noDO.toLowerCase().indexOf(q) !== -1 ||
          String(detail.nim).toLowerCase().indexOf(q) !== -1
        );
      });
    }
  },
  methods: {
    applySearch: function () {
      this.activeQuery = this.searchInput.trim();
    },
    resetSearch: function () {
      this.searchInput = '';
      this.activeQuery = '';
    },
    getPaketName: function (kodePaket) {
      var found = this.paketList.find(function (p) {
        return p.kode === kodePaket;
      });
      return found ? found.nama : '-';
    },
    formatCurrentTimestamp: function () {
      var now = new Date();
      var pad = function (n) {
        return n < 10 ? '0' + n : String(n);
      };
      return (
        now.getFullYear() +
        '-' +
        pad(now.getMonth() + 1) +
        '-' +
        pad(now.getDate()) +
        ' ' +
        pad(now.getHours()) +
        ':' +
        pad(now.getMinutes()) +
        ':' +
        pad(now.getSeconds())
      );
    },
    addProgress: function (detail, noDO) {
      var text = (this.progressInputs[noDO] || '').trim();
      if (!text) {
        Vue.set(
          this.progressErrors,
          noDO,
          'Keterangan status perjalanan tidak boleh kosong.'
        );
        return;
      }

      Vue.set(this.progressErrors, noDO, '');
      detail.perjalanan.push({
        waktu: this.formatCurrentTimestamp(),
        keterangan: text
      });
      Vue.set(this.progressInputs, noDO, '');
    }
  }
});
