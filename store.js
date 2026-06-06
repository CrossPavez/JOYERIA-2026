// store.js - Arquitectura Híbrida (Local + Nube)
// Compatible con Supabase REST API (sin SDK, solo fetch)

// --- DATOS POR DEFECTO ---
const normalizeProduct = (product = {}) => {
    const photos = Array.isArray(product.photos)
        ? product.photos.filter(Boolean)
        : [];

    if (photos.length === 0 && product.image) {
        photos.push(product.image);
    }

    const primaryImage = product.image || photos[0] || 'logo.svg';

    return {
        ...product,
        name: product.name || '',
        material: product.material || '',
        description: product.description || '',
        category: product.category || 'anillos',
        featured: Boolean(product.featured),
        createdAt: product.createdAt || 0,
        videos: Array.isArray(product.videos) ? product.videos.filter(Boolean) : [],
        photos: photos.slice(0, 5),
        image: primaryImage
    };
};

const defaultProducts = [
    normalizeProduct({
        id: 1,
        name: "Anillo Motion",
        material: "Oro blanco 18K y diamante central",
        description: "Pieza contemporánea de líneas limpias con engaste artesanal y acabado pulido.",
        category: "anillos",
        photos: ["anillo.webp"],
        featured: true
    }),
    normalizeProduct({
        id: 2,
        name: "Brazalete Star",
        material: "Oro amarillo 18K",
        description: "Brazalete rígido con presencia escultórica y detalles de luz en el contorno.",
        category: "pulseras",
        photos: ["carrusel.svg"],
        featured: true
    }),
    normalizeProduct({
        id: 3,
        name: "Collar Diamond",
        material: "Oro blanco, diamantes y engaste fino",
        description: "Collar de gala con caída elegante y centro luminoso para piezas de ocasión especial.",
        category: "collares",
        photos: ["carrusel2.svg"],
        featured: true
    }),
    normalizeProduct({
        id: 4,
        name: "Aretes Gold",
        material: "Oro amarillo pulido",
        description: "Aretes ligeros con silueta limpia y brillo suave para uso diario o eventos.",
        category: "pendientes",
        photos: ["logo.svg"],
        featured: true
    }),
    normalizeProduct({
        id: 5,
        name: "Anillo Solitario",
        material: "Oro blanco 18K",
        description: "Anillo minimalista con piedra central protagonista y perfil delicado.",
        category: "anillos",
        photos: ["anillo.webp"],
        featured: false
    }),
    normalizeProduct({
        id: 6,
        name: "Collar Perlas",
        material: "Perlas cultivadas y cierre en oro",
        description: "Collar clásico reinterpretado con proporciones finas y terminación elegante.",
        category: "collares",
        photos: ["carrusel2.svg"],
        featured: false
    })
];

const defaultConfig = {
    heroTitle: "CADA PIEZA, UNA HISTORIA",
    heroSubtitle: "Joyería artesanal diseñada y elaborada a mano.",
    heroCtaText: "Ver Catálogo",
    heroCtaLink: "collections.html",
    contactEmail: "contacto@asbeziad.com",
    contactPhone: "+1 234 567 890",
    heroImage: "carrusel2.svg",
    featuredTitle: "Últimas Piezas",
    bespokeTitle: "PIEZAS A MEDIDA",
    bespokeSubtitle: "¿Tenés una idea en mente? Me encanta hacerla realidad.",
    bespokeCtaText: "Hacer un encargo",
    bespokeCtaLink: "bespoke.html",
    catRingImage: "anillo.webp",
    catNecklaceImage: "carrusel2.svg",
    catBraceletImage: "carrusel.svg",
    bespokeImage: "carrusel2.svg"
};

const mergeByIdPreferLocal = (localItems, cloudItems) => {
    localItems = localItems || [];
    cloudItems = cloudItems || [];
    const map = new Map();
    cloudItems.forEach(function(item) {
        if (item && item.id != null) map.set(String(item.id), item);
    });
    localItems.forEach(function(item) {
        if (item && item.id != null) map.set(String(item.id), item);
    });
    return Array.from(map.values());
};

const mergeSubscribersPreferLocal = (localItems, cloudItems) => {
    localItems = localItems || [];
    cloudItems = cloudItems || [];
    const map = new Map();
    cloudItems.forEach(function(item) {
        if (item && item.email) map.set(String(item.email).toLowerCase(), item);
    });
    localItems.forEach(function(item) {
        if (item && item.email) map.set(String(item.email).toLowerCase(), item);
    });
    return Array.from(map.values());
};

