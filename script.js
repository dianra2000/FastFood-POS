// Sample initial data
let products = [
    { id: 1, name: "Classic Burger", price: 8.99, category: "burgers", image: "🍔" },
    { id: 2, name: "Cheese Burger", price: 9.99, category: "burgers", image: "🧀" },
    { id: 3, name: "Bacon Burger", price: 10.99, category: "burgers", image: "🥓" },
    { id: 4, name: "French Fries", price: 3.99, category: "fries", image: "🍟" },
    { id: 5, name: "Sweet Potato Fries", price: 4.99, category: "fries", image: "🍠" },
    { id: 6, name: "Coca Cola", price: 1.99, category: "drinks", image: "🥤" },
    { id: 7, name: "Orange Juice", price: 2.49, category: "drinks", image: "🧃" },
    { id: 8, name: "Coffee", price: 2.99, category: "drinks", image: "☕" }
];

let customers = [
    { id: 1, name: "John Doe", phone: "555-0101", email: "john@example.com" },
    { id: 2, name: "Jane Smith", phone: "555-0102", email: "jane@example.com" }
];

let orders = [];
let currentOrder = {
    items: [],
    customer: null,
    date: new Date(),
    total: 0
};

// DOM Elements
const productsContainer = document.getElementById('products-container');
const orderItemsContainer = document.getElementById('order-items');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const customerNameInput = document.getElementById('customer-name');
const customerPhoneInput = document.getElementById('customer-phone');
const checkoutBtn = document.getElementById('checkout-btn');
const clearBtn = document.getElementById('clear-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const mgmtTabButtons = document.querySelectorAll('.mgmt-tab-btn');
const managementContents = document.querySelectorAll('.management-content');
const productForm = document.getElementById('product-form');
const customerForm = document.getElementById('customer-form');
const productsList = document.getElementById('products-list');
const customersList = document.getElementById('customers-list');
const ordersList = document.getElementById('orders-list');
const orderHistoryModal = document.getElementById('order-history-modal');
const orderHistoryContainer = document.getElementById('order-history');
const viewHistoryBtn = document.getElementById('view-history-btn');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadProducts();
    loadCustomers();
    loadOrders();
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Show burgers by default
    showProductsByCategory('burgers');
}

function setupEventListeners() {
    // Tab buttons for products
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            showProductsByCategory(category);
        });
    });
    
    // Management tab buttons
    mgmtTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            mgmtTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            showManagementTab(tab);
        });
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', processOrder);
    
    // Clear order button
    clearBtn.addEventListener('click', clearOrder);
    
    // Forms
    productForm.addEventListener('submit', addProduct);
    customerForm.addEventListener('submit', addCustomer);
    
    // Modal
    viewHistoryBtn.addEventListener('click', showOrderHistory);
    closeModal.addEventListener('click', () => {
        orderHistoryModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === orderHistoryModal) {
            orderHistoryModal.style.display = 'none';
        }
    });
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

function showProductsByCategory(category) {
    const filteredProducts = products.filter(product => product.category === category);
    renderProducts(filteredProducts);
}

function renderProducts(productsArray) {
    productsContainer.innerHTML = '';
    
    if (productsArray.length === 0) {
        productsContainer.innerHTML = '<p>No products found</p>';
        return;
    }
    
    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        `;
        productCard.addEventListener('click', () => addToOrder(product));
        productsContainer.appendChild(productCard);
    });
}

function addToOrder(product) {
    // Check if product already exists in order
    const existingItem = currentOrder.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentOrder.items.push({
            product: product,
            quantity: 1
        });
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    orderItemsContainer.innerHTML = '';
    
    if (currentOrder.items.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-order">No items added yet</p>';
        subtotalElement.textContent = '$0.00';
        taxElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    
    currentOrder.items.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.product.name}</div>
                <div class="item-price">$${item.product.price.toFixed(2)}</div>
            </div>
            <div class="item-controls">
                <button class="quantity-btn minus" data-id="${item.product.id}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.product.id}">+</button>
                <button class="remove-btn" data-id="${item.product.id}">Remove</button>
            </div>
        `;
        
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            decreaseQuantity(productId);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            increaseQuantity(productId);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromOrder(productId);
        });
    });
    
    // Calculate totals
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    currentOrder.total = total;
}

function increaseQuantity(productId) {
    const item = currentOrder.items.find(item => item.product.id === productId);
    if (item) {
        item.quantity += 1;
        updateOrderDisplay();
    }
}

