# Sistema de Control de Ingresos y Gestión de Pases de Acceso Transitorios

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)

Proyecto desarrollado en el **SIAG** para la **Base Naval Puerto Belgrano (BNPB)**.

**Desarrollado por:**
* MITV Navarro Ramiro Ezequiel
* Guillermo Soler Vidal (Colaborador Principal)

---

## 📋 Descripción del Proyecto

El objetivo de este proyecto es reemplazar el sistema heredado (Microsoft Access) por una aplicación web moderna, robusta y escalable.

El sistema permite que todos los registros de ingresos y egresos estén disponibles para consulta permanente, facilitando el control y los estudios de seguridad. Soluciona la falta de intuición del sistema anterior, incorporando búsquedas con filtros avanzados, generación de reportes e impresión de pases.

### Problemas que resuelve:
* **Centralización:** Reemplazo de registros manuales y bases de datos aisladas.
* **Usabilidad:** Interfaz moderna e intuitiva frente a la complejidad de MS Access.
* **Consultas:** Capacidad de filtrar y buscar datos históricos rápidamente.
* **Impresión:** Módulo dedicado para la impresión de credenciales y pases.

## 🚀 Objetivos Principales

* **Celeridad:** Atender rápidamente todas las solicitudes de acceso y vinculaciones.
* **Seguridad y Legalidad:** Cumplir con los requisitos legales y reglamentarios de la BNPB.
* **Trazabilidad:** Identificar y seguir los ingresos a Zona Reservada y Zona Restringida.
* **Estabilidad:** Minimizar las fallas recurrentes del sistema anterior.
* **Escalabilidad:** Arquitectura preparada para futuras actualizaciones.

## 🛠️ Stack Tecnológico

Este proyecto utiliza tecnologías web modernas para asegurar rendimiento y facilidad de mantenimiento.

* **Frontend:** [Next.js](https://nextjs.org) (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** [Tailwind CSS - ShadCN]
* **Base de Datos:** [PostgreSQL - node pg]
* **Autenticación:** [BetterAuth]

## 💻 Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en un entorno local.

### Prerrequisitos
* Node.js (Versión 18 o superior)
* PostgreSQL

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://gitlabsiag.armada.mil.ar/sio/betterauth.git
    cd nombre-del-proyecto
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas yarn
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto basándote en el archivo de ejemplo.
    ```bash
    cp .env.example .env.local
    ```
    *Asegúrate de configurar las credenciales de la base de datos en este archivo.*

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Verificar:**
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📄 Visión del Producto

> **Para** la BASE NAVAL PUERTO BELGRANO (CARGO CONTRA-INTELIGENCIA), **quien** tiene la necesidad de contar con información para el seguimiento del personal dentro de Zona Reservada y Restringida.
>
> **El** Sistema de Control de Ingresos es una aplicación web **que** permite registrar, consultar, imprimir y auditar los movimientos en la base de manera ágil.
>
> **A diferencia de** los registros manuales o el sistema en Microsoft Access, **nuestro producto** ofrece una base de datos centralizada con formularios electrónicos y reportes web modernos.

---
© 2024 - SIAG - Base Naval Puerto Belgrano