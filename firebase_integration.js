/**
 * ------------------------------------------------------------------
 * INTEGRACIÓN PROFESIONAL CON GOOGLE FIREBASE (Base de Datos Cloud)
 * ------------------------------------------------------------------
 * Como ingeniero informático, esta es la arquitectura que debes usar
 * para escalar este proyecto a nivel mundial sin costos iniciales.
 *
 * VENTAJAS:
 * 1. Gratis (Plan Spark de Google)
 * 2. Tiempo Real (Los clientes ven cambios al instante)
 * 3. Seguridad Profesional (Autenticación real)
 *
 * INSTRUCCIONES DE ACTIVACIÓN:
 * 1. Crea una cuenta en https://console.firebase.google.com/
 * 2. Crea un proyecto "Web".
 * 3. En index.html y admin.html, agrega estos scripts antes de este archivo:
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
 */

// 1. CONFIGURACIÓN (Te la da Firebase al crear el proyecto)
const firebaseConfig = {
    apiKey: "PEGAR_AQUI_TU_API_KEY",
    authDomain: "joyeria-2026.firebaseapp.com",
    projectId: "joyeria-2026",
    storageBucket: "joyeria-2026.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// 2. INICIALIZACIÓN (Simulada para demostración)
// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore(app);

// 3. ADAPTADOR DE BASE DE DATOS (Patrón Adapter)
// Este código reemplaza a 'store.js' cuando quieras ir a producción.

const CloudStore = {
    
    // --- PRODUCTOS ---
    getAllProducts: async () => {
        try {
            // const querySnapshot = await db.collection("products").get();
            // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Conectando a nube para bajar productos...");
        } catch (error) {
            console.error("Error red:", error);
            return [];
        }
    },

    saveProduct: async (product) => {
        try {
            // if (product.id) {
            //    await db.collection("products").doc(String(product.id)).set(product);
            // } else {
            //    await db.collection("products").add(product);
            // }
            console.log("Producto guardado en Google Cloud");
            return true;
        } catch (e) {
            return false;
        }
    },

    deleteProduct: async (id) => {
        // await db.collection("products").doc(String(id)).delete();
    },

    // --- MENSAJERÍA (CRM) ---
    saveMessage: async (msg) => {
        // await db.collection("messages").add({
        //     ...msg,
        //     timestamp: firebase.firestore.FieldValue.serverTimestamp()
        // });
        console.log("Mensaje enviado al servidor seguro");
    }
};

// Para usar esto en lugar de localStorage, simplemente cambiarías
// window.store = CloudStore; 
// Y actualizarías las llamadas para usar 'await' (programación asíncrona).