// --- SINGLETON DE BASE DE DATOS ---
const DB = {
    isCloud: false,

    init: function() {
        var url = window.SUPABASE_URL || '';
        var key = window.SUPABASE_KEY || '';

        if (
            url &&
            key &&
            url !== 'TU_PROJECT_URL_AQUI' &&
            key !== 'TU_ANON_KEY_AQUI'
        ) {
            DB.isCloud = true;
            console.log('☁️ MODO NUBE ACTIVADO: Conectado a Supabase');
            DB.syncDown();
        } else {
            console.log('🏠 MODO LOCAL: Usando localStorage (Gratis/Offline)');
        }
    },

    _headers: function() {
        var key = window.SUPABASE_KEY || '';
        return {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json'
        };
    },

    _get: async function(collection) {
        try {
            var url = window.SUPABASE_URL + '/rest/v1/kv?key=eq.' + encodeURIComponent(collection) + '&select=value';
            var res = await fetch(url, { headers: DB._headers() });
            if (!res.ok) return null;
            var rows = await res.json();
            if (!Array.isArray(rows) || rows.length === 0) return null;
            return rows[0].value;
        } catch(e) {
            console.warn('Supabase _get error (' + collection + '):', e);
            return null;
        }
    },

    _set: async function(collection, value) {
        try {
            var url = window.SUPABASE_URL + '/rest/v1/kv';
            var res = await fetch(url, {
                method: 'POST',
                headers: Object.assign({}, DB._headers(), { 'Prefer': 'resolution=merge-duplicates' }),
                body: JSON.stringify({ key: collection, value: value })
            });
            return res.ok;
        } catch(e) {
            console.error('Supabase _set error (' + collection + '):', e);
            return false;
        }
    },

    syncDown: async function() {
        if (!DB.isCloud) return;

        try {
            // Bajamos productos
            var cloudProducts = await DB._get('products');
            if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
                var localProducts = Store.getProducts();
                var mergedProducts = mergeByIdPreferLocal(localProducts, cloudProducts).map(normalizeProduct);
                if (mergedProducts.length > 0) {
                    localStorage.setItem('joyeria_products', JSON.stringify(mergedProducts));
                    console.log('☁️ Productos sincronizados (' + mergedProducts.length + ')');
                }
            }

            // Bajamos configuración
            var cloudConfig = await DB._get('config');
            if (cloudConfig && typeof cloudConfig === 'object') {
                var localRaw = localStorage.getItem('joyeria_config');
                var mergedConfig = localRaw
                    ? Object.assign({}, cloudConfig, JSON.parse(localRaw))
                    : cloudConfig;
                localStorage.setItem('joyeria_config', JSON.stringify(mergedConfig));
            }

            // Bajamos mensajes (CRM)
            var cloudMessages = await DB._get('messages');
            if (Array.isArray(cloudMessages) && cloudMessages.length > 0) {
                var localMessages = Store.getMessages();
                var mergedMessages = mergeByIdPreferLocal(localMessages, cloudMessages)
                    .sort(function(a, b) { return Number(b.id) - Number(a.id); });
                localStorage.setItem('joyeria_messages', JSON.stringify(mergedMessages));
            }

            // Bajamos suscriptores
            var cloudSubs = await DB._get('subscribers');
            if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
                var localSubs = Store.getSubscribers();
                var mergedSubs = mergeSubscribersPreferLocal(localSubs, cloudSubs);
                localStorage.setItem('joyeria_subscribers', JSON.stringify(mergedSubs));
            }

            // Bajamos comentarios
            var cloudComments = await DB._get('comments');
            if (Array.isArray(cloudComments) && cloudComments.length > 0) {
                var localComments = Store.getAllComments();
                var mergedComments = mergeByIdPreferLocal(localComments, cloudComments)
                    .sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
                localStorage.setItem('joyeria_comments', JSON.stringify(mergedComments));
            }

            window.dispatchEvent(new CustomEvent('store:synced'));
        } catch(e) {
            console.warn('No se pudo sincronizar desde la nube:', e);
        }
    },

    save: async function(collection, fullData) {
        if (!DB.isCloud) return;
        var ok = await DB._set(collection, fullData);
        if (ok) {
            console.log('☁️ Guardado en nube: ' + collection);
        } else {
            console.error('Error guardando en nube: ' + collection);
        }
    }
};

// Inicializar DB al cargar script
DB.init();


