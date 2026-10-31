/* ---------------------------------------------------
   VERY ROBUX - Main JavaScript Interactivity
   VERY SYSTEMS Architecture
--------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Drawer
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleDrawer() {
        mobileDrawer.classList.toggle('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleDrawer);
    if (closeDrawer) closeDrawer.addEventListener('click', toggleDrawer);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDrawer.classList.remove('active');
        });
    });

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.getElementById('closeModal');
    const buyButtons = document.querySelectorAll('.btn-buy');
    
    const modalStep1 = document.getElementById('modalStep1');
    const modalStep2 = document.getElementById('modalStep2');
    const modalRobuxTitle = document.getElementById('modalRobuxTitle');
    const modalPriceTitle = document.getElementById('modalPriceTitle');
    const checkoutForm = document.getElementById('checkoutForm');
    const robloxNickInput = document.getElementById('robloxNick');
    const confirmNick = document.getElementById('confirmNick');
    
    const copyPixBtn = document.getElementById('copyPixBtn');
    const pixCopyInput = document.getElementById('pixCopyInput');

    // Terms Modal Elements
    const termsModal = document.getElementById('termsModal');
    const openTerms = document.getElementById('openTerms');
    const closeTermsModal = document.getElementById('closeTermsModal');

    let selectedPackage = { robux: '1.700', price: '98,90' };

    // Open Checkout Modal on Buy Click
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const robux = btn.getAttribute('data-robux');
            const price = btn.getAttribute('data-price');
            
            // Format Robux string with dot if needed
            const formattedRobux = Number(robux).toLocaleString('pt-BR');
            const formattedPrice = Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            selectedPackage = { robux: formattedRobux, price: formattedPrice };

            modalRobuxTitle.textContent = `${formattedRobux} Robux`;
            modalPriceTitle.textContent = `R$ ${formattedPrice}`;

            // Reset to step 1
            modalStep1.classList.remove('hidden');
            modalStep2.classList.add('hidden');
            robloxNickInput.value = '';

            checkoutModal.classList.add('active');
        });
    });

    // Close Checkout Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }

    // Close modal clicking outside container
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
        if (e.target === termsModal) {
            termsModal.classList.remove('active');
        }
    });

    // Handle Checkout Form Submission (Generate Pix)
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nick = robloxNickInput.value.trim();
            if (!nick) return;

            confirmNick.textContent = nick;
            pixCopyInput.value = `00020126580014br.gov.bcb.pix...veryrobuxautomation2025-${nick}-${selectedPackage.robux}`;

            // Transition to Step 2
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
        });
    }

    // Copy Pix Key Interaction
    if (copyPixBtn) {
        copyPixBtn.addEventListener('click', () => {
            pixCopyInput.select();
            document.execCommand('copy');
            
            const originalHTML = copyPixBtn.innerHTML;
            copyPixBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
            copyPixBtn.style.background = 'var(--accent-emerald)';
            copyPixBtn.style.color = '#000';

            setTimeout(() => {
                copyPixBtn.innerHTML = originalHTML;
                copyPixBtn.style.background = '';
                copyPixBtn.style.color = '';
            }, 2500);
        });
    }

    // Terms Modal Control
    if (openTerms) {
        openTerms.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.classList.add('active');
        });
    }

    if (closeTermsModal) {
        closeTermsModal.addEventListener('click', () => {
            termsModal.classList.remove('active');
        });
    }

    // Countdown Timer Simulation for Pix (15 minutes)
    let timeLeft = 15 * 60;
    const countdownEl = document.getElementById('countdown');

    setInterval(() => {
        if (!countdownEl) return;
        if (timeLeft <= 0) return;
        
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
});