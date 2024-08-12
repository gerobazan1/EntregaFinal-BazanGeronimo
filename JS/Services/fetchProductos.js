// Función para cargar y almacenar productos en localStorage
const loadAndStoreProducts = async () => {
    try {
        const response = await fetch('/Data/productos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        guardarProductosEnLocalStorage({ productos: products });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
};

document.addEventListener('DOMContentLoaded', loadAndStoreProducts);