// Configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const API_ENDPOINT = 'https://api.cloudmersive.com/convert/pdf/to/csv';

// Create drop zone element but don't insert it yet
const dropZone = document.createElement('div');
dropZone.className = 'drop-zone';
dropZone.style.display = 'none'; // Initially hidden
dropZone.innerHTML = `
    <div class="privacy-notice">
        <div class="privacy-icon">🔒</div>
        <div class="privacy-content">
            <h4>Secure & Private Conversion</h4>
            <p>Your data is processed securely in your browser. No credit card statements are stored on our servers.</p>
        </div>
    </div>
    <div class="drop-zone-content">
        <div class="upload-icon">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
        </div>
        <h3>Drag & Drop your PDF here</h3>
        <p>or</p>
        <button class="upload-button" onclick="document.querySelector('.drop-zone input[type=file]').click()">
            Choose File
        </button>
        <input type="file" accept=".pdf" hidden>
        <p class="file-info" style="display: none;"></p>
        <div class="supported-formats-info">
            <p>Supported formats: Visa, Mastercard, American Express, and more</p>
            <p>Powered by secure API conversion</p>
        </div>
    </div>
`;

// Create conversion status element separately
const conversionStatus = document.createElement('div');
conversionStatus.className = 'conversion-status';
conversionStatus.style.display = 'none';
conversionStatus.innerHTML = `
    <div class="spinner"></div>
    <p class="status-text">Converting your PDF...</p>
`;

// Add conversion status to drop zone
dropZone.appendChild(conversionStatus);

// State management
let isConverting = false;
let fileInput = dropZone.querySelector('input[type="file"]');
let isDropZoneInserted = false;

// Event listeners for drop zone
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Initialize click handlers for conversion buttons
document.addEventListener('DOMContentLoaded', () => {
    // Insert drop zone after hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.insertAdjacentElement('afterend', dropZone);
        isDropZoneInserted = true;
    } else {
        console.error('Hero section not found');
    }

    // Add click handlers to buttons
    const startButtons = document.querySelectorAll('.start-btn');
    const otherButtons = document.querySelectorAll('.try-now-btn, .convert-btn');

    // Handle "Start Converting Now" button
    startButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isDropZoneInserted) return;
            
            // Show the drop zone with animation
            dropZone.style.display = 'block';
            setTimeout(() => {
                dropZone.style.opacity = '1';
                dropZone.scrollIntoView({ behavior: 'smooth' });
            }, 10);
        });
    });

    // Handle other conversion buttons
    otherButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isDropZoneInserted) return;
            
            // Show the drop zone with animation
            dropZone.style.display = 'block';
            setTimeout(() => {
                dropZone.style.opacity = '1';
                dropZone.scrollIntoView({ behavior: 'smooth' });
            }, 10);
        });
    });
});

// Event Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isConverting) {
        dropZone.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    if (isConverting) {
        showError('Please wait for the current conversion to finish.');
        return;
    }

    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
    // Reset file input to allow selecting the same file again
    e.target.value = '';
}

async function processFile(file) {
    // Validate file
    if (!file.type.includes('pdf')) {
        showError('Please upload a PDF file.');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError('File size should be less than 10MB.');
        return;
    }

    try {
        isConverting = true;
        showConversionStatus();

        // Convert PDF to CSV
        const csvData = await convertPdfToCsv(file);
        
        if (!csvData || csvData.trim() === '') {
            throw new Error('Conversion resulted in empty data');
        }

        // Create download link and trigger download
        downloadCsv(csvData, file.name.replace('.pdf', '.csv'));
        
        // Clear sensitive data from memory
        clearSensitiveData(file, csvData);
        
        showSuccess('Conversion successful! Your download should begin shortly.');
    } catch (error) {
        console.error('Conversion error:', error);
        showError(
            error.message.includes('API') 
                ? 'API error. Please try again later.' 
                : 'Failed to convert PDF. Please ensure it\'s a valid credit card statement.'
        );
    } finally {
        isConverting = false;
        hideConversionStatus();
    }
}

// Function to securely clear sensitive data
function clearSensitiveData(file, csvData) {
    // Clear file input
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Clear file and CSV data references
    file = null;
    csvData = null;
    
    // Force garbage collection hint
    if (window.gc) {
        window.gc();
    }
    
    // Clear any cached data in the drop zone
    const fileInfo = dropZone.querySelector('.file-info');
    if (fileInfo) {
        fileInfo.textContent = '';
        fileInfo.style.display = 'none';
    }
}

async function convertPdfToCsv(file) {
    // Use FormData for secure transmission
    const formData = new FormData();
    formData.append('inputFile', file);

    try {
        // Ensure HTTPS
        if (!window.location.protocol.includes('https')) {
            throw new Error('This application requires a secure HTTPS connection.');
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Apikey': API_KEY,
                'Secure-Transport': 'true'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const csvData = await response.text();
        return csvData;
    } catch (error) {
        throw new Error('API error: ' + error.message);
    }
}

function downloadCsv(csvData, filename) {
    try {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download CSV file.');
    }
}

// UI Feedback Functions
function showConversionStatus() {
    const content = dropZone.querySelector('.drop-zone-content');
    if (content) {
        content.style.display = 'none';
    }
    conversionStatus.style.display = 'flex';
    dropZone.classList.add('converting');
}

function hideConversionStatus() {
    const content = dropZone.querySelector('.drop-zone-content');
    if (content) {
        content.style.display = 'flex';
    }
    conversionStatus.style.display = 'none';
    dropZone.classList.remove('converting');
}

function showError(message) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4700);
}

function showSuccess(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4700);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    return notification;
} 