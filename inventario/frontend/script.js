const API_URL = "http://localhost:8080/api/productos";
const listaProductos = document.getElementById("lista-productos");
const formulario = document.getElementById("formulario-producto");
const nombreInput = document.getElementById("nombre");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const botonEnviar = document.getElementById("boton-enviar");
const tabla = document.getElementById("tabla-productos");
const buscador = document.getElementById("buscador");
let criterioOrden = null;
let ordenAscendente = true;

buscador.addEventListener("input", obtenerProductos);


let editando = false;
let idEditando = null;

// Mostrar productos al cargar
document.addEventListener("DOMContentLoaded", obtenerProductos);

function ordenarPor(criterio) {
  if (criterioOrden === criterio) {
    ordenAscendente = !ordenAscendente;
  } else {
    criterioOrden = criterio;
    ordenAscendente = true;
  }

  actualizarFlechas(criterio);
  obtenerProductos();
}

// Obtener productos
function obtenerProductos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const textoBusqueda = buscador.value.toLowerCase();
      const productosFiltrados = data.filter(p =>
        p.nombre.toLowerCase().includes(textoBusqueda)
      );

      listaProductos.innerHTML = "";

      if (criterioOrden) {
        productosFiltrados.sort((a, b) => {
          if (a[criterioOrden] > b[criterioOrden]) return ordenAscendente ? 1 : -1;
          if (a[criterioOrden] < b[criterioOrden]) return ordenAscendente ? -1 : 1;
          return 0;
        });
      }

      productosFiltrados.forEach(producto => {
        renderizarProducto(producto);
      });

      document.getElementById("total-productos").textContent =
        `Total de productos: ${productosFiltrados.length}`;

      const valorTotal = productosFiltrados.reduce(
        (acc, p) => acc + (p.precio * p.cantidad),
        0
      );
      document.getElementById("valor-inventario").textContent =
        `Valor total del inventario: ${valorTotal.toFixed(2)} €`;
    });
}


// Renderizar un producto
function renderizarProducto(producto) {
  const div = document.createElement("div");
  div.className = "bg-gray-200 dark:bg-gray-800 p-4 shadow-md rounded-xl flex justify-between items-center mb-2";

  div.innerHTML = `
    <div>
      <p class="text-lg font-semibold text-blue-900 dark:text-blue-300">${producto.nombre}</p>
      <p class="text-gray-800 dark:text-gray-300">Cantidad: ${producto.cantidad}</p>
      <p class="text-gray-800 dark:text-gray-300">Precio: ${producto.precio} €</p>
    </div>
    <div class="space-x-2">
      <button class="editar bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
      <button class="eliminar bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
    </div>
  `;

  const botonEditar = div.querySelector(".editar");
  const botonEliminar = div.querySelector(".eliminar");

  botonEditar.addEventListener("click", () => {
    editarProducto(producto.id, producto.nombre, producto.cantidad, producto.precio);
  });

  botonEliminar.addEventListener("click", () => {
    eliminarProducto(producto.id);
  });

  listaProductos.appendChild(div);
}


// Crear o actualizar producto
formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const cantidad = parseInt(cantidadInput.value);
  const precio = parseFloat(precioInput.value);

  if (!nombre) {
    alert("El nombre del producto no puede estar vacío.");
    return;
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("La cantidad debe ser un número mayor que 0.");
    return;
  }

  if (isNaN(precio) || precio <= 0) {
    alert("El precio debe ser un número mayor que 0.");
    return;
  }

  const nuevoProducto = { nombre, cantidad, precio };

  const metodo = editando ? "PUT" : "POST";
  const url = editando ? `${API_URL}/${idEditando}` : API_URL;

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoProducto),
  })
    .then(res => {
      if (!res.ok) throw new Error("Error en la solicitud.");
      return res.json();
    })
    .then(() => {
      obtenerProductos();
      formulario.reset();
      mostrarNotificacion(editando ? "Producto actualizado" : "Producto añadido");
      editando = false;
      idEditando = null;
      botonEnviar.textContent = "Añadir producto";
    })
    .catch(() => {
      mostrarNotificacion("Error al guardar el producto", "bg-red-500");
    });
});

// Eliminar producto con confirmación
function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error();
      obtenerProductos();
      mostrarNotificacion("Producto eliminado");
    })
    .catch(() => {
      mostrarNotificacion("Error al eliminar el producto", "bg-red-500");
    });
}

// Preparar para editar producto
function editarProducto(id, nombre, cantidad, precio) {
  nombreInput.value = nombre;
  cantidadInput.value = cantidad;
  precioInput.value = precio;
  editando = true;
  idEditando = id;
  botonEnviar.textContent = "Actualizar producto";
}

function actualizarFlechas(criterioActivo) {
  const flecha = ordenAscendente ? " 🔼" : " 🔽";

  // Lista de botones
  const botones = {
    nombre: document.getElementById("boton-nombre"),
    cantidad: document.getElementById("boton-cantidad"),
    precio: document.getElementById("boton-precio")
  };

  // Resetear textos
  for (let clave in botones) {
    botones[clave].textContent = clave.charAt(0).toUpperCase() + clave.slice(1);
  }

  // Añadir flecha al botón activo
  botones[criterioActivo].textContent += flecha;
}
function mostrarNotificacion(mensaje, color = "bg-green-500") {
  const noti = document.getElementById("notificacion");
  noti.className = `fixed bottom-5 right-5 text-white px-4 py-2 rounded shadow-lg ${color} z-50`;
  noti.textContent = mensaje;
  noti.style.opacity = "1";
  noti.classList.remove("hidden");

  setTimeout(() => {
    noti.style.opacity = "0";
    setTimeout(() => {
      noti.classList.add("hidden");
    }, 500);
  }, 2000);
}

// Función para convertir los productos visibles en CSV y descargarlo
document.getElementById("descargar-csv").addEventListener("click", () => {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const textoBusqueda = buscador.value.toLowerCase();
      const productosFiltrados = data.filter(p =>
        p.nombre.toLowerCase().includes(textoBusqueda)
      );

      if (criterioOrden) {
        productosFiltrados.sort((a, b) => {
          if (a[criterioOrden] > b[criterioOrden]) return ordenAscendente ? 1 : -1;
          if (a[criterioOrden] < b[criterioOrden]) return ordenAscendente ? -1 : 1;
          return 0;
        });
      }

      if (productosFiltrados.length === 0) {
        alert("No hay productos que exportar.");
        return;
      }

      const encabezado = "ID,Nombre,Cantidad,Precio\n";
      const filas = productosFiltrados.map(p =>
        `${p.id},"${p.nombre.replace(/"/g, '""')}",${p.cantidad},${p.precio}`
      ).join("\n");

      const csv = encabezado + filas;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "inventario.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
});

