document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const dropzone = document.getElementById('dropzone');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const errorMsg = document.getElementById('error-msg');
    const lowConfidenceMsg = document.getElementById('low-confidence-warning');
    const manualFix = document.getElementById('manual-fix-section');
    const resetBtn = document.getElementById('reset-btn');

    // UI Elements
    const foodNameEl = document.getElementById('food-name');
    const categoryEl = document.getElementById('food-category');
    const confidenceScoreEl = document.getElementById('confidence-score');
    const confidenceFillEl = document.getElementById('confidence-fill');
    const methodBadgeEl = document.getElementById('method-badge');

    // ==================== PARTICLE SYSTEM ====================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 240 : 270; // indigo or purple
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        resizeCanvas();
        particles = [];
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animationFrame = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // ==================== DRAG AND DROP ====================
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    resetBtn.addEventListener('click', () => {
        resetUI();
    });

    // ==================== FILE HANDLING ====================
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file (JPG/PNG)');
            return;
        }

        // Preview with animation
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            // Re-trigger animation
            previewContainer.style.animation = 'none';
            previewContainer.offsetHeight; // force reflow
            previewContainer.style.animation = 'preview-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
            dropzone.style.display = 'none';
        };
        reader.readAsDataURL(file);

        uploadAndAnalyze(file);
    }

    // ==================== UPLOAD & ANALYZE ====================
    async function uploadAndAnalyze(file) {
        resetUI(false);
        loading.style.display = 'block';

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Pointing to the unified backend server
            const response = await fetch('http://localhost:5000/api/identify', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to analyze image');

            const data = await response.json();
            displayResults(data);
        } catch (err) {
            showError(err.message);
        } finally {
            loading.style.display = 'none';
        }
    }

    // ==================== DISPLAY RESULTS ====================
    function displayResults(data) {
        results.style.display = 'block';
        manualFix.style.display = 'block';

        // Animate elements with stagger
        const resultCard = results.querySelector('.result-card');
        resultCard.style.animation = 'none';
        resultCard.offsetHeight;
        resultCard.style.animation = 'result-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both';

        // Stagger data population
        setTimeout(() => {
            foodNameEl.textContent = data.name;
            foodNameEl.style.animation = 'stagger-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
        }, 150);

        setTimeout(() => {
            categoryEl.textContent = data.category;
            categoryEl.style.animation = 'stagger-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
        }, 250);

        setTimeout(() => {
            confidenceScoreEl.textContent = `${data.confidence}%`;
        }, 300);

        // Method badge styling
        methodBadgeEl.textContent = `AI Scan (${data.method})`;
        if (data.method === 'Simulation') {
            methodBadgeEl.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
        } else {
            methodBadgeEl.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }

        // Quality Info
        const qualitySection = document.getElementById('quality-section');
        if (data.quality_info) {
            qualitySection.innerHTML = Object.entries(data.quality_info).map(([key, val], i) => `
                <div class="quality-item" style="animation: stagger-in 0.5s ${0.4 + i * 0.1}s cubic-bezier(0.16, 1, 0.3, 1) both;">
                    <span class="quality-label">${key}</span>
                    <p class="quality-value">${val}</p>
                </div>
            `).join('');
            qualitySection.style.display = 'grid';
        } else {
            qualitySection.style.display = 'none';
        }

        // Confidence colors with neon glow
        if (data.confidence >= 80) {
            confidenceScoreEl.style.color = '#10b981';
            confidenceFillEl.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            confidenceFillEl.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.5)';
        } else if (data.confidence >= 60) {
            confidenceScoreEl.style.color = '#6366f1';
            confidenceFillEl.style.background = 'linear-gradient(90deg, #6366f1, #818cf8)';
            confidenceFillEl.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.5)';
        } else {
            confidenceScoreEl.style.color = '#f59e0b';
            confidenceFillEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            confidenceFillEl.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.5)';
        }

        // Animate confidence bar
        setTimeout(() => {
            confidenceFillEl.style.width = `${data.confidence}%`;
            confidenceFillEl.classList.add('animate');
        }, 500);

        // Low confidence handling
        if (data.confidence < 60) {
            lowConfidenceMsg.style.display = 'block';
        } else {
            lowConfidenceMsg.style.display = 'none';
        }
    }

    // ==================== ERROR DISPLAY ====================
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        // Re-trigger shake
        errorMsg.style.animation = 'none';
        errorMsg.offsetHeight;
        errorMsg.style.animation = 'shake 0.4s ease, stagger-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
    }

    // ==================== RESET ====================
    function resetUI(full = true) {
        errorMsg.style.display = 'none';
        results.style.display = 'none';
        loading.style.display = 'none';
        lowConfidenceMsg.style.display = 'none';
        confidenceFillEl.style.width = '0%';
        confidenceFillEl.classList.remove('animate');

        if (full) {
            previewContainer.style.display = 'none';
            dropzone.style.display = 'block';
            fileInput.value = '';
            previewImage.src = '';

            // Re-trigger upload area animation
            dropzone.style.animation = 'none';
            dropzone.offsetHeight;
            dropzone.style.animation = 'stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
        }
    }
});
