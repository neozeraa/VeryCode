document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });
    }

    // Modal Elements
    const modal = document.getElementById('checkoutModal');
    const closeModalBtn = document.getElementById('closeModal');
    const buyButtons = document.querySelectorAll('.btn-buy, .btn-primary[data-package]');
    const checkoutForm = document.getElementById('checkoutForm');
    const pixContainer = document.getElementById('pixContainer');
    const selectedPackageText = document.getElementById('selectedPackageText');
    const selectedPriceText = document.getElementById('selectedPriceText');
    const pixCodeInput = document.getElementById('pixCodeInput');
    const btnCopy = document.getElementById('btnCopy');

    let currentPackage = { amount: '800 Robux', price: 'R$ 34,90' };

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.package-card');
            if (card) {
                const amount = card.querySelector('.package-amount').textContent;
                const price = card.querySelector('.package-price').firstChild.textContent.trim();
                currentPackage = { amount, price };
            }

            selectedPackageText.textContent = currentPackage.amount;
            selectedPriceText.textContent = currentPackage.price;
            
            // Reset modal state
            checkoutForm.style.display = 'block';
            pixContainer.classList.remove('active');
            
            modal.classList.add('active');
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Checkout Form Submit -> Generate Pix
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const robloxNick = document.getElementById('robloxNick').value;
            
            if (!robloxNick.trim()) {
                alert('Por favor, informe seu nick do Roblox!');
                return;
            }

            // Simulating Pix Generation
            checkoutForm.style.display = 'none';
            pixContainer.classList.add('active');
            
            // Random mock pix payload
            const mockPixPayload = `00020126580014br.gov.bcb.pix0136veryrobux-pay-${Math.random().toString(36.substring(7))}5204000053039865802BR5909VERYROBUX6009SAOPAULO62070503***63041D3C`;
            pixCodeInput.value = mockPixPayload;
        });
    }

    // Copy Pix Code
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            pixCodeInput.select();
            document.execCommand('copy');
            btnCopy.textContent = 'Copiado!';
            setTimeout(() => {
                btnCopy.textContent = 'Copiar';
            }, 2000);
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
