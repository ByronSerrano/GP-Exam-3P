# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Examen Three.js - Skybox con Esfera y Modelo 3D

Este proyecto implementa una escena 3D usando Three.js con React/TypeScript que cumple con todos los requisitos del examen.

## Implementado por

- [ByXannaX](https://github.com/ByronSerrano)

## Requisitos Implementados

### 1. Skybox

- **Implementación**: Esfera grande (radius: 100) con textura equirectangular
- **Textura**: Imagen de cielo tormentoso (`/public/images/cielo_tormentoso.jpg`)
- **Técnica**: Material con `side: THREE.BackSide` para renderizar en el interior
- **Mapeo**: `THREE.EquirectangularReflectionMapping` para la textura panorámica

### 2. Modelo externo con animación incluida

- **Modelo**: `scene.gltf` cargado desde `/models/`
- **Loader**: GLTFLoader para cargar el modelo de rayo
- **Animación**: AnimationMixer reproduce todas las animaciones del modelo automáticamente
- **Escala**: Ajustada a 0.001 para tamaño apropiado
- **Sombras**: Configuradas para casting y receiving

### 3. Animación programada por el estudiante

- **Objeto**: Cubo verde brillante
- **Animaciones**:
  - Rotación continua en X e Y
  - Movimiento orbital alrededor del centro usando `Math.cos()` y `Math.sin()`
  - Movimiento vertical oscilante
- **Técnica**: Usando `clock.getElapsedTime()` para animaciones basadas en tiempo

### 4. Cámara personalizada

- **Tipo**: PerspectiveCamera (FOV: 75°)
- **OrbitControls**: Habilitados con damping para suavidad
- **Límites**: MinDistance: 2, MaxDistance: 50
- **Movimiento adicional**: Control manual con teclado (WASD + Q/E)

### 5. Efecto de postprocesado

- **EffectComposer**: Sistema de postprocesado implementado
- **Efectos aplicados**:
  - **UnrealBloomPass**: Efecto de brillo/glow (strength: 0.8)
  - **FilmPass**: Efecto vintage/film grain
- **Configuración**: Renderizado con tone mapping ACES Filmic

### 6. Interacción

- **Mouse**: OrbitControls para rotar, hacer zoom y pan
- **Teclado**:
  - `W/A/S/D`: Mover cámara en X/Z
  - `Q/E`: Mover cámara arriba/abajo
  - Movimiento fluido y responsivo

## Estructura del Proyecto

```
src/
├── ThreeScene.tsx    # Componente principal con toda la lógica 3D
├── App.tsx          # Aplicación principal
├── App.css          # Estilos para pantalla completa
└── index.css        # Estilos base
```

## Características Técnicas

### Efecto de postprocesado

- **Sistema**: EffectComposer con pipeline de múltiples pasadas
- **Efectos aplicados**:
  - **RenderPass**: Renderizado base de la escena
  - **UnrealBloomPass**: Efecto de brillo/glow avanzado
    - Strength: 0.6 (intensidad media)
    - Radius: 0.4 (radio de difusión)
    - Threshold: 0.8 (umbral de luminancia)
- **Tone Mapping**: ACES Filmic para colores cinematográficos
- **Fallback**: Renderizado directo si fallan los efectos

### Iluminación

- **AmbientLight**: Luz ambiental suave (0x404040, intensidad: 0.4)
- **DirectionalLight**: Luz direccional principal con sombras
- **PointLight**: Luz puntual azul cielo para dramatismo

### Sombras

- **Tipo**: PCFSoftShadowMap para sombras suaves
- **Resolución**: 2048x2048 para calidad
- **Objetos**: Modelo y cubo configurados para cast/receive shadows

### Optimizaciones

- **Cleanup**: Disposición correcta de recursos en useEffect cleanup
- **Resize**: Manejo de redimensionamiento de ventana
- **Performance**: AnimationFrame para renderizado smooth

## Controles

### Mouse

- **Clic y arrastrar**: Rotar cámara alrededor del centro
- **Scroll**: Zoom in/out (limitado entre 2-50 unidades)
- **Clic derecho + arrastrar**: Pan (si está habilitado)

### Teclado

- **W**: Mover cámara hacia adelante
- **S**: Mover cámara hacia atrás
- **A**: Mover cámara a la izquierda
- **D**: Mover cámara a la derecha
- **Q**: Mover cámara hacia abajo
- **E**: Mover cámara hacia arriba

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## Tecnologías Utilizadas

- **React 19** + **TypeScript**: Framework y tipado
- **Three.js**: Motor 3D
- **Vite**: Build tool y dev server
- **Addons utilizados**:
  - OrbitControls
  - GLTFLoader
  - EffectComposer
  - RenderPass
  - UnrealBloomPass
  - FilmPass

## Archivos de Assets

- **Modelo**: `/models/scene.gltf` (rayo con animación)
- **Textura Skybox**: `/public/images/cielo_tormentoso.jpg`
- **Licencia**: `/models/license.txt`

---

**Nota**: Este proyecto fue desarrollado para cumplir con todos los requisitos del examen de Gráficos por Computadora, implementando una escena inmersiva con skybox esférico, modelo animado, efectos visuales y controles interactivos.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
