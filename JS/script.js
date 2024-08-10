// Funciones de validación
const validarInt = (numero) => !isNaN(numero) && parseInt(numero) > 0;
const validarFloat = (numero) => !isNaN(numero) && parseFloat(numero) > 0;
const validarString = (texto) => typeof texto === 'string' && isNaN(texto) && texto.trim().length > 0;

const validarCampos = (categoria, nombre, cantidad, precio) => {
    if (!categoria || !nombre || !cantidad || !precio) {
        Swal.fire('Todos los campos son obligatorios.');
        return false;
    }
    if (!validarString(categoria)) {
        Swal.fire('La categoría debe ser un texto y no debe contener números.');
        return false;
    }
    if (!validarInt(cantidad)) {
        Swal.fire('La cantidad debe ser un número entero positivo.');
        return false;
    }
    if (!validarFloat(precio)) {
        Swal.fire('El precio debe ser un número positivo.');
        return false;
    }
    return true;
};

// Funciones de almacenamiento
const obtenerProductosDesdeLocalStorage = () => {
    const storedData = localStorage.getItem('productos');
    return storedData ? JSON.parse(storedData) : { productos: [] };
};

const guardarProductosEnLocalStorage = (products) => {
    localStorage.setItem('productos', JSON.stringify(products));
};

