// Configuration
// IMPORTANT: API Key Management - The API key should NOT be stored here in client-side code.
// This is a major security risk. A backend service is required to securely handle the API key and make API calls.
// const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key - DO NOT UNCOMMENT IN FRONTEND
const API_ENDPOINT = 'https://api.cloudmersive.com/convert/pdf/to/csv'; // This might also be handled by the backend

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

        // --- PDF Conversion Logic (Requires Backend Implementation) ---
        // The following code attempts to call the Cloudmersive API directly from the frontend.
        // This is insecure due to API key exposure. This functionality needs to be moved to a backend service.
        // The frontend should securely send the file to your backend, which then calls the Cloudmersive API.

        /*
        // Convert PDF to CSV - THIS SHOULD BE DONE ON A BACKEND
        const csvData = await convertPdfToCsv(file); // DO NOT CALL THIS FROM FRONTEND

        if (!csvData || csvData.trim() === '') {
            throw new Error('Conversion resulted in empty data');
        }

        // Create download link and trigger download
        downloadCsv(csvData, file.name.replace('.pdf', '.csv'));

        // Update conversion count in database
        await updateConversionCount();

        // Update dashboard if we're on the same domain
        updateDashboardStats();

        // Clear sensitive data from memory
        clearSensitiveData(file, csvData);

        showSuccess('Conversion successful! Your download should begin shortly.');
        */

        // Placeholder for demonstrating UI without actual conversion
        console.warn("PDF conversion via frontend API call is disabled due to security risks. Backend implementation required.");
        showError("PDF conversion is currently disabled. Backend implementation needed.");
        // --- End of Backend Requirement Section ---

    } catch (error) {
        console.error('Processing error:', error);
        showError('Failed to process PDF. Please try again later.'); // Generic error as conversion is disabled
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

// --- Backend Required Function ---
// This function makes a direct call to the Cloudmersive API using a key stored in the frontend.
// It MUST be removed or refactored to call your own backend service instead.
/*
async function convertPdfToCsv(file) {
    // Use FormData for secure transmission
    const formData = new FormData();
    formData.append('inputFile', file);

    try {
        // Ensure HTTPS - Good practice, but main issue is API key exposure
        if (!window.location.protocol.includes('https')) {
            // Consider allowing HTTP for local development if needed, but enforce HTTPS in production.
            console.warn('Attempting API call over HTTP. This might fail and is insecure.');
            // throw new Error('This application requires a secure HTTPS connection.');
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                // 'Apikey': API_KEY, // DO NOT INCLUDE API KEY HERE
                'Secure-Transport': 'true' // Example header, check API docs
                // Add any other required headers, potentially an auth token for *your* backend
            },
            body: formData
        });

        if (!response.ok) {
            // Provide more specific error feedback if possible
            const errorBody = await response.text();
            console.error("API Error Body:", errorBody);
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const csvData = await response.text();
        return csvData;
    } catch (error) {
        // Log the specific error for debugging
        console.error("convertPdfToCsv Error:", error);
        throw new Error('API call failed: ' + error.message);
    }
}
*/
// --- End of Backend Required Function ---


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

async function updateConversionCount() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update conversion count in the profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('conversion_count')
            .eq('user_id', user.id)
            .single();

        if (profileError) {
            console.error('Failed to fetch profile data:', profileError);
            return;
        }

        const currentCount = profileData ? profileData.conversion_count : 0;
        const newCount = currentCount + 1;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ conversion_count: newCount })
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Failed to update conversion count in profiles table:', updateError);
        } else {
            console.log('Conversion count updated successfully for user:', user.id, 'New count:', newCount);
        }

    } catch (error) {
        console.error('Failed to update conversion count:', error);
    }
}

function updateDashboardStats() {
    // Update dashboard stats if the dashboard is open
    if (window.updateUsageStats) {
        window.updateUsageStats();
    }
}
