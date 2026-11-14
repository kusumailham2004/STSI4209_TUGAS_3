Vue.component('order-form', {
  template: '#tpl-order',
  props: {
    paket: {
      type: Array,
      required: true
    },
    ekspedisi: {
      type: Array,
      required: true
    },
    stok: {
      type: Array,
      default: function () {
        return [];
      }
    },
    tracking: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      form: {
        nim: '',
        nama: '',
        ekspedisi: '',
        paketKode: '',
        tanggalKirim: this.getTodayIsoDate(),
        total: 0
      },
      errors: {},
      successMessage: ''
    };
  },
  watch: {
    // Watcher 3: Otomatis mengisi Total Harga saat paket bahan ajar dipilih
    'form.paketKode': function (newKode) {
      var selected = this.paket.find(function (p) {
        return p.kode === newKode;
      });
      this.form.total = selected ? selected.harga : 0;
    }
  },
  computed: {
    generatedDoNumber: function () {
      var year = new Date().getFullYear();
      var maxSeq = 0;
      var padLength = 4;

      this.tracking.forEach(function (entry) {
        var keys = Object.keys(entry);
        if (keys.length > 0) {
          var match = keys[0].match(/^DO(\d{4})-(\d+)$/);
          if (match) {
            year = match[1];
            padLength = match[2].length;
            var num = parseInt(match[2], 10);
            if (num > maxSeq) {
              maxSeq = num;
            }
          }
        }
      });

      var nextSeq = String(maxSeq + 1);
      while (nextSeq.length < padLength) {
        nextSeq = '0' + nextSeq;
      }
      return 'DO' + year + '-' + nextSeq;
    },

    selectedPaketObj: function () {
      var kode = this.form.paketKode;
      if (!kode) return null;
      return (
        this.paket.find(function (p) {
          return p.kode === kode;
        }) || null
      );
    }
  },
  methods: {
    getTodayIsoDate: function () {
      var now = new Date();
      var pad = function (n) {
        return n < 10 ? '0' + n : String(n);
      };
      return (
        now.getFullYear() +
        '-' +
        pad(now.getMonth() + 1) +
        '-' +
        pad(now.getDate())
      );
    },
    getJudulMatkul: function (kodeMk) {
      var found = this.stok.find(function (s) {
        return s.kode === kodeMk;
      });
      return found ? found.judul : 'Bahan Ajar UT';
    },
    validateOrder: function () {
      var errs = {};
      if (!this.form.nim) {
        errs.nim = 'NIM mahasiswa wajib diisi.';
      } else if (!/^\d{6,12}$/.test(this.form.nim)) {
        errs.nim = 'NIM harus berupa angka (6-12 digit).';
      }

      if (!this.form.nama || this.form.nama.length < 3) {
        errs.nama = 'Nama mahasiswa minimal 3 karakter.';
      }
      if (!this.form.ekspedisi) {
        errs.ekspedisi = 'Silakan pilih jasa ekspedisi.';
      }
      if (!this.form.paketKode) {
        errs.paketKode = 'Silakan pilih paket bahan ajar.';
      }
      if (!this.form.tanggalKirim) {
        errs.tanggalKirim = 'Tanggal kirim wajib diisi.';
      }

      this.errors = errs;
      return Object.keys(errs).length === 0;
    },
    submitOrder: function () {
      if (!this.validateOrder()) {
        return;
      }

      var noDO = this.generatedDoNumber;
      var now = new Date();
      var pad = function (n) {
        return n < 10 ? '0' + n : String(n);
      };
      var waktuAwal =
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
        pad(now.getSeconds());

      var newDoEntry = {};
      newDoEntry[noDO] = {
        nim: this.form.nim,
        nama: this.form.nama,
        status: 'Dalam Perjalanan',
        ekspedisi: this.form.ekspedisi,
        tanggalKirim: this.form.tanggalKirim,
        paket: this.form.paketKode,
        total: this.form.total,
        perjalanan: [
          {
            waktu: waktuAwal,
            keterangan: 'Pesanan diterima & diproses di Pusat Distribusi UT'
          }
        ]
      };

      this.$emit('created', { noDO: noDO, entry: newDoEntry });
      this.successMessage =
        'Delivery Order ' +
        noDO +
        ' atas nama ' +
        this.form.nama +
        ' berhasil ditambahkan!';
      this.resetForm(true);
    },
    resetForm: function (keepNotice) {
      this.form = {
        nim: '',
        nama: '',
        ekspedisi: '',
        paketKode: '',
        tanggalKirim: this.getTodayIsoDate(),
        total: 0
      };
      this.errors = {};
      if (!keepNotice) {
        this.successMessage = '';
      }
    }
  }
});
