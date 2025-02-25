document.getElementById('complaintForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  // Kirim data ke email menggunakan API atau layanan lain
  alert('Pengaduan berhasil dikirim!');
});