function decreaseQuantity(productId) {
    const item = currentOrder.items.find(item => item.product.id === productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromOrder(productId);
            return;
        }
        updateOrderDisplay();
    }
}

function removeFromOrder(productId) {
    currentOrder.items = currentOrder.items.filter(item => item.product.id !== productId);
    updateOrderDisplay();
}

function clearOrder() {
    currentOrder = {
        items: [],
        customer: null,
        date: new Date(),
        total: 0
    };
    customerNameInput.value = '';
    customerPhoneInput.value = '';
    updateOrderDisplay();
}

function processOrder() {
    if (currentOrder.items.length === 0) {
        alert('Please add items to the order before checking out.');
        return;
    }
    
    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    
    if (!customerName || !customerPhone) {
        alert('Please enter customer name and phone number.');
        return;
    }
    
    // Create or find customer
    let customer = customers.find(c => c.phone === customerPhone);
    if (!customer) {
        customer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name: customerName,
            phone: customerPhone,
            email: ''
        };
        customers.push(customer);
        saveCustomers();
        loadCustomers(); // Refresh customer list
    }
    
    // Create order
    const order = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        customer: customer,
        items: [...currentOrder.items],
        date: new Date(),
        total: currentOrder.total
    };
    
    orders.push(order);
    saveOrders();
    
    // Generate receipt
    generateReceipt(order);
    
    // Clear current order
    clearOrder();
    
    alert('Order completed successfully!');
}

function generateReceipt(order) {
    let receipt = `=== GRILLMASTER RECEIPT ===\n`;
    receipt += `Date: ${order.date.toLocaleString()}\n`;
    receipt += `Customer: ${order.customer.name}\n`;
    receipt += `Phone: ${order.customer.phone}\n`;
    receipt += `----------------------------\n`;
    
    order.items.forEach(item => {
        receipt += `${item.product.name} x${item.quantity}: $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    
    receipt += `----------------------------\n`;
    receipt += `Subtotal: $${subtotal.toFixed(2)}\n`;
    receipt += `Tax (10%): $${tax.toFixed(2)}\n`;
    receipt += `Total: $${order.total.toFixed(2)}\n`;
    receipt += `============================\n`;
    receipt += `Thank you for your order!`;
    
    // In a real application, you would print this or save as PDF
    console.log(receipt);
}

function showManagementTab(tab) {
    managementContents.forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tab}-management`).classList.add('active');
    
    // Refresh the content
    if (tab === 'products') {
        loadProductsManagement();
    } else if (tab === 'customers') {
        loadCustomersManagement();
    } else if (tab === 'orders') {
        loadOrdersManagement();
    }
}

function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value || 'images/default.jpg';
    
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: name,
        price: price,
        category: category,
        image: image
    };
    
    products.push(newProduct);
    saveProducts();
    
    // Reset form
    productForm.reset();
    
    // Refresh displays
    loadProducts();
    loadProductsManagement();
    
    alert('Product added successfully!');
}

function addCustomer(e) {
    e.preventDefault();
    
    const name = document.getElementById('customer-form-name').value;
    const phone = document.getElementById('customer-form-phone').value;
    const email = document.getElementById('customer-form-email').value || '';
    
    const newCustomer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        name: name,
        phone: phone,
        email: email
    };
    
    customers.push(newCustomer);
    saveCustomers();
    
    // Reset form
    customerForm.reset();
    
    // Refresh display
    loadCustomersManagement();
    
    alert('Customer added successfully!');
}

function loadProductsManagement() {
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products found</p>';
        return;
    }
    
    products.forEach(product => {
        const productRow = document.createElement('div');
        productRow.className = 'item-row';
        productRow.innerHTML = `
            <div class="item-name">${product.name}</div>
            <div class="item-category">${product.category}</div>
            <div class="item-price">$${product.price.toFixed(2)}</div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${product.id}">Edit</button>
                <button class="delete-btn" data-id="${product.id}">Delete</button>
            </div>
        `;
        
        productsList.appendChild(productRow);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image;
        
        // Change form to update mode
        const submitButton = productForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Product';
        
        // Remove existing event listener and add update listener
        productForm.onsubmit = function(e) {
            e.preventDefault();
            updateProduct(productId);
        };
    }
}

