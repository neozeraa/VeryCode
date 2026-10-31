let cart = [];

const openCartBtn = document.getElementById('openCart');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

openCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'flex';
    renderCart();
});

closeCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartCount();
    showNotification(`${name} adicionado ao carrinho!`);
}

function updateCartCount() {
    cartCount.textContent = cart.length;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Seu carrinho está vazio.</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total.toFixed(2);
}

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar!');
        return;
    }
    alert('Redirecionando para o gateway de pagamento seguro...');
    cart = [];
    updateCartCount();
    cartModal.style.display = 'none';
});

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.textContent = msg;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.background = 'var(--accent)';
    notif.style.color = '#0f172a';
    notif.style.padding = '10px 20px';
    notif.style.borderRadius = '8px';
    notif.style.fontWeight = 'bold';
    notif.style.zIndex = '1000';
    notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}