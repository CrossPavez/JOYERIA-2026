// auth.js - Gestión de Autenticación (Simulada para Client-Side)

// Configuración inicial por defecto (si no existe en localStorage)
const defaultCreds = {
    username: 'admin',
    password: 'admin', // En un entorno real, esto iría hasheado en DB
    avatar: 'logo.svg'
};

const Auth = {
    // Inicializar credenciales si no existen
    init: () => {
        let creds = localStorage.getItem('joyeria_admin_creds');
        if (!creds) {
            localStorage.setItem('joyeria_admin_creds', JSON.stringify(defaultCreds));
        } else {
            // Migración automática: Si tiene el placeholder antiguo, actualizar al logo
            const parsed = JSON.parse(creds);
            if (parsed.avatar.includes('via.placeholder.com')) {
                parsed.avatar = 'logo.svg';
                localStorage.setItem('joyeria_admin_creds', JSON.stringify(parsed));
            }
        }
    },

    // Obtener credenciales actuales
    getCreds: () => {
        Auth.init();
        return JSON.parse(localStorage.getItem('joyeria_admin_creds'));
    },

    // Verificar login
    login: (username, password) => {
        const creds = Auth.getCreds();
        if (username === creds.username && password === creds.password) {
            // Guardar sesión (sessionStorage se borra al cerrar el navegador)
            sessionStorage.setItem('joyeria_admin_session', 'true');
            return true;
        }
        return false;
    },

    // Cerrar sesión
    logout: () => {
        sessionStorage.removeItem('joyeria_admin_session');
        window.location.href = 'login.html';
    },

    // Verificar si está logueado
    checkSession: () => {
        if (!sessionStorage.getItem('joyeria_admin_session')) {
            window.location.href = 'login.html';
        }
    },

    // Actualizar perfil
    updateProfile: (newUsername, newPassword, newAvatar) => {
        const creds = Auth.getCreds();
        if (newUsername) creds.username = newUsername;
        if (newPassword) creds.password = newPassword;
        if (newAvatar) creds.avatar = newAvatar;
        
        localStorage.setItem('joyeria_admin_creds', JSON.stringify(creds));
        return true;
    }
};

// Auto-inicializar
Auth.init();
