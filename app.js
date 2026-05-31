document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const LibraryStore = {
        init() {
            if (!localStorage.getItem('library_books')) {
                const initialBooks = [
                    { id: 'b1', title: "Designing The Future", author: "Elena Rivers", category: "Design", rating: 4.9, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtMKzZpvGANhItn5ydadPaBpFYOjMDFORGb47GEvorPRFAiw091vaWNuaKSlpDgQa2Fv7IkMIsUegABbjwKxz_e9mBANfH3e1FH3FcCjpynFg0V10vF-Xt8mw7rzM89-NnvqZcBO00LbeIwhJL37plL6nRK3QU3T5X1_vM6RDLJtc2OQ7FtAExeRKJcrCQ4gxnBMHkG_CsqInJ5-momCEEaGpSiz7ADWmPkLX33zDLoRc1j4EbZA3BEja_NJxVu1HFxLbSsJ6ZFIE", totalCopies: 5, available: 5 },
                    { id: 'b2', title: "AI & Ethics", author: "Dr. Julian Vance", category: "Technology", rating: 4.7, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSbJp3XiM3GC6rAFNcpetS7DnjuHrWib0pgYVnQVDfO7otCVVsFOPMSv5Y-z_ENoWmbxmM6cLsenlqx3S6PTJWE8sGftquNP5SO3WduB50MJed0xAYqk6_BDt8qp-6DVPnemQMVbdtwsyOrgsk0FmfjZ4VLN3M9SYWkOVFSXH0CYsmwZGLNlQ2N1ArOThbeLhokFymsmsnoZv0ZYCysp_RZKovCMoBD3fynF3HpbXv6pjeuzoI8vcEI7y0TGqN27xQYoTGoSnQZ_s", totalCopies: 3, available: 3 },
                    { id: 'b3', title: "Advanced Bio-Medical", author: "Sarah Hughes", category: "Science", rating: 4.8, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbZezOxvG2UeDj6INPnE6QnDOhrETwh3HZJ0jj9m9jrkJInpD2rBMIUpzrhQoum8qiKisBMZt5rPrEU3xc-augPZwgt05XhQY9NXEfiy07jzOeWiNyg3J69kAI3E8YbB6VAOmSWkIuSQ_Nl6O9SzxoaZlQFEgqxHPJYNJLhDoZ_3de6HabbrTTORwus1M88dmE1vDTCGAbteTkZxt_gmAxfqTYyWl5dNBNo3IYcTUPwT00NKknjnzWmNEVWpFSTcupPF7VeVaCT7k", totalCopies: 2, available: 2 }
                ];
                localStorage.setItem('library_books', JSON.stringify(initialBooks));
            }
            if (!localStorage.getItem('library_users')) {
                localStorage.setItem('library_users', JSON.stringify([
                    { id: 'u1', name: 'John Doe (Current User)', email: 'john@example.com' },
                    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' }
                ]));
            }
            if (!localStorage.getItem('library_transactions')) {
                localStorage.setItem('library_transactions', JSON.stringify([]));
            }
        },
        getBooks() { return JSON.parse(localStorage.getItem('library_books')); },
        saveBooks(books) { localStorage.setItem('library_books', JSON.stringify(books)); },
        getUsers() { return JSON.parse(localStorage.getItem('library_users')); },
        getTransactions() { return JSON.parse(localStorage.getItem('library_transactions')); },
        saveTransactions(txs) { localStorage.setItem('library_transactions', JSON.stringify(txs)); },
        
        addBook(book) {
            const books = this.getBooks();
            book.id = 'b' + Date.now();
            book.available = book.totalCopies;
            books.push(book);
            this.saveBooks(books);
        },
        editBook(updatedBook) {
            let books = this.getBooks();
            const index = books.findIndex(b => b.id === updatedBook.id);
            if(index > -1) {
                const diff = updatedBook.totalCopies - books[index].totalCopies;
                updatedBook.available = books[index].available + diff;
                books[index] = updatedBook;
                this.saveBooks(books);
            }
        },
        deleteBook(id) {
            let books = this.getBooks();
            books = books.filter(b => b.id !== id);
            this.saveBooks(books);
        },
        issueBook(bookId, userId) {
            let books = this.getBooks();
            let book = books.find(b => b.id === bookId);
            if (book && book.available > 0) {
                book.available--;
                this.saveBooks(books);
                
                let txs = this.getTransactions();
                txs.push({
                    id: 'tx' + Date.now(),
                    bookId,
                    userId,
                    issueDate: new Date().toISOString(),
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    returned: false
                });
                this.saveTransactions(txs);
                return true;
            }
            return false;
        },
        returnBook(txId) {
            let txs = this.getTransactions();
            let tx = txs.find(t => t.id === txId);
            if(tx && !tx.returned) {
                tx.returned = true;
                this.saveTransactions(txs);
                
                let books = this.getBooks();
                let book = books.find(b => b.id === tx.bookId);
                if(book) {
                    book.available++;
                    this.saveBooks(books);
                }
            }
        }
    };

    LibraryStore.init();

    // --- Authentication State ---
    let currentUser = null;

    function updateAuthUI() {
        const authBtns = document.getElementById('auth-buttons');
        const userProfile = document.getElementById('user-profile');
        const greeting = document.getElementById('user-greeting');
        
        if (currentUser) {
            authBtns?.classList.add('hidden');
            userProfile?.classList.remove('hidden');
            if (greeting) greeting.textContent = `Welcome, ${currentUser}`;
        } else {
            authBtns?.classList.remove('hidden');
            userProfile?.classList.add('hidden');
        }
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        currentUser = null;
        updateAuthUI();
        showToast('Successfully logged out.');
        window.location.hash = '#home';
    });

    // --- Routing System ---
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleRoute() {
        let hash = window.location.hash || '#home';
        
        views.forEach(view => view.classList.remove('active'));

        const targetView = document.querySelector(hash + '-view');
        if (targetView) {
            targetView.classList.add('active');
        } else {
            document.querySelector('#home-view').classList.add('active');
        }

        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('text-primary', 'dark:text-primary-fixed', 'font-semibold', 'border-b-2', 'border-primary');
                link.classList.remove('text-on-surface-variant', 'dark:text-surface-variant');
            } else {
                link.classList.remove('text-primary', 'dark:text-primary-fixed', 'font-semibold', 'border-b-2', 'border-primary');
                link.classList.add('text-on-surface-variant', 'dark:text-surface-variant');
            }
        });

        if (hash === '#catalog') renderCatalog();
        else if (hash === '#dashboard') renderDashboard();
        else if (hash === '#admin') renderAdmin();

        window.scrollTo(0,0);
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    // --- Modal System ---
    const modals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.close-modal');

    document.getElementById('btn-login')?.addEventListener('click', () => document.getElementById('login-modal').classList.add('active'));
    document.getElementById('btn-signup')?.addEventListener('click', () => document.getElementById('signup-modal').classList.add('active'));

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('login-modal').classList.remove('active');
        currentUser = 'Mohd Rehan';
        updateAuthUI();
        showToast('Successfully logged in!');
        window.location.hash = '#dashboard';
    });

    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('signup-modal').classList.remove('active');
        currentUser = 'Mohd Rehan';
        updateAuthUI();
        showToast('Account created! Welcome to LuminaLib.');
        window.location.hash = '#catalog';
    });

    // --- Toast System ---
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'bg-error' : ''}`;
        const icon = type === 'error' ? 'error' : 'check_circle';
        toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { if(container.contains(toast)) toast.remove(); }, 3000);
    };

    document.querySelectorAll('button').forEach(btn => {
        if(btn.innerText.includes('Explore Library') || btn.innerText.includes('View All Categories')) {
            btn.addEventListener('click', () => window.location.hash = '#catalog');
        }
        if(btn.innerText.includes('Get Started') || btn.innerText.includes('Join Now')) {
            btn.addEventListener('click', () => document.getElementById('signup-modal').classList.add('active'));
        }
    });

    // --- Render Catalog View ---
    function renderCatalog() {
        const catalogView = document.getElementById('catalog-view');
        const books = LibraryStore.getBooks();

        let booksHtml = books.map(book => `
            <div class="glass-surface p-4 rounded-xl hover-lift bg-white flex flex-col">
                <div class="h-80 w-full mb-4 rounded-lg overflow-hidden bg-surface-container shadow-inner">
                    <img class="w-full h-full object-cover" src="${book.img}" />
                </div>
                <div class="flex-1">
                    <h5 class="font-title-lg text-label-md mb-1 line-clamp-2">${book.title}</h5>
                    <p class="text-label-sm text-outline mb-1">${book.author}</p>
                    <p class="text-xs text-secondary mb-3">${book.category}</p>
                </div>
                <div class="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                    <div class="text-xs font-bold ${book.available > 0 ? 'text-primary' : 'text-error'}">
                        ${book.available} Available
                    </div>
                    <button class="borrow-btn px-4 py-1.5 ${book.available > 0 ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'bg-surface-variant text-outline cursor-not-allowed'} text-label-sm rounded-full font-bold transition-all" data-id="${book.id}" ${book.available === 0 ? 'disabled' : ''}>
                        ${book.available > 0 ? 'Borrow' : 'Out'}
                    </button>
                </div>
            </div>
        `).join('');

        catalogView.innerHTML = `
            <div class="max-w-7xl mx-auto" id="catalog-grid">
                <div class="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 class="font-headline-lg text-headline-lg mb-2">Library Catalog</h2>
                        <p class="text-on-surface-variant">Browse our extensive collection of digital resources.</p>
                    </div>
                    <div class="relative w-full md:w-96">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input type="text" class="w-full bg-white border border-outline-variant rounded-full py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-body-md" placeholder="Search by title..." />
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${booksHtml}
                </div>
            </div>
        `;

        catalogView.querySelectorAll('.borrow-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.getAttribute('data-id');
                const success = LibraryStore.issueBook(bookId, 'u1'); // Mock current user
                if(success) {
                    showToast('Book successfully borrowed! Check your dashboard.');
                    renderCatalog(); // re-render to update counts
                } else {
                    showToast('Error borrowing book. No copies available.', 'error');
                }
            });
        });
    }

    // --- Render Dashboard View ---
    function renderDashboard() {
        const dashboardView = document.getElementById('dashboard-view');
        const transactions = LibraryStore.getTransactions().filter(tx => tx.userId === 'u1');
        const books = LibraryStore.getBooks();
        
        const activeBorrows = transactions.filter(tx => !tx.returned);
        const history = transactions.filter(tx => tx.returned);

        let activeHtml = activeBorrows.length === 0 ? '<p class="text-outline">No active borrowed books.</p>' : activeBorrows.map(tx => {
            const book = books.find(b => b.id === tx.bookId);
            return `
                <div class="flex items-center gap-4 bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
                    <img src="${book?.img}" class="w-16 h-24 object-cover rounded shadow-sm" />
                    <div class="flex-1">
                        <h6 class="font-bold text-label-md">${book?.title}</h6>
                        <p class="text-xs text-outline mb-2">Due: ${new Date(tx.dueDate).toLocaleDateString()}</p>
                        <button class="return-btn text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hover:bg-primary hover:text-white transition-all" data-id="${tx.id}">Return Book</button>
                    </div>
                </div>
            `;
        }).join('');

        dashboardView.innerHTML = `
            <div class="max-w-7xl mx-auto" id="dashboard-content">
                <div class="mb-12">
                    <h2 class="font-headline-lg text-headline-lg mb-2">Student Dashboard</h2>
                    <p class="text-on-surface-variant">Manage your borrowed resources and track your progress.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-primary text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <span class="material-symbols-outlined text-[40px] mb-4">bookmark</span>
                            <h4 class="font-title-lg text-title-lg">Currently Borrowed</h4>
                        </div>
                        <div class="text-display leading-none mt-4">${activeBorrows.length}</div>
                    </div>
                    <div class="bg-secondary text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <span class="material-symbols-outlined text-[40px] mb-4">history</span>
                            <h4 class="font-title-lg text-title-lg">Total Read</h4>
                        </div>
                        <div class="text-display leading-none mt-4">${history.length}</div>
                    </div>
                </div>

                <div class="mb-8">
                    <h4 class="font-title-lg text-title-lg mb-4">Active Borrows</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${activeHtml}
                    </div>
                </div>
            </div>
        `;

        dashboardView.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txId = e.currentTarget.getAttribute('data-id');
                LibraryStore.returnBook(txId);
                showToast('Book returned successfully.');
                renderDashboard();
            });
        });
    }

    // --- Render Admin View ---
    window.renderAdmin = function() {
        const adminView = document.getElementById('admin-view');
        const books = LibraryStore.getBooks();
        const txs = LibraryStore.getTransactions();
        const users = LibraryStore.getUsers();

        const activeTxs = txs.filter(t => !t.returned);

        let tableRows = books.map(book => `
            <tr class="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                <td class="p-4 flex items-center gap-3">
                    <img src="${book.img}" class="w-10 h-14 object-cover rounded shadow-sm" />
                    <div>
                        <div class="font-bold text-label-md">${book.title}</div>
                        <div class="text-xs text-outline">${book.author}</div>
                    </div>
                </td>
                <td class="p-4 text-label-md">${book.category}</td>
                <td class="p-4 text-label-md">${book.available} / ${book.totalCopies}</td>
                <td class="p-4">
                    <button class="delete-book-btn text-error hover:bg-error/10 p-2 rounded-full transition-colors" data-id="${book.id}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            </tr>
        `).join('');

        let txRows = activeTxs.map(tx => {
            const b = books.find(x => x.id === tx.bookId);
            const u = users.find(x => x.id === tx.userId);
            return `
                <tr class="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <td class="p-3 text-sm">${b?.title || 'Unknown'}</td>
                    <td class="p-3 text-sm">${u?.name || 'Unknown'}</td>
                    <td class="p-3 text-sm">${new Date(tx.dueDate).toLocaleDateString()}</td>
                    <td class="p-3">
                        <button class="admin-return-btn text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold" data-id="${tx.id}">Mark Returned</button>
                    </td>
                </tr>
            `;
        }).join('');

        adminView.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="font-headline-lg text-headline-lg mb-2 text-error">Librarian Dashboard</h2>
                        <p class="text-on-surface-variant">Manage inventory and monitor circulation.</p>
                    </div>
                    <div class="flex gap-4">
                        <button class="bg-white border border-outline-variant text-on-surface px-6 py-2 rounded-lg font-bold hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2" onclick="document.getElementById('issue-book-modal').classList.add('active')">
                            <span class="material-symbols-outlined">assignment_ind</span> Issue Book
                        </button>
                        <button class="bg-error text-white px-6 py-2 rounded-lg font-bold hover:bg-error/90 transition-colors shadow-sm flex items-center gap-2" onclick="document.getElementById('add-book-modal').classList.add('active')">
                            <span class="material-symbols-outlined">add</span> Add New Book
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                            <div class="p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
                                <h3 class="font-title-lg font-bold">Book Inventory</h3>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-surface-container-low text-on-surface-variant text-label-sm uppercase tracking-wider">
                                            <th class="p-4 font-semibold">Book Info</th>
                                            <th class="p-4 font-semibold">Category</th>
                                            <th class="p-4 font-semibold">Stock</th>
                                            <th class="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                            <div class="p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
                                <h3 class="font-title-lg font-bold">Active Issues</h3>
                            </div>
                            <div class="p-0">
                                <table class="w-full text-left border-collapse">
                                    <tbody>
                                        ${txRows || '<tr><td class="p-4 text-outline text-center text-sm" colspan="4">No active issues</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind delete buttons
        adminView.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Are you sure you want to delete this book?')) {
                    LibraryStore.deleteBook(e.currentTarget.getAttribute('data-id'));
                    showToast('Book deleted.');
                    renderAdmin();
                }
            });
        });

        // Bind return buttons in admin
        adminView.querySelectorAll('.admin-return-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                LibraryStore.returnBook(e.currentTarget.getAttribute('data-id'));
                showToast('Book marked as returned.');
                renderAdmin();
            });
        });

        // Populate modals for Issue Book
        const issueUserSelect = document.getElementById('issue-user-id');
        const issueBookSelect = document.getElementById('issue-book-select');
        issueUserSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
        issueBookSelect.innerHTML = books.filter(b => b.available > 0).map(b => `<option value="${b.id}">${b.title} (${b.available} available)</option>`).join('');
    }

    // --- Admin Forms ---
    document.getElementById('add-book-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const book = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            category: document.getElementById('book-category').value,
            img: document.getElementById('book-img').value,
            totalCopies: parseInt(document.getElementById('book-copies').value),
            rating: 0
        };
        LibraryStore.addBook(book);
        document.getElementById('add-book-modal').classList.remove('active');
        e.target.reset();
        showToast('New book added to inventory!');
        if(window.location.hash === '#admin') renderAdmin();
    });

    document.getElementById('issue-book-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('issue-user-id').value;
        const bookId = document.getElementById('issue-book-select').value;
        if(LibraryStore.issueBook(bookId, userId)) {
            showToast('Book successfully issued!');
        } else {
            showToast('Could not issue book.', 'error');
        }
        document.getElementById('issue-book-modal').classList.remove('active');
        if(window.location.hash === '#admin') renderAdmin();
    });
});
