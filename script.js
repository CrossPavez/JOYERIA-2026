document.addEventListener('DOMContentLoaded', () => {
    
    // --- INIT CMS (Cargar textos dinámicos) ---
    if(window.store) {
        const config = window.store.getConfig();
        
        // Hero Section (Solo en Index)
        const heroTitle = document.getElementById('cms-hero-title');
        const heroSub = document.getElementById('cms-hero-subtitle');
        const heroCta = document.getElementById('cms-hero-cta');
        const heroImg = document.getElementById('cms-hero-bg');

        if(heroTitle && config.heroTitle) heroTitle.innerText = config.heroTitle;
        if(heroSub && config.heroSubtitle) heroSub.innerText = config.heroSubtitle;
        if(heroCta && config.heroCtaText) heroCta.innerText = config.heroCtaText;
        if(heroCta && config.heroCtaLink) heroCta.setAttribute('href', config.heroCtaLink);
        if(heroImg && config.heroImage) heroImg.src = config.heroImage;

        // Categorías
        const catRing = document.getElementById('cms-cat-rings');
        const catNeck = document.getElementById('cms-cat-necklaces');
        const catBrac = document.getElementById('cms-cat-bracelets');
        
        if(catRing && config.catRingImage) catRing.src = config.catRingImage;
        if(catNeck && config.catNecklaceImage) catNeck.src = config.catNecklaceImage;
        if(catBrac && config.catBraceletImage) catBrac.src = config.catBraceletImage;

        // Bespoke
        const bespokeTitle = document.getElementById('cms-bespoke-title');
        const bespokeSub = document.getElementById('cms-bespoke-subtitle');
        const bespokeCta = document.getElementById('cms-bespoke-cta');
        const bespokeImg = document.getElementById('cms-bespoke-bg');
        if(bespokeTitle && config.bespokeTitle) bespokeTitle.innerText = config.bespokeTitle;
        if(bespokeSub && config.bespokeSubtitle) bespokeSub.innerText = config.bespokeSubtitle;
        if(bespokeCta && config.bespokeCtaText) bespokeCta.innerText = config.bespokeCtaText;
        if(bespokeCta && config.bespokeCtaLink) bespokeCta.setAttribute('href', config.bespokeCtaLink);
        if(bespokeImg && config.bespokeImage) bespokeImg.src = config.bespokeImage;

        // Footer Contact (Global)
        const fEmail = document.getElementById('footer-email');
        const fPhone = document.getElementById('footer-phone');
        if(fEmail && config.contactEmail) fEmail.innerText = config.contactEmail;
        if(fPhone && config.contactPhone) fPhone.innerText = config.contactPhone;

        const featuredTitle = document.getElementById('cms-featured-title');
        if(featuredTitle && config.featuredTitle) featuredTitle.innerText = config.featuredTitle;
    }

    // --- FORM HANDLING ---
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if(contactForm && window.store) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-msg').value
            };
            window.store.saveMessage(msg);
            alert('Gracias por contactarnos. Responderemos a la brevedad.');
            contactForm.reset();
        });
    }

    // Newsletter Form
    const newsForm = document.getElementById('newsletter-form');
    if(newsForm && window.store) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            const success = window.store.addSubscriber(email);
            if(success) alert('¡Suscrito correctamente!');
            else alert('Este correo ya está suscrito.');
            newsForm.reset();
        });
    }

    // --- INTERACTIVIDAD INTERFAZ ---
    
    // Scroll effect for header
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if(!header) return;
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Mobile menu toggle
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    if(menuIcon) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            
            // Toggle Icon
            const icon = menuIcon.querySelector('i');
            if(icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            // Animate Links
            navLinksItems.forEach((link, index) => {
                if(link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // Scroll reveal
    const revealElements = document.querySelectorAll('.product-card, .category-item, .process-step, .two-column-layout');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    const escapeHtml = (str) => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const ensureProductModal = () => {
        if (document.getElementById('product-detail-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'product-detail-modal';
        modal.className = 'product-detail-modal';
        modal.innerHTML = `
            <div class="product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
                <button type="button" class="product-detail-close" aria-label="Cerrar detalle" data-product-close>&times;</button>
                <div class="product-detail-layout">
                    <div class="product-detail-media">
                        <img id="product-detail-main-image" src="" alt="Joya seleccionada">
                        <div class="product-detail-thumbs" id="product-detail-thumbs"></div>
                        <div id="product-detail-video-wrap" style="display:none; margin-top:14px;">
                            <video id="product-detail-video" controls style="width:100%; border-radius:14px; background:#000;"></video>
                        </div>
                    </div>
                    <div class="product-detail-body">
                        <div class="product-detail-kicker">Ficha de Joya</div>
                        <h2 id="product-detail-title"></h2>
                        <div class="product-detail-meta" id="product-detail-meta"></div>
                        <p class="product-detail-description" id="product-detail-description"></p>
                        <div class="product-detail-sections" id="product-detail-sections"></div>
                        <div id="product-detail-comments"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.hasAttribute('data-product-close')) {
                closeProductDetails();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeProductDetails();
            }
        });
    };

    const formatProductSection = (label, value) => {
        if (!value) return '';
        return `
            <div class="product-detail-section">
                <span>${label}</span>
                <strong>${value}</strong>
            </div>
        `;
    };

    function renderComments(productId) {
        const container = document.getElementById('product-detail-comments');
        if (!container || !window.store) return;
        const comments = window.store.getComments(productId);

        const listHtml = comments.length === 0
            ? '<p class="comments-empty">Sé el primero en comentar.</p>'
            : comments.map(c => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-nick">${escapeHtml(c.nick)}</span>
                        <span class="comment-date">${escapeHtml(c.date)}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(c.text)}</p>
                </div>
            `).join('');

        container.innerHTML = `
            <div class="comments-section">
                <h3 class="comments-title">Comentarios</h3>
                <div class="comments-list">${listHtml}</div>
                <form class="comment-form" novalidate>
                    <input type="text" class="comment-nick-input" placeholder="Tu nick (opcional)" maxlength="30">
                    <textarea class="comment-text-input" placeholder="¿Qué te parece esta pieza?" rows="3" maxlength="500"></textarea>
                    <button type="submit" class="comment-submit">Comentar</button>
                </form>
            </div>
        `;

        container.querySelector('.comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const nick = container.querySelector('.comment-nick-input').value;
            const text = container.querySelector('.comment-text-input').value.trim();
            if (!text) return;
            const result = window.store.saveComment({ productId, nick, text });
            if (result === null) {
                alert('No se pudo guardar el comentario. El almacenamiento local está lleno.');
                return;
            }
            renderComments(productId);
        });
    }

    function closeProductDetails() {
        const modal = document.getElementById('product-detail-modal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('product-detail-open');
    }

    function openProductDetails(product) {
        ensureProductModal();

        const photos = Array.isArray(product.photos) && product.photos.length > 0
            ? product.photos.slice(0, 5)
            : [product.image].filter(Boolean);
        const mainImage = photos[0] || product.image || 'logo.svg';
        const meta = [];
        if (product.material) meta.push(`<span>${product.material}</span>`);
        if (product.category) meta.push(`<span>${product.category}</span>`);
        if (product.featured) meta.push(`<span>Destacada</span>`);

        document.getElementById('product-detail-title').textContent = product.name || 'Joya';
        document.getElementById('product-detail-main-image').src = mainImage;
        document.getElementById('product-detail-main-image').alt = product.name || 'Joya';
        document.getElementById('product-detail-meta').innerHTML = meta.join('');
        document.getElementById('product-detail-description').textContent = product.description || 'Sin descripción disponible.';

        const sections = [
            formatProductSection('Material', product.material),
            formatProductSection('Descripción', product.description)
        ].filter(Boolean);
        document.getElementById('product-detail-sections').innerHTML = sections.join('');

        const thumbsContainer = document.getElementById('product-detail-thumbs');
        thumbsContainer.innerHTML = photos.map((photo, index) => `
            <button type="button" class="product-detail-thumb ${index === 0 ? 'active' : ''}" data-photo="${photo}">
                <img src="${photo}" alt="Foto ${index + 1} de ${product.name || 'joya'}">
            </button>
        `).join('');

        thumbsContainer.querySelectorAll('[data-photo]').forEach((thumb) => {
            thumb.addEventListener('click', () => {
                thumbsContainer.querySelectorAll('.product-detail-thumb').forEach(node => node.classList.remove('active'));
                thumb.classList.add('active');
                document.getElementById('product-detail-main-image').src = thumb.getAttribute('data-photo');
            });
        });

        const videoWrap = document.getElementById('product-detail-video-wrap');
        const videoEl = document.getElementById('product-detail-video');
        const productVideo = Array.isArray(product.videos) && product.videos[0];
        if (productVideo) {
            videoEl.src = productVideo;
            videoWrap.style.display = 'block';
        } else {
            videoEl.src = '';
            videoWrap.style.display = 'none';
        }

        renderComments(product.id);

        const modal = document.getElementById('product-detail-modal');
        modal.classList.add('active');
        document.body.classList.add('product-detail-open');
    }

    // --- RENDERIZADO DE PRODUCTOS ---
    
    const createProductCard = (product) => {
        const primaryPhoto = (Array.isArray(product.photos) && product.photos[0]) ? product.photos[0] : product.image;
        const description = product.description ? product.description : '';
        const material = product.material ? product.material : product.category;
        return `
            <div style="opacity:0; transform:translateY(20px); transition:all 0.5s ease;" class="product-card fade-in-item" data-id="${product.id}" role="button" tabindex="0" aria-label="Ver detalles de ${product.name}">
                <div class="product-image">
                    <img src="${primaryPhoto}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p style="margin:8px 0 0; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; color:#8a6a33;">${material}</p>
                    <p style="margin:8px 0 0; font-size:0.9rem; color:#555; line-height:1.5;">${description}</p>
                </div>
            </div>
        `;
    };

    // Featured (Home)
    const featuredContainer = document.getElementById('featured-products-container');

    const renderFeatured = () => {
        if (!featuredContainer || !window.store) return;
        const products = window.store.getProducts();
        const featured = products
            .filter(p => p.featured)
            .sort((a, b) => (b.createdAt || Number(b.id)) - (a.createdAt || Number(a.id)))
            .slice(0, 4);
        featuredContainer.innerHTML = featured.map(createProductCard).join('');

        setTimeout(() => {
            featuredContainer.querySelectorAll('.fade-in-item').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 100);

        featuredContainer.querySelectorAll('.product-card').forEach(card => {
            const openFromCard = () => {
                const productId = card.getAttribute('data-id');
                const product = window.store.getProduct(productId);
                if (product) openProductDetails(product);
            };
            card.addEventListener('click', openFromCard);
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openFromCard();
                }
            });
        });
    };

    if (featuredContainer) {
        renderFeatured();
        window.addEventListener('store:synced', renderFeatured, { once: true });
    }

    // Collections Page
    const collectionsContainer = document.getElementById('collections-container');
    if (collectionsContainer && window.store) {
        const products = window.store.getProducts();
        
        const renderCollection = (subset) => {
            collectionsContainer.innerHTML = subset.map(createProductCard).join('');
            // Re-aplicar fade in
             setTimeout(() => {
                document.querySelectorAll('#collections-container .fade-in-item').forEach(el => {
                    el.style.opacity = '1'; 
                    el.style.transform = 'translateY(0)';
                });
                collectionsContainer.querySelectorAll('.product-card').forEach(card => {
                    const openFromCard = () => {
                        const productId = card.getAttribute('data-id');
                        const product = window.store.getProduct(productId);
                        if (product) openProductDetails(product);
                    };

                    card.addEventListener('click', openFromCard);
                    card.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openFromCard();
                        }
                    });
                });
            }, 50);
        };
        
        renderCollection(products);

        // Check for highlight param
        const urlParams = new URLSearchParams(window.location.search);
        const highlightId = urlParams.get('highlight');
        if(highlightId) {
            setTimeout(() => {
                const item = document.querySelector(`.product-card[data-id="${highlightId}"]`);
                if(item) {
                    item.style.border = '2px solid var(--primary-color)';
                    item.style.transform = 'scale(1.05)';
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500); // Allow render to finish
        }

        // Filters in Collections
        const filters = document.querySelectorAll('.filter-options a');
        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                const category = filter.innerText.toLowerCase();
                if(category === 'todo' || category === 'all') {
                    renderCollection(products);
                } else {
                    const filtered = products.filter(p => p.category.toLowerCase() === category);
                    renderCollection(filtered);
                }
            });
        });
    }

});

// --- SEARCH FUNCTIONALITY ---
function toggleSearch(e) {
    if(e) e.preventDefault();
    const overlay = document.getElementById('search-overlay');
    if(overlay) {
        overlay.classList.toggle('active');
        if(overlay.classList.contains('active')) {
            document.getElementById('search-input').focus();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if(searchInput && window.store) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchResults.innerHTML = '';
            
            if(query.length < 2) return;

            const products = window.store.getProducts();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            );

            if(filtered.length === 0) {
                searchResults.innerHTML = '<p style="color:#666; text-align:center; padding:10px; background:#fff;">No se encontraron joyas.</p>';
            } else {
                filtered.forEach(p => {
                    const a = document.createElement('a');
                    a.href = 'collections.html?highlight=' + p.id; 
                    a.className = 'search-item';
                    a.onclick = (e) => {
                        e.preventDefault();
                        toggleSearch();
                        openProductDetails(p);
                    };
                    a.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '">' +
                        '<div class="search-info">' +
                            '<h4>' + p.name + '</h4>' +
                            '<span>' + (p.material || p.category) + '</span>' +
                        '</div>';
                    searchResults.appendChild(a);
                });
            }
        });
    }


});

