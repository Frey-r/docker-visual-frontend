# 🖥️ Docker Visual Frontend

![Vue Version](https://img.shields.io/badge/Vue-3.4%2B-green?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF?style=for-the-badge&logo=vite)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-orange?style=for-the-badge)

**Docker Visual Frontend** es una interfaz moderna y dinámica diseñada para gestionar tu ecosistema Docker de manera visual. Utilizando Vue 3 y D3.js, transforma la gestión de contenedores en una experiencia intuitiva y potente.

---

## 🚀 Instalación y Configuración

Configura el panel de control siguiendo estos pasos:

### Requisitos Previos
- **Node.js**: v18 o superior.
- **npm** o **bun** como gestor de paquetes.

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd docker-visual-frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas bun
    bun install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz con la siguiente variable:
    ```env
    VITE_API_URL=http://localhost:8080/api
    VITE_API_KEY=tu_clave_secreta
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🛠️ Uso

Una vez que el servidor esté corriendo, podrás acceder a:

-   **Dashboard:** Vista general de contenedores activos, imágenes y recursos del sistema.
-   **Graph View:** Representación visual interactiva (D3.js) de las redes y contenedores, mostrando cómo están interconectados.
-   **Images Manager:** Explora y gestiona tus imágenes locales, con opción de despliegue rápido.
-   **Project Deployment:** Despliega nuevos servicios simplemente proporcionando la URL de un repositorio Git.

---

## 💡 Motivación y Problema

Muchos desarrolladores y administradores de sistemas se sienten abrumados por la falta de visibilidad en entornos Docker complejos. El CLI no permite ver fácilmente las dependencias de red o el estado de salud global de un vistazo.

**Docker Visual Frontend** resuelve esto ofreciendo:
1.  **Transparencia Visual:** Ver conexiones en tiempo real.
2.  **Gestión Centralizada:** Un solo lugar para logs, estados y configuraciones.
3.  **Baja Curva de Aprendizaje:** Ideal para equipos que se están familiarizando con Docker.

---

## 👥 Créditos y Autores

Este proyecto ha sido desarrollado por:
- **Frey-r** - *Diseño de UI/UX y Desarrollo Frontend*

---

## 📄 Licencia

Este proyecto está bajo la licencia **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

**Puedes:**
- Compartir, copiar y redistribuir el material en cualquier medio o formato.
- Adaptar, remezclar, transformar y construir sobre el material.

**Bajo los siguientes términos:**
- **Atribución:** Debes dar crédito de manera adecuada.
- **No Comercial:** No puedes utilizar el material con fines comerciales o de lucro.

Para más detalles, consulta el archivo [LICENSE](LICENSE) o visita [creativecommons.org](https://creativecommons.org/licenses/by-nc/4.0/).
