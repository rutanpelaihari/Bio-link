// Initialize feather icons
document.addEventListener('DOMContentLoaded', function() {
  // Initialize feather icons
  feather.replace();
  
  // Initialize AOS animations
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: 'ease-in-out'
  });
  
  // Set today's date as default for tanggalPenahanan input
  const today = new Date();
  const formattedDate = today.toISOString().substr(0, 10);
  document.getElementById('tanggalPenahanan').value = formattedDate;
  
  // Set default values for inputs
  document.getElementById('vonisTahun').value = "0";
  document.getElementById('vonisBulan').value = "0";
  document.getElementById('vonisHari').value = "0";
  document.getElementById('remisiBulan').value = "0";
  document.getElementById('remisiHari').value = "0";
  
  // Add event listener for Hitung button
  document.getElementById('hitungButton').addEventListener('click', hitungExpirasi);
  
  // Add validation for inputs
  const vonisInputs = document.querySelectorAll('#vonisTahun, #vonisBulan, #vonisHari, #remisiBulan, #remisiHari');
  vonisInputs.forEach(input => {
    input.addEventListener('input', function() {
      // Ensure values are non-negative
      if (parseInt(this.value) < 0) {
        this.value = "0";
      }
      
      // Ensure bulan is 0-11
      if (this.id === 'vonisBulan' && parseInt(this.value) > 11) {
        this.value = "11";
      }
      
      // Ensure hari is 0-30
      if ((this.id === 'vonisHari' || this.id === 'remisiHari') && parseInt(this.value) > 30) {
        this.value = "30";
      }
    });
  });
});

/**
 * Function to calculate expiration dates based on detention date, sentence, and remission
 */
function hitungExpirasi() {
  // Get values from the form
  const tanggalPenahanan = new Date(document.getElementById('tanggalPenahanan').value);
  const vonisTahun = parseInt(document.getElementById('vonisTahun').value) || 0;
  const vonisBulan = parseInt(document.getElementById('vonisBulan').value) || 0;
  const vonisHari = parseInt(document.getElementById('vonisHari').value) || 0;
  const remisiBulan = parseInt(document.getElementById('remisiBulan').value) || 0;
  const remisiHari = parseInt(document.getElementById('remisiHari').value) || 0;
  
  // Validate inputs - at least some sentence duration must be provided
  if (vonisTahun === 0 && vonisBulan === 0 && vonisHari === 0) {
    showErrorMessage('Mohon masukkan durasi vonis');
    return;
  }
  
  // Validate that remission is not greater than sentence
  const totalVonisHari = (vonisTahun * 365) + (vonisBulan * 30) + vonisHari;
  const totalRemisiHari = (remisiBulan * 30) + remisiHari;
  
  if (totalRemisiHari >= totalVonisHari) {
    showErrorMessage('Remisi tidak boleh sama dengan atau lebih besar dari vonis');
    return;
  }
  
  // Calculate remaining sentence after remission
  const sisaVonisHari = totalVonisHari - totalRemisiHari;
  
  // Calculate 1/3, 1/2, and 2/3 sentence
  const satuPerTigaVonisHari = Math.floor(totalVonisHari * (1/3));
  const satuPerDuaVonisHari = Math.floor(totalVonisHari * (1/2));
  const duaPerTigaVonisHari = Math.floor(totalVonisHari * (2/3));
  
  // Calculate dates
  const tanggalSatuPerTiga = new Date(tanggalPenahanan);
  tanggalSatuPerTiga.setDate(tanggalSatuPerTiga.getDate() + satuPerTigaVonisHari);
  
  const tanggalSatuPerDua = new Date(tanggalPenahanan);
  tanggalSatuPerDua.setDate(tanggalSatuPerDua.getDate() + satuPerDuaVonisHari);
  
  const tanggalDuaPerTigaPidana = new Date(tanggalPenahanan);
  tanggalDuaPerTigaPidana.setDate(tanggalDuaPerTigaPidana.getDate() + duaPerTigaVonisHari);
  
  // Calculate pure expiration date
  const tanggalExpirasiMurni = new Date(tanggalPenahanan);
  tanggalExpirasiMurni.setDate(tanggalExpirasiMurni.getDate() + sisaVonisHari);
  
  // Format dates for display
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Display results
  document.getElementById('tanggalSatuPerTiga').textContent = formatDate(tanggalSatuPerTiga, options);
  document.getElementById('tanggalSatuPerDua').textContent = formatDate(tanggalSatuPerDua, options);
  
  // Convert 2/3 sentence to years and months
  const duaPerTigaVonisTahun = Math.floor(duaPerTigaVonisHari / 365);
  const duaPerTigaVonisSisaHari = duaPerTigaVonisHari % 365;
  const duaPerTigaVonisBulan = Math.floor(duaPerTigaVonisSisaHari / 30);
  const duaPerTigaVonisSisaHariSetelahBulan = duaPerTigaVonisSisaHari % 30;
  
  let duaPerTigaVonisText = '';
  if (duaPerTigaVonisTahun > 0) {
    duaPerTigaVonisText += `${duaPerTigaVonisTahun} Tahun`;
  }
  if (duaPerTigaVonisBulan > 0) {
    duaPerTigaVonisText += `${duaPerTigaVonisText ? ', ' : ''}${duaPerTigaVonisBulan} Bulan`;
  }
  if (duaPerTigaVonisSisaHariSetelahBulan > 0) {
    duaPerTigaVonisText += `${duaPerTigaVonisText ? ', ' : ''}${duaPerTigaVonisSisaHariSetelahBulan} Hari`;
  }
  
  document.getElementById('duaPerTigaVonis').textContent = duaPerTigaVonisText || '0 Hari';
  document.getElementById('tanggalDuaPerTigaPidana').textContent = formatDate(tanggalDuaPerTigaPidana, options);
  document.getElementById('tanggalExpirasiMurni').textContent = formatDate(tanggalExpirasiMurni, options);
  
  // Show results with animation
  const hasilElement = document.getElementById('hasilExpirasi');
  hasilElement.style.display = 'block';
  hasilElement.classList.add('fade-in');
}

/**
 * Format date using Indonesian locale
 * @param {Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
function formatDate(date, options) {
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  // Create error alert or use existing one
  let errorAlert = document.getElementById('errorAlert');
  
  if (!errorAlert) {
    errorAlert = document.createElement('div');
    errorAlert.id = 'errorAlert';
    errorAlert.className = 'alert alert-danger mt-3';
    errorAlert.role = 'alert';
    
    // Add dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.className = 'btn-close';
    dismissButton.setAttribute('data-bs-dismiss', 'alert');
    dismissButton.setAttribute('aria-label', 'Close');
    
    errorAlert.appendChild(dismissButton);
    
    // Insert before results container
    const formElement = document.getElementById('expirasiForm');
    formElement.parentNode.insertBefore(errorAlert, formElement.nextSibling);
  }
  
  errorAlert.innerHTML = `<i data-feather="alert-circle"></i> ${message}`;
  
  // Re-initialize feather icons for the new alert
  feather.replace();
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    errorAlert.remove();
  }, 5000);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