// Funciones de visualización
const displayProductos = (products, mostrarAcciones = true, originalIndices = []) => {
    const tbody = document.querySelector('#productos-tabla tbody');
    const thead = document.querySelector('#productos-tabla thead');

    tbody.innerHTML = ''; 

    // Mostrar/ocultar columna de acciones
    if (mostrarAcciones) {
        thead.classList.add('mostrar-acciones');
        tbody.classList.add('mostrar-acciones');
    } else {
        thead.classList.remove('mostrar-acciones');
        tbody.classList.remove('mostrar-acciones');
    }

    const inicio = (actualPagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPaginados = products.slice(inicio, fin);

    productosPaginados.forEach((product, index) => {
        const row = document.createElement('tr');
        const originalIndex = originalIndices.length > 0 ? originalIndices[inicio + index] : inicio + index;
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>${product.cantidad}</td>
            <td>${product.precio}</td>
            ${mostrarAcciones ? `
                <td class="acciones-column">
                    <button class="editar-button" onclick="editProductModal(${originalIndex})">Editar</button>
                    <button class="eliminar-button" onclick="deleteProduct(${originalIndex})">Eliminar</button>
                </td>
            ` : ''}
        `;
        tbody.appendChild(row);
    });

    // Mostrar controles de paginación
    const totalPaginas = Math.ceil(products.length / productosPorPagina);
    displayControlPaginacion(totalPaginas);
};

// Funciones de manejo de productos
const validarNombreDuplicado = (nombre) => {
    const products = obtenerProductosDesdeLocalStorage();
    return products.productos.some(producto => producto.nombre.toLowerCase() === nombre.toLowerCase());
};

const mostrarModalAgregarProducto = () => {
    document.querySelector('#agregar-producto-modal').style.display = 'block';
};

const cerrarModalAgregarProducto = () => {
    document.querySelector('#agregar-producto-modal').style.display = 'none';
};

function ordenarProductos(products) {
    return products.sort((a, b) => {
        // Comparar por categoría
        if (a.categoria.toLowerCase() < b.categoria.toLowerCase()) return -1;
        if (a.categoria.toLowerCase() > b.categoria.toLowerCase()) return 1;

        // Comparar por nombre
        if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
        if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;

        // Comparar por precio (de menor a mayor)
        if (a.precio < b.precio) return -1;
        if (a.precio > b.precio) return 1;

        // Comparar por cantidad (de menor a mayor)
        if (a.cantidad < b.cantidad) return -1;
        if (a.cantidad > b.cantidad) return 1;

        return 0;
    });
}

const agregarProducto = () => {
    const categoria = document.querySelector('#agregar-modal-producto-categoria').value.trim();
    const nombre = document.querySelector('#agregar-modal-producto-nombre').value.trim();
    const cantidad = document.querySelector('#agregar-modal-producto-cantidad').value.trim();
    const precio = document.querySelector('#agregar-modal-producto-precio').value.trim();

    if (validarCampos(categoria, nombre, cantidad, precio)) {
        // Verifico si el producto ya existe
        if (validarNombreDuplicado(nombre)) {
            Swal.fire('El producto ya existe.');
            return;
        }
        Swal.fire({
            title: '¿Deseas registrar el producto' + ` "${nombre}"` + '?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Obtengo productos y agrego el nuevo
                const products = obtenerProductosDesdeLocalStorage();
                products.productos.push({ nombre: nombre, categoria: categoria, cantidad: parseInt(cantidad, 10), precio: parseFloat(precio) });
                // Ordeno los productos
                const productosOrdenados = ordenarProductos(products.productos);
                // Guardo los productos ordenados en localStorage
                guardarProductosEnLocalStorage({ productos: productosOrdenados });
                mostrarToast('Producto agregado con éxito', 'success');
                mostrarProductos();
                cerrarModalAgregarProducto(); 
                // Vacio el formulario
                document.querySelector('#agregar-modal-producto-nombre').value = '';
                document.querySelector('#agregar-modal-producto-categoria').value = '';
                document.querySelector('#agregar-modal-producto-cantidad').value = '';
                document.querySelector('#agregar-modal-producto-precio').value = '';
            }
        });
    } else {
        console.log('Error al validar campos');
    }
};

document.querySelector('#agregar-producto-button').addEventListener('click', mostrarModalAgregarProducto);
document.querySelector('#agregar-modal-close-button').addEventListener('click', cerrarModalAgregarProducto);
document.querySelector('#agregar-modal-button').addEventListener('click', agregarProducto);

const editProductModal = (index) => {
    const products = obtenerProductosDesdeLocalStorage();
    const product = products.productos[index];
    document.querySelector('#editar-modal-producto-nombre').value = product.nombre;
    document.querySelector('#editar-modal-producto-categoria').value = product.categoria;
    document.querySelector('#editar-modal-producto-cantidad').value = product.cantidad;
    document.querySelector('#editar-modal-producto-precio').value = product.precio;
    document.querySelector('#editar-producto-modal').style.display = 'block';
    document.querySelector('#editar-modal-update-button').setAttribute('data-index', index);
};

const actualizarProducto = () => {
    const index = document.querySelector('#editar-modal-update-button').getAttribute('data-index');
    const nombre = document.querySelector('#editar-modal-producto-nombre').value.trim();
    const categoria = document.querySelector('#editar-modal-producto-categoria').value.trim();
    const cantidad = document.querySelector('#editar-modal-producto-cantidad').value.trim();
    const precio = document.querySelector('#editar-modal-producto-precio').value.trim();

    if (validarCampos(categoria, nombre, cantidad, precio)) {
        const products = obtenerProductosDesdeLocalStorage();
        // Verificar si el nombre es duplicado
        if (products.productos.some((producto, i) => producto.nombre.toLowerCase() === nombre.toLowerCase() && i !== parseInt(index))) {
            Swal.fire('Ya existe un producto con este nombre.');
            return;
        }
        Swal.fire({
            title: '¿Estás seguro de que quieres actualizar el producto' + ` "${nombre}"`+ '?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                products.productos[index] = { nombre, categoria, cantidad: parseInt(cantidad, 10), precio: parseFloat(precio) };
                guardarProductosEnLocalStorage(products);
                mostrarToast('Producto actualizado con éxito', 'warning');
                mostrarProductos();
                cerrarModalEditarProducto();
            }
        });
    }
};

const cerrarModalEditarProducto = () => {
    document.querySelector('#editar-producto-modal').style.display = 'none';
};

const deleteProduct = (index) => {
    const products = obtenerProductosDesdeLocalStorage();
    const nombreProducto = products.productos[index].nombre;
    Swal.fire({
        title: '¿Estás seguro de que quieres eliminar el producto' + ` "${nombreProducto}"`+ '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar el producto del array
            products.productos.splice(index, 1);
            // Guardar los cambios en localStorage
            guardarProductosEnLocalStorage(products);
            mostrarToast('Producto eliminado con éxito', 'error');
            mostrarProductos();
        }
    });
};

// Funcion para mostrar toasts
const mostrarToast = (message, type) => {
    const toastStyles = {
        success: {
            background: '#28a745',
            textColor: '#fff'
        },
        error: {
            background: '#dc3545',
            textColor: '#fff'
        },
        warning: {
            background: '#ffc107',
            textColor: '#000'
        }
    };

    const style = toastStyles[type] || {
        background: '#333',
        textColor: '#fff'
    };

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: 'bottom',
        position: 'right',
        backgroundColor: style.background,
        className: 'toast-message',
        offset: {
            x: 20,
            y: 70
        },
        onClick: () => {}
    }).showToast();
};

// Funciones de eventos
document.querySelector('#agregar-producto-button').addEventListener('click', mostrarModalAgregarProducto);
document.querySelector('#agregar-modal-close-button').addEventListener('click', cerrarModalAgregarProducto);
document.querySelector('#agregar-modal-button').addEventListener('click', agregarProducto);
document.querySelector('#editar-modal-close-button').addEventListener('click', cerrarModalEditarProducto);
document.querySelector('#editar-modal-update-button').addEventListener('click', actualizarProducto);

document.querySelector('#buscar-button').addEventListener('click', () => {
    const palabra = document.querySelector('#buscar-input').value.toLowerCase();
    const productos = obtenerProductosDesdeLocalStorage();
    const productosFiltrados = [];
    const originalIndices = [];

    productos.productos.forEach((producto, index) => {
        if (
            producto.nombre.toLowerCase().includes(palabra) ||
            producto.categoria.toLowerCase().includes(palabra) ||
            producto.cantidad.toString().includes(palabra) ||
            producto.precio.toString().includes(palabra)
        ) {
            productosFiltrados.push(producto);
            originalIndices.push(index);
        }
    });

    displayProductos(productosFiltrados, true, originalIndices);
});

const mostrarProductos = () => {
    const products = obtenerProductosDesdeLocalStorage();
    displayProductos(products.productos, true); 
};

// "Mostrar Inventario"
document.querySelector('#mostrar-inventario-button').addEventListener('click', () => {
    mostrarProductos(); 
});

document.addEventListener('DOMContentLoaded', mostrarProductos);

// Variables de paginacion
let actualPagina = 1;
const productosPorPagina = 15;

// Cambiar de pagina
const cambiarPagina = (pagina) => {
    const products = obtenerProductosDesdeLocalStorage().productos;
    const totalPaginas = Math.ceil(products.length / productosPorPagina);
    
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas) pagina = totalPaginas;
    
    actualPagina = pagina;
    displayProductos(products, true);
};

// Paginacion
const displayControlPaginacion = (totalPaginas) => {
    const paginacionContainer = document.querySelector('#paginacion-controles');
    paginacionContainer.innerHTML = ''; 

    for (let i = 1; i <= totalPaginas; i++) {
        const paginaButton = document.createElement('button');
        paginaButton.innerText = i;
        paginaButton.classList.add('page-button');
        if (i === actualPagina) paginaButton.classList.add('active');
        paginaButton.addEventListener('click', () => cambiarPagina(i));
        paginacionContainer.appendChild(paginaButton);
    }
};