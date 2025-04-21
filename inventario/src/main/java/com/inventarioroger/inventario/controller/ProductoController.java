package com.inventarioroger.inventario.controller;

import com.inventarioroger.inventario.model.Producto;
import com.inventarioroger.inventario.repository.ProductoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto crearProducto(@Valid @RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        return producto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@Valid @PathVariable Long id, @RequestBody Producto productoActualizado) {
        return productoRepository.findById(id)
                .map(productoExistente -> {
                    productoExistente.setNombre(productoActualizado.getNombre());
                    productoExistente.setCantidad(productoActualizado.getCantidad());
                    productoExistente.setPrecio(productoActualizado.getPrecio());
                    productoRepository.save(productoExistente);
                    return ResponseEntity.ok(productoExistente);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent()) {
            productoRepository.delete(producto.get());
            return ResponseEntity.noContent().build(); // 204 sin contenido
        } else {
            return ResponseEntity.notFound().build(); // 404 si no existe
        }
    }
}
