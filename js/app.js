
// 1. Format Currency Rupiah (Contoh: 65000 -> Rp 65.000)
Vue.filter('rupiah', function (value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0';
  }
  return 'Rp ' + Number(value).toLocaleString('id-ID');
});

// 2. Format Satuan Buah (Contoh: 28 -> 28 buah)
Vue.filter('satuanBuah', function (value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 buah';
  }
  return Number(value) + ' buah';
});

// 3. Format Tanggal Indonesia (Contoh: 2025-08-25 -> 25 Agustus 2025)
Vue.filter('formatTanggal', function (isoDate) {
  if (!isoDate) return '-';
  var bulanNama = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];
  var parts = String(isoDate).split('-');
  if (parts.length !== 3) return isoDate;
  var tahun = parts[0];
  var bulanIdx = parseInt(parts[1], 10) - 1;
  var tanggal = parseInt(parts[2], 10);
  return tanggal + ' ' + (bulanNama[bulanIdx] || parts[1]) + ' ' + tahun;
});

new Vue({
  el: '#app',
  data: {
    tab: 'stok',
    isLoading: true,
    state: {
      upbjjList: [],
      kategoriList: [],
      pengirimanList: [],
      paket: [],
      stok: [],
      tracking: []
    }
  },
  async created() {
    const data = await window.ApiService.fetchBahanAjar();
    this.state = data;
    this.isLoading = false;
  },
  methods: {
    confirmDeleteStock: function (item) {
      var self = this;
      this.$refs.modal.open({
        title: 'Hapus Data Bahan Ajar',
        message: 'Apakah Anda yakin ingin menghapus data bahan ajar berikut?',
        detail: item.kode + ' — ' + item.judul + ' (' + item.upbjj + ')',
        onConfirm: function () {
          var idx = self.state.stok.findIndex(function (s) {
            return s.kode === item.kode;
          });
          if (idx !== -1) {
            self.state.stok.splice(idx, 1);
          }
        }
      });
    },
    handleNewDO: function (payload) {
      this.state.tracking.push(payload.entry);
      this.tab = 'tracking';
    }
  }
});
