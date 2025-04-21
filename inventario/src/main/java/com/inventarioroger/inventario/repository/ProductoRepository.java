package com.inventarioroger.inventario.repository;

import com.inventarioroger.inventario.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Aquí podemos añadir consultas personalizadas en el futuro
}