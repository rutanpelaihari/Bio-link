/**
 * Rutan Pelaihari Bio Link
 * Script for handling all interactive features
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize feather icons
  feather.replace();
  
  // Initialize AOS animations with custom settings
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic',
    delay: 100
  });
  
  // Set today's date as default for tanggalPenahanan input
  setDefaultDate();
  
  // Set default values for all inputs
  initializeFormValues();
  
  // Add event listeners for the calculator
  setupCalculatorListeners();
  
  // Add smooth scrolling for all anchor links
  setupSmoothScrolling();
});

/**
 * Set today's date as the default date in the form
 */
function setDefaultDate() {
  const today = new Date();
  const formattedDate = today.toISOString().substr(0, 10);
  document.getElementById('tanggalPenahanan').value = formattedDate;
}

/**
 * Initialize all form input values with defaults
 */
function initializeFormValues() {
  document.getElementById('vonisTahun').value = "0";
  document.getElementById('vonisBulan').value = "0";
  document.getElementById('vonisHari').value = "0";
  document.getElementById('remisiBulan').value = "0";
  document.getElementById('remisiHari').value = "0";
}

/**
 * Setup event listeners for the expiration calculator
 */
function setupCalculatorListeners() {
  // Add event listener for Hitung button
  document.getElementById('hitungButton').addEventListener('click', hitungExpirasi);
  
  // Add validation for numeric inputs
  const vonisInputs = document.querySelectorAll('#vonisTahun, #vonisBulan, #vonisHari, #remisiBulan, #remisiHari');
  vonisInputs.forEach(input => {
    input.addEventListener('input', function() {
      // Ensure values are non-negative
      if (parseInt(this.value) < 0 || isNaN(parseInt(this.value))) {
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
}

/**
 * Add smooth scrolling for all anchor links
 */
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Main function to calculate expiration dates based on detention date, sentence, and remission
 */
function hitungExpirasi() {
  // Show loading state
  showLoading();
  
  // Get values from the form with validation
  const tanggalPenahanan = new Date(document.getElementById('tanggalPenahanan').value);
  const vonisTahun = parseInt(document.getElementById('vonisTahun').value) || 0;
  const vonisBulan = parseInt(document.getElementById('vonisBulan').value) || 0;
  const vonisHari = parseInt(document.getElementById('vonisHari').value) || 0;
  const remisiBulan = parseInt(document.getElementById('remisiBulan').value) || 0;
  const remisiHari = parseInt(document.getElementById('remisiHari').value) || 0;
  
  // Validate inputs - date must be valid
  if (isNaN(tanggalPenahanan.getTime())) {
    showErrorMessage('Tanggal penahanan tidak valid');
    hideLoading();
    return;
  }
  
  // Validate inputs - at least some sentence duration must be provided
  if (vonisTahun === 0 && vonisBulan === 0 && vonisHari === 0) {
    showErrorMessage('Mohon masukkan durasi vonis');
    hideLoading();
    return;
  }
  
  // Calculate total sentence and remission in days
  const totalVonisHari = (vonisTahun * 365) + (vonisBulan * 30) + vonisHari;
  const totalRemisiHari = (remisiBulan * 30) + remisiHari;
  
  // Validate that remission is not greater than sentence
  if (totalRemisiHari >= totalVonisHari) {
    showErrorMessage('Remisi tidak boleh sama dengan atau lebih besar dari vonis');
    hideLoading();
    return;
  }
  
  // Simulate delay for calculation (for UI feedback)
  setTimeout(() => {
    performCalculations(tanggalPenahanan, totalVonisHari, totalRemisiHari);
    hideLoading();
  }, 800);
}

/**
 * Perform all the sentence date calculations
 * @param {Date} tanggalPenahanan - Date of detention
 * @param {number} totalVonisHari - Total sentence in days
 * @param {number} totalRemisiHari - Total remission in days
 */
function performCalculations(tanggalPenahanan, totalVonisHari, totalRemisiHari) {
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
  
  // Convert 2/3 sentence to years, months and days
  const duaPerTigaVonisTahun = Math.floor(duaPerTigaVonisHari / 365);
  const duaPerTigaVonisSisaHari = duaPerTigaVonisHari % 365;
  const duaPerTigaVonisBulan = Math.floor(duaPerTigaVonisSisaHari / 30);
  const duaPerTigaVonisSisaHariSetelahBulan = duaPerTigaVonisSisaHari % 30;
  
  // Create formatted text for 2/3 sentence
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
  showResults();
}

/**
 * Show loading spinner on the calculate button
 */
function showLoading() {
  const button = document.getElementById('hitungButton');
  const originalContent = button.innerHTML;
  
  // Store original content
  button.setAttribute('data-original-content', originalContent);
  
  // Replace with loading spinner
  button.innerHTML = '<div class="loading"><div></div><div></div><div></div></div> Menghitung...';
  button.disabled = true;
}

/**
 * Hide loading spinner and restore button
 */
function hideLoading() {
  const button = document.getElementById('hitungButton');
  const originalContent = button.getAttribute('data-original-content');
  
  // Restore original content
  if (originalContent) {
    button.innerHTML = originalContent;
  }
  
  button.disabled = false;
}

/**
 * Show the results container with animation
 */
function showResults() {
  const hasilElement = document.getElementById('hasilExpirasi');
  
  // Hide first (reset any existing display)
  hasilElement.style.display = 'none';
  
  // Force browser reflow
  void hasilElement.offsetWidth;
  
  // Show with animation
  hasilElement.style.display = 'block';
  hasilElement.classList.remove('fade-in');
  
  // Force browser reflow again
  void hasilElement.offsetWidth;
  
  // Add animation class
  hasilElement.classList.add('fade-in');
  
  // Scroll to results
  setTimeout(() => {
    hasilElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
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
  // Remove any existing error
  const existingError = document.getElementById('errorAlert');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error alert
  const errorAlert = document.createElement('div');
  errorAlert.id = 'errorAlert';
  errorAlert.className = 'alert alert-danger mt-3';
  errorAlert.role = 'alert';
  
  // Add error message with icon
  errorAlert.innerHTML = `<i data-feather="alert-circle"></i> <span class="ms-2">${message}</span>`;
  
  // Add dismiss button
  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.className = 'btn-close';
  dismissButton.setAttribute('data-bs-dismiss', 'alert');
  dismissButton.setAttribute('aria-label', 'Close');
  dismissButton.innerHTML = '&times;';
  
  // Add click event to dismiss button
  dismissButton.addEventListener('click', function() {
    errorAlert.remove();
  });
  
  errorAlert.appendChild(dismissButton);
  
  // Insert before results container
  const formElement = document.getElementById('expirasiForm');
  formElement.parentNode.insertBefore(errorAlert, formElement.nextSibling);
  
  // Re-initialize feather icons for the new alert
  feather.replace();
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorAlert)) {
      errorAlert.classList.add('fade-out');
      setTimeout(() => {
        if (document.body.contains(errorAlert)) {
          errorAlert.remove();
        }
      }, 500);
    }
  }, 5000);
}
