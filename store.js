// store.js - Arquitectura Híbrida (Local + Nube)
// Compatible con Firebase Cloud Firestore

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

const mergeByIdPreferLocal = (localItems = [], cloudItems = []) => {
    const map = new Map();
    cloudItems.forEach((item) => {
        if (item && item.id != null) map.set(String(item.id), item);
    });
    localItems.forEach((item) => {
        if (item && item.id != null) map.set(String(item.id), item);
    });
    return Array.from(map.values());
};

const mergeSubscribersPreferLocal = (localItems = [], cloudItems = []) => {
    const map = new Map();
    cloudItems.forEach((item) => {
        if (item && item.email) map.set(String(item.email).toLowerCase(), item);
    });
    localItems.forEach((item) => {
        if (item && item.email) map.set(String(item.email).toLowerCase(), item);
    });
    return Array.from(map.values());
};

// --- SINGLETON DE BASE DE DATOS ---
const DB = {
    isCloud: false,
    firestore: null,

    init: () => {
        // Detectar si hay configuración y librería cargada
        // Check window.firebase explicitly in case library failed to load
        if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
            try {
                // Prevenir doble inicialización
                if (!firebase.apps.length) {
                    firebase.initializeApp(window.FIREBASE_CONFIG);
                }
                DB.firestore = firebase.firestore();
                DB.isCloud = true;
                console.log("☁️ MODO NUBE ACTIVADO: Conectado a Firebase");
                
                // Sincronización Inicial (Bajada de datos)
                DB.syncDown();
            } catch (e) {
                console.error("Error conectando a Firebase:", e);
                DB.isCloud = false;
            }
        } else {
            console.log("🏠 MODO LOCAL: Usando localStorage (Gratis/Offline)");
        }
    },

    syncDown: async () => {
        if (!DB.isCloud) return;
        
        try {
            // Bajamos productos
            const pSnap = await DB.firestore.collection('products').get();
            if (!pSnap.empty) {
                const cloudProducts = pSnap.docs.map(doc => doc.data());
                const localProducts = Store.getProducts();
                const mergedProducts = mergeByIdPreferLocal(localProducts, cloudProducts).map(normalizeProduct);
                if (mergedProducts.length > 0) {
                    localStorage.setItem('joyeria_products', JSON.stringify(mergedProducts));
                    console.log("☁️ Productos sincronizados (" + mergedProducts.length + ")");
                }
            }

            // Bajamos configuración
            const cSnap = await DB.firestore.collection('config').doc('main').get();
            if (cSnap.exists) {
                const localConfig = Store.getConfig();
                const cloudConfig = cSnap.data() || {};
                // Preferimos siempre valores locales para no perder cambios del panel.
                const mergedConfig = { ...cloudConfig, ...localConfig };
                localStorage.setItem('joyeria_config', JSON.stringify(mergedConfig));
            }

            // Bajamos Mensajes (CRM)
            const mSnap = await DB.firestore.collection('messages').orderBy('date', 'desc').limit(50).get();
            if (!mSnap.empty) {
                const cloudMessages = mSnap.docs.map(doc => doc.data()).sort((a,b) => b.id - a.id);
                const localMessages = Store.getMessages();
                const mergedMessages = mergeByIdPreferLocal(localMessages, cloudMessages)
                    .sort((a, b) => Number(b.id) - Number(a.id));
                localStorage.setItem('joyeria_messages', JSON.stringify(mergedMessages));
            }

            // Bajamos Suscriptores
            const sSnap = await DB.firestore.collection('subscribers').get();
            if (!sSnap.empty) {
                const cloudSubs = sSnap.docs.map(doc => doc.data());
                const localSubs = Store.getSubscribers();
                const mergedSubs = mergeSubscribersPreferLocal(localSubs, cloudSubs);
                localStorage.setItem('joyeria_subscribers', JSON.stringify(mergedSubs));
            }

            // Bajamos Comentarios
            const commSnap = await DB.firestore.collection('comments').orderBy('createdAt', 'desc').limit(500).get();
            if (!commSnap.empty) {
                const cloudComments = commSnap.docs.map(doc => doc.data());
                const localComments = Store.getAllComments();
                const mergedComments = mergeByIdPreferLocal(localComments, cloudComments)
                    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                localStorage.setItem('joyeria_comments', JSON.stringify(mergedComments));
            }

            window.dispatchEvent(new CustomEvent('store:synced'));
        } catch (e) {
            console.warn("No se pudo sincronizar desde la nube:", e);
        }
    },

    save: async (collection, id, data) => {
        if (!DB.isCloud) return;
        try {
            await DB.firestore.collection(collection).doc(String(id)).set(data);
            console.log(`☁️ Guardado en nube: ${collection}/${id}`);
        } catch(e) {
            console.error("Error guardando en nube:", e);
        }
    },

    delete: async (collection, id) => {
        if (!DB.isCloud) return;
        try {
            await DB.firestore.collection(collection).doc(String(id)).delete();
            console.log(`☁️ Eliminado de nube: ${collection}/${id}`);
        } catch(e) { console.error(e); }
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
            createdAt: isNew ? Date.now() : (existingProduct?.createdAt || normalized.createdAt || 0),
            name: normalized.name,
            material: normalized.material,
            description: normalized.description,
            category: normalized.category,
            photos: normalized.photos,
            image: normalized.image,
            featured: normalized.featured
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
            if (DB.isCloud) DB.save('products', persisted.id, persisted);
            
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
        localStorage.setItem('joyeria_products', JSON.stringify(products));
        
        // SYNC CLOUD
        if (DB.isCloud) DB.delete('products', id);
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
            if (DB.isCloud) DB.save('config', 'main', config);
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
        localStorage.setItem('joyeria_messages', JSON.stringify(messages));
        
        // SYNC CLOUD
        if (DB.isCloud) DB.save('messages', msg.id, msg);
    },

    deleteMessage: (id) => {
        let messages = Store.getMessages();
        messages = messages.filter(m => m.id != id);
        localStorage.setItem('joyeria_messages', JSON.stringify(messages));
        
        // SYNC CLOUD
        if (DB.isCloud) DB.delete('messages', id);
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
        localStorage.setItem('joyeria_comments', JSON.stringify(all));
        if (DB.isCloud) DB.save('comments', saved.id, saved);
        return saved;
    },

    deleteComment: (id) => {
        let all = Store.getAllComments();
        all = all.filter(c => c.id != id);
        localStorage.setItem('joyeria_comments', JSON.stringify(all));
        if (DB.isCloud) DB.delete('comments', id);
    },

    // --- Subscribers ---
    getSubscribers: () => {
        const stored = localStorage.getItem('joyeria_subscribers');
        return stored ? JSON.parse(stored) : [];
    },

    addSubscriber: (email) => {
        const subs = Store.getSubscribers();
        if(!subs.includes(email)) {
            const newSub = { email, date: new Date().toLocaleDateString(), id: Date.now() };
            subs.unshift(newSub);
            localStorage.setItem('joyeria_subscribers', JSON.stringify(subs));
            
            // SYNC CLOUD
            if (DB.isCloud) DB.save('subscribers', newSub.id, newSub);
            
            return true;
        }
        return false;
    }
};

window.store = Store;
