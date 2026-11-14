Vue.component('ba-stock-table', {
  template: '#tpl-stock',
  props: {
    items: {
      type: Array,
      required: true
    },
    upbjjList: {
      type: Array,
      default: function () {
        return [];
      }
    },
    kategoriList: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      filterUpbjj: '',
      filterKategori: '',
      onlyReorder: false,
      sortBy: 'judul',
      sortDir: 'asc',
      hoveredKode: null,
      watcherNotice: '',

      // State Form Create / Update
      showForm: false,
      isEditMode: false,
      form: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ''
      },
      errors: {}
    };
  },
  watch: {
    // Watcher 1: Reset dependent filter kategori ketika UT-Daerah berubah
    filterUpbjj: function (newVal) {
      this.filterKategori = '';
      if (newVal) {
        this.watcherNotice =
          'Filter UT-Daerah aktif: ' +
          newVal +
          '. Opsi filter Kategori Mata Kuliah kini tersedia.';
      } else {
        this.watcherNotice = '';
      }
    },
    // Watcher 2: Memantau aktivasi filter pengingat re-order
    onlyReorder: function (isActive) {
      if (isActive) {
        this.watcherNotice =
          'Mode pengingat Re-order aktif: hanya menampilkan bahan ajar dengan stok < safety stok atau stok = 0.';
      } else if (!this.filterUpbjj) {
        this.watcherNotice = '';
      }
    }
  },
  computed: {
    // Dependent options kategori berdasarkan UT-Daerah yang dipilih
    availableKategoriOptions: function () {
      if (!this.filterUpbjj) {
        return [];
      }
      var kategoriSet = {};
      this.items.forEach(function (item) {
        if (item.upbjj === this.filterUpbjj) {
          kategoriSet[item.kategori] = true;
        }
      }, this);

      var dynamicList = Object.keys(kategoriSet);
      return dynamicList.length > 0 ? dynamicList : this.kategoriList;
    },

    // Computed filtering & sorting (cached otomatis oleh Vue)
    filteredStok: function () {
      var self = this;
      var result = this.items.filter(function (item) {
        var matchUpbjj = !self.filterUpbjj || item.upbjj === self.filterUpbjj;
        var matchKategori =
          !self.filterKategori || item.kategori === self.filterKategori;
        var matchReorder =
          !self.onlyReorder || item.qty < item.safety || item.qty === 0;
        return matchUpbjj && matchKategori && matchReorder;
      });

      var factor = this.sortDir === 'asc' ? 1 : -1;
      return result.slice().sort(function (a, b) {
        if (self.sortBy === 'judul') {
          return a.judul.localeCompare(b.judul) * factor;
        }
        return (a[self.sortBy] - b[self.sortBy]) * factor;
      });
    },

    summary: function () {
      var stats = { total: this.items.length, aman: 0, menipis: 0, kosong: 0 };
      this.items.forEach(function (item) {
        if (item.qty === 0) {
          stats.kosong++;
        } else if (item.qty < item.safety) {
          stats.menipis++;
        } else {
          stats.aman++;
        }
      });
      return stats;
    }
  },
  methods: {
    resetFilters: function () {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.onlyReorder = false;
      this.sortBy = 'judul';
      this.sortDir = 'asc';
      this.watcherNotice = '';
    },
    openCreateForm: function () {
      this.isEditMode = false;
      this.errors = {};
      this.form = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ''
      };
      this.showForm = true;
    },
    openEditForm: function (item) {
      this.isEditMode = true;
      this.errors = {};
      this.form = Object.assign({}, item);
      this.showForm = true;
    },
    closeForm: function () {
      this.showForm = false;
      this.errors = {};
    },
    validateForm: function () {
      var errs = {};
      if (!this.form.kode) {
        errs.kode = 'Kode mata kuliah wajib diisi.';
      } else if (!this.isEditMode) {
        var exists = this.items.some(
          function (it) {
            return it.kode.toUpperCase() === this.form.kode.toUpperCase();
          },
          this
        );
        if (exists) {
          errs.kode = 'Kode mata kuliah sudah terdaftar.';
        }
      }

      if (!this.form.judul) {
        errs.judul = 'Nama mata kuliah wajib diisi.';
      }
      if (!this.form.kategori) {
        errs.kategori = 'Kategori wajib dipilih.';
      }
      if (!this.form.upbjj) {
        errs.upbjj = 'UT-Daerah wajib dipilih.';
      }
      if (!this.form.lokasiRak) {
        errs.lokasiRak = 'Lokasi rak wajib diisi.';
      }
      if (this.form.harga === '' || this.form.harga <= 0) {
        errs.harga = 'Harga harus lebih dari 0.';
      }
      if (this.form.qty === '' || this.form.qty < 0) {
        errs.qty = 'Jumlah stok tidak boleh negatif.';
      }
      if (this.form.safety === '' || this.form.safety < 0) {
        errs.safety = 'Safety stok tidak boleh negatif.';
      }

      this.errors = errs;
      return Object.keys(errs).length === 0;
    },
    submitForm: function () {
      if (!this.validateForm()) {
        return;
      }

      var payload = {
        kode: this.form.kode.toUpperCase(),
        judul: this.form.judul,
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak.toUpperCase(),
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
        catatanHTML: this.form.catatanHTML
      };

      if (this.isEditMode) {
        var idx = this.items.findIndex(function (it) {
          return it.kode === payload.kode;
        });
        if (idx !== -1) {
          Vue.set(this.items, idx, payload);
        }
      } else {
        this.items.push(payload);
      }

      this.closeForm();
    }
  }
});