// --- TIENDA PÚBLICA (API) ---
const Store = {

    // --- Products ---
    getProducts: () => {
        const stored = localStorage.getItem('joyeria_products');
        const products = stored ? JSON.parse(stored) : defaultProducts;
        return products.map(normalizeProduct);
    },

    getProduct: (id) => {
        const products = Store.getProducts();
        return products.find(p => p.id == id);
    },

    saveProduct: (product) => {
        const products = Store.getProducts();
        const normalized = normalizeProduct(product);
        const isNew = !product.id;
        const existingProduct = product.id ? products.find(p => p.id == product.id) : null;
        const persisted = {
            id: isNew ? Date.now() : Number(product.id),
            createdAt: isNew ? Date.now() : ((existingProduct && existingProduct.createdAt) || normalized.createdAt || 0),
            name: normalized.name,
            material: normalized.material,
            description: normalized.description,
            category: normalized.category,
            photos: normalized.photos,
            image: normalized.image,
            featured: normalized.featured,
            videos: normalized.videos
        };

        if (product.id) {
            const index = products.findIndex(p => p.id == product.id);
            if (index !== -1) {
                products[index] = persisted;
            } else { return false; }
        } else {
            products.push(persisted);
        }

        try {
            localStorage.setItem('joyeria_products', JSON.stringify(products));

            // SYNC CLOUD
            if (DB.isCloud) DB.save('products', products);

            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                alert('¡Memoria llena! Intenta usar imágenes más pequeñas.');
            }
            return false;
        }
    },

    deleteProduct: (id) => {
        let products = Store.getProducts();
        products = products.filter(p => p.id != id);
        try { localStorage.setItem('joyeria_products', JSON.stringify(products)); } catch(e) {}
        if (DB.isCloud) DB.save('products', products);
    },

    // --- Statistics ---
    getStats: () => {
        const products = Store.getProducts();
        const totalItems = products.length;
        const totalPhotos = products.reduce((sum, p) => sum + (Array.isArray(p.photos) ? p.photos.length : 0), 0);
        const categories = {};
        products.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
        return { totalItems, totalPhotos, categories };
    },

    // --- Config ---
    getConfig: () => {
        const stored = localStorage.getItem('joyeria_config');
        return stored ? JSON.parse(stored) : defaultConfig;
    },

    saveConfig: (config) => {
        try {
            localStorage.setItem('joyeria_config', JSON.stringify(config));
            // SYNC CLOUD
            if (DB.isCloud) DB.save('config', config);
        } catch (e) {
            alert('Error guardando configuración (posiblemente imagen muy grande).');
        }
    },

    // --- Messages ---
    getMessages: () => {
        const stored = localStorage.getItem('joyeria_messages');
        return stored ? JSON.parse(stored) : [];
    },

    saveMessage: (msg) => {
        const messages = Store.getMessages();
        msg.id = Date.now();
        msg.date = new Date().toLocaleDateString();
        messages.unshift(msg);
        try { localStorage.setItem('joyeria_messages', JSON.stringify(messages)); } catch(e) {}
        if (DB.isCloud) DB.save('messages', messages);
    },

    deleteMessage: (id) => {
        let messages = Store.getMessages();
        messages = messages.filter(m => m.id != id);
        try { localStorage.setItem('joyeria_messages', JSON.stringify(messages)); } catch(e) {}
        if (DB.isCloud) DB.save('messages', messages);
    },

    // --- Comments ---
    getAllComments: () => {
        const stored = localStorage.getItem('joyeria_comments');
        return stored ? JSON.parse(stored) : [];
    },

    getComments: (productId) => {
        return Store.getAllComments().filter(c => String(c.productId) === String(productId));
    },

    saveComment: (comment) => {
        const all = Store.getAllComments();
        const saved = {
            id: Date.now(),
            productId: String(comment.productId),
            nick: ((comment.nick || '').trim().slice(0, 30)) || 'Anónimo',
            text: comment.text.trim().slice(0, 500),
            date: new Date().toLocaleDateString('es-AR'),
            createdAt: Date.now()
        };
        all.unshift(saved);
        try {
            localStorage.setItem('joyeria_comments', JSON.stringify(all));
        } catch(e) {
            console.warn('No se pudo guardar el comentario (almacenamiento lleno).');
            return null;
        }
        if (DB.isCloud) DB.save('comments', all);
        return saved;
    },

    deleteComment: (id) => {
        let all = Store.getAllComments();
        all = all.filter(c => c.id != id);
        try { localStorage.setItem('joyeria_comments', JSON.stringify(all)); } catch(e) {}
        if (DB.isCloud) DB.save('comments', all);
    },

    // --- Subscribers ---
    getSubscribers: () => {
        const stored = localStorage.getItem('joyeria_subscribers');
        return stored ? JSON.parse(stored) : [];
    },

    addSubscriber: (email) => {
        const subs = Store.getSubscribers();
        if(!subs.find(s => (s.email || s) === email)) {
            const newSub = { email, date: new Date().toLocaleDateString(), id: Date.now() };
            subs.unshift(newSub);
            try { localStorage.setItem('joyeria_subscribers', JSON.stringify(subs)); } catch(e) {}
            if (DB.isCloud) DB.save('subscribers', subs);
            return true;
        }
        return false;
    }
};

window.store = Store;