function updateProduct(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex].name = document.getElementById('product-name').value;
        products[productIndex].price = parseFloat(document.getElementById('product-price').value);
        products[productIndex].category = document.getElementById('product-category').value;
        products[productIndex].image = document.getElementById('product-image').value || 'images/default.jpg';
        
        saveProducts();
        
        // Reset form
        productForm.reset();
        const submitButton = productForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Add Product';
        
        // Restore original event listener
        productForm.onsubmit = addProduct;
        
        // Refresh displays
        loadProducts();
        loadProductsManagement();
        
        alert('Product updated successfully!');
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        
        // Refresh displays
        loadProducts();
        loadProductsManagement();
        
        alert('Product deleted successfully!');
    }
}

function loadCustomersManagement() {
    customersList.innerHTML = '';
    
    if (customers.length === 0) {
        customersList.innerHTML = '<p>No customers found</p>';
        return;
    }
    
    customers.forEach(customer => {
        const customerRow = document.createElement('div');
        customerRow.className = 'item-row';
        customerRow.innerHTML = `
            <div class="item-name">${customer.name}</div>
            <div class="item-phone">${customer.phone}</div>
            <div class="item-email">${customer.email || 'N/A'}</div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${customer.id}">Edit</button>
                <button class="delete-btn" data-id="${customer.id}">Delete</button>
            </div>
        `;
        
        customersList.appendChild(customerRow);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = parseInt(this.getAttribute('data-id'));
            editCustomer(customerId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = parseInt(this.getAttribute('data-id'));
            deleteCustomer(customerId);
        });
    });
}

function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        document.getElementById('customer-form-name').value = customer.name;
        document.getElementById('customer-form-phone').value = customer.phone;
        document.getElementById('customer-form-email').value = customer.email || '';
        
        // Change form to update mode
        const submitButton = customerForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Customer';
        
        // Remove existing event listener and add update listener
        customerForm.onsubmit = function(e) {
            e.preventDefault();
            updateCustomer(customerId);
        };
    }
}

function updateCustomer(customerId) {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex !== -1) {
        customers[customerIndex].name = document.getElementById('customer-form-name').value;
        customers[customerIndex].phone = document.getElementById('customer-form-phone').value;
        customers[customerIndex].email = document.getElementById('customer-form-email').value;
        
        saveCustomers();
        
        // Reset form
        customerForm.reset();
        const submitButton = customerForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Add Customer';
        
        // Restore original event listener
        customerForm.onsubmit = addCustomer;
        
        // Refresh display
        loadCustomersManagement();
        
        alert('Customer updated successfully!');
    }
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        customers = customers.filter(c => c.id !== customerId);
        saveCustomers();
        
        // Refresh display
        loadCustomersManagement();
        
        alert('Customer deleted successfully!');
    }
}

function loadOrdersManagement() {
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found</p>';
        return;
    }
    
    // Show recent orders (last 10)
    const recentOrders = orders.slice(-10).reverse();
    
    recentOrders.forEach(order => {
        const orderRow = document.createElement('div');
        orderRow.className = 'item-row';
        orderRow.innerHTML = `
            <div class="item-name">Order #${order.id}</div>
            <div class="item-customer">${order.customer.name}</div>
            <div class="item-date">${order.date.toLocaleDateString()}</div>
            <div class="item-total">$${order.total.toFixed(2)}</div>
        `;
        
        ordersList.appendChild(orderRow);
    });
}

function showOrderHistory() {
    orderHistoryContainer.innerHTML = '';
    
    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = '<p>No order history available</p>';
    } else {
        // Sort orders by date (newest first)
        const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-history-item';
            orderElement.innerHTML = `
                <h3>Order #${order.id} - ${order.date.toLocaleString()}</h3>
                <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.phone})</p>
                <p><strong>Items:</strong> ${order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ')}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <hr>
            `;
            orderHistoryContainer.appendChild(orderElement);
        });
    }
    
    orderHistoryModal.style.display = 'block';
}

// Data persistence functions
function saveProducts() {
    localStorage.setItem('pos-products', JSON.stringify(products));
}

function loadProducts() {
    const savedProducts = localStorage.getItem('pos-products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    // Show current category
    const activeCategory = document.querySelector('.tab-btn.active').getAttribute('data-category');
    showProductsByCategory(activeCategory);
}

function saveCustomers() {
    localStorage.setItem('pos-customers', JSON.stringify(customers));
}

function loadCustomers() {
    const savedCustomers = localStorage.getItem('pos-customers');
    if (savedCustomers) {
        customers = JSON.parse(savedCustomers);
    }
}

function saveOrders() {
    localStorage.setItem('pos-orders', JSON.stringify(orders));
}

function loadOrders() {
    const savedOrders = localStorage.getItem('pos-orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}