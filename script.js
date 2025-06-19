   document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const tabs = document.querySelectorAll('.tab');
            const formGroups = document.querySelectorAll('.form-group');
            const darkModeToggle = document.getElementById('darkModeToggle');
            const qrSize = document.getElementById('qrSize');
            const generateBtn = document.getElementById('generateBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const clearBtn = document.getElementById('clearBtn');
            const logoUpload = document.getElementById('logo-upload');
            const logoPreview = document.getElementById('logo-preview');
            const qrLogo = document.getElementById('qr-logo');
            const urlInput = document.getElementById('url');
            const urlError = document.getElementById('url-error');
            const successMessage = document.getElementById('success-message');
            
            // QR Code instance
            const qrcode = new QRCode(document.getElementById('qrcode'), {
                width: parseInt(qrSize.value),
                height: parseInt(qrSize.value)
            });
            
            // State variables
            let currentQR = null;
            let currentTab = 'url';
            let logoDataUrl = null;
            
            // Initialize
            checkDarkModePreference();
            
            // Event Listeners
            
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    currentTab = this.dataset.tab;
                    
                    formGroups.forEach(group => {
                        group.classList.remove('active');
                        if (group.id === `${currentTab}-form`) {
                            group.classList.add('active');
                        }
                    });
                });
            });
            
            // Dark mode toggle
            darkModeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
            });
            
            // QR size change
            qrSize.addEventListener('change', function() {
                if (currentQR) {
                    generateQRCode();
                }
            });
            
            // Logo upload
            logoUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        logoDataUrl = event.target.result;
                        logoPreview.innerHTML = `<img src="${logoDataUrl}" alt="Logo">`;
                        if (currentQR) {
                            updateQRLogo();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Generate QR code
            generateBtn.addEventListener('click', function() {
                if (!validateInputs()) return;
                
                generateQRCode();
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            });
            
            // Download QR code
            downloadBtn.addEventListener('click', function() {
                if (!currentQR) return;
                
                const canvas = document.querySelector('#qrcode canvas');
                const dataURL = canvas.toDataURL('image/png');
                
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `qr-code-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
            
            // Clear all
            clearBtn.addEventListener('click', function() {
                clearAll();
            });
            
            // URL validation
            urlInput.addEventListener('input', function() {
                if (this.value && !isValidUrl(this.value)) {
                    urlError.style.display = 'block';
                } else {
                    urlError.style.display = 'none';
                }
            });
            
            // Functions
            
            function checkDarkModePreference() {
                if (localStorage.getItem('darkMode') === 'enabled') {
                    document.body.classList.add('dark-mode');
                }
            }
            
            function isValidUrl(string) {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            }
            
            function validateInputs() {
                if (currentTab === 'url' && urlInput.value && !isValidUrl(urlInput.value)) {
                    urlError.style.display = 'block';
                    return false;
                }
                
                // Basic validation for other tabs
                switch(currentTab) {
                    case 'url':
                        if (!urlInput.value) {
                            alert('Please enter a URL');
                            return false;
                        }
                        break;
                    case 'contact':
                        if (!document.getElementById('contact-name').value && 
                            !document.getElementById('contact-phone').value && 
                            !document.getElementById('contact-email').value) {
                            alert('Please enter at least one contact detail');
                            return false;
                        }
                        break;
                    case 'wifi':
                        if (!document.getElementById('wifi-ssid').value) {
                            alert('Please enter a WiFi network name');
                            return false;
                        }
                        break;
                    case 'sms':
                        if (!document.getElementById('sms-number').value) {
                            alert('Please enter a phone number');
                            return false;
                        }
                        break;
                    case 'email':
                        if (!document.getElementById('email-address').value) {
                            alert('Please enter an email address');
                            return false;
                        }
                        break;
                    case 'text':
                        if (!document.getElementById('text-content').value) {
                            alert('Please enter some text');
                            return false;
                        }
                        break;
                }
                
                return true;
            }
            
            function generateQRCode() {
                let qrContent = '';
                
                switch(currentTab) {
                    case 'url':
                        qrContent = document.getElementById('url').value;
                        break;
                    case 'contact':
                        const contact = {
                            name: document.getElementById('contact-name').value,
                            tel: document.getElementById('contact-phone').value,
                            email: document.getElementById('contact-email').value,
                            address: document.getElementById('contact-address').value
                        };
                        qrContent = `BEGIN:VCARD\nVERSION:3.0\nN:${contact.name}\nTEL:${contact.tel}\nEMAIL:${contact.email}\nADR:${contact.address}\nEND:VCARD`;
                        break;
                    case 'wifi':
                        const wifi = {
                            ssid: document.getElementById('wifi-ssid').value,
                            password: document.getElementById('wifi-password').value,
                            security: document.getElementById('wifi-security').value
                        };
                        qrContent = `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};;`;
                        break;
                    case 'sms':
                        const sms = {
                            number: document.getElementById('sms-number').value,
                            message: document.getElementById('sms-message').value
                        };
                        qrContent = `SMSTO:${sms.number}:${sms.message}`;
                        break;
                    case 'email':
                        const email = {
                            address: document.getElementById('email-address').value,
                            subject: document.getElementById('email-subject').value,
                            body: document.getElementById('email-body').value
                        };
                        qrContent = `MATMSG:TO:${email.address};SUB:${email.subject};BODY:${email.body};;`;
                        break;
                    case 'text':
                        qrContent = document.getElementById('text-content').value;
                        break;
                }
                
                currentQR = qrContent;
                
                qrcode.clear();
                qrcode._htOption.width = parseInt(qrSize.value);
                qrcode._htOption.height = parseInt(qrSize.value);
                qrcode.makeCode(qrContent);
                
                if (logoDataUrl) {
                    updateQRLogo();
                }
                
                downloadBtn.disabled = false;
            }
            
            function updateQRLogo() {
                if (logoDataUrl) {
                    qrLogo.innerHTML = `<img src="${logoDataUrl}" alt="Logo">`;
                    qrLogo.style.display = 'flex';
                } else {
                    qrLogo.innerHTML = '';
                    qrLogo.style.display = 'none';
                }
            }
            
            function clearAll() {
                // Clear inputs based on current tab
                switch(currentTab) {
                    case 'url':
                        urlInput.value = '';
                        break;
                    case 'contact':
                        document.getElementById('contact-name').value = '';
                        document.getElementById('contact-phone').value = '';
                        document.getElementById('contact-email').value = '';
                        document.getElementById('contact-address').value = '';
                        break;
                    case 'wifi':
                        document.getElementById('wifi-ssid').value = '';
                        document.getElementById('wifi-password').value = '';
                        document.getElementById('wifi-security').value = 'WPA';
                        break;
                    case 'sms':
                        document.getElementById('sms-number').value = '';
                        document.getElementById('sms-message').value = '';
                        break;
                    case 'email':
                        document.getElementById('email-address').value = '';
                        document.getElementById('email-subject').value = '';
                        document.getElementById('email-body').value = '';
                        break;
                    case 'text':
                        document.getElementById('text-content').value = '';
                        break;
                }
                
                // Clear QR code
                qrcode.clear();
                currentQR = null;
                downloadBtn.disabled = true;
                
                // Clear logo
                logoDataUrl = null;
                logoPreview.innerHTML = '<span style="color: var(--secondary);">No logo</span>';
                qrLogo.innerHTML = '';
                qrLogo.style.display = 'none';
                logoUpload.value = '';
            }
        });
