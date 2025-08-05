// Inicializar AOS
AOS.init({
    duration: 1000,
    once: true
});

// Crear menos partículas para mejor rendimiento
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    // Reducido de 15 a 8 partículas
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Three.js setup para el modelo 3D
let scene, camera, renderer, notebook, controls;

function init3D() {
    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    
    // Renderer setup optimizado
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: false, // Desactivar antialiasing para mejor rendimiento
        alpha: true,
        powerPreference: "high-performance" // Optimización para rendimiento
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = false; // Desactivar sombras para mejor rendimiento
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Cargar modelo optimizado
    loadSTLModel();
    
    // Iluminación simplificada
    setupLightingOptimized();
    setupControlsOptimized();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Función optimizada para cargar múltiples archivos STL
function loadSTLModel() {
    const loader = new THREE.STLLoader();
    const notebookGroup = new THREE.Group();
    let loadedParts = 0;
    const totalParts = 2;
    
    // Cargar libreta principal
    loader.load(
        '3D/notepad-libreta.STL',
        function (geometry) {
            // Material simplificado para mejor rendimiento
            const libretaMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff
            });
            
            // Centrar y escalar
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const center = box.getCenter(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z);
            
            const libretaMesh = new THREE.Mesh(geometry, libretaMaterial);
            notebookGroup.add(libretaMesh);
            
            loadedParts++;
            if (loadedParts === totalParts) {
                finalizeModelOptimized(notebookGroup);
            }
            
            console.log('Libreta cargada exitosamente');
        },
        function (progress) {
            console.log('Progreso libreta: ', Math.round(progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
            console.error('Error al cargar libreta:', error);
            createProceduralNotebook();
        }
    );
    
    // Cargar resorte
    loader.load(
        '3D/notepad-resorte.STL',
        function (geometry) {
            // Material para el resorte
            const resorteMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x444444
            });
            
            // Centrar geometry
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const center = box.getCenter(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z);
            
            const resorteMesh = new THREE.Mesh(geometry, resorteMaterial);
            
            // CORREGIR POSICIÓN DEL RESORTE - moverlo al borde izquierdo
            const libretaBox = notebookGroup.children[0] ? 
                new THREE.Box3().setFromObject(notebookGroup.children[0]) : 
                new THREE.Box3();
            
            // Posicionar resorte en el borde izquierdo de la libreta
            resorteMesh.position.x = libretaBox.min.x - 0.2; // Ajustar según sea necesario
            resorteMesh.position.y = 0;
            resorteMesh.position.z = 0;
            
            notebookGroup.add(resorteMesh);
            
            loadedParts++;
            if (loadedParts === totalParts) {
                finalizeModelOptimized(notebookGroup);
            }
            
            console.log('Resorte cargado y posicionado');
        },
        function (progress) {
            console.log('Progreso resorte: ', Math.round(progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
            console.error('Error al cargar resorte:', error);
            loadedParts++;
            if (loadedParts >= totalParts) {
                finalizeModelOptimized(notebookGroup);
            }
        }
    );
}

// Función optimizada para finalizar el modelo
function finalizeModelOptimized(group) {
    // Calcular bounding box del grupo completo
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Centrar el grupo completo
    group.position.sub(center);
    
    // Escalar apropiadamente
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 4;
    const scale = targetSize / maxDimension;
    group.scale.set(scale, scale, scale);
    
    // Posicionar y rotar para mejor vista
    group.position.set(0, 0, 0);
    group.rotation.x = -Math.PI / 12; // Rotación más sutil
    group.rotation.y = Math.PI / 8;   // Rotación más sutil
    
    notebook = group;
    scene.add(notebook);
    
    console.log('Modelo completo optimizado - Dimensiones:', size);
}

// Función alternativa: crear modelo procedural (como respaldo)
function createProceduralNotebook() {
    const notebookGroup = new THREE.Group();
    
    // Main notebook body
    const bodyGeometry = new THREE.BoxGeometry(3, 0.3, 4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    notebookGroup.add(body);
    
    // Spiral binding
    const spiralGeometry = new THREE.TorusGeometry(0.05, 0.02, 8, 100);
    const spiralMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    for (let i = 0; i < 20; i++) {
        const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
        spiral.position.set(-1.3, 0.16, -1.8 + (i * 0.2));
        spiral.rotation.x = Math.PI / 2;
        spiral.castShadow = true;
        notebookGroup.add(spiral);
    }
    
    // Logo/Text area (simplified)
    const logoGeometry = new THREE.PlaneGeometry(1.5, 0.8);
    const logoMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.8
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0.3, 0.16, 0.5);
    logo.rotation.x = -Math.PI / 2;
    notebookGroup.add(logo);
    
    // Add corner triangular fold
    const foldGeometry = new THREE.ConeGeometry(0.3, 0.1, 3);
    const foldMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const fold = new THREE.Mesh(foldGeometry, foldMaterial);
    fold.position.set(1.3, 0.2, -1.8);
    fold.rotation.y = Math.PI / 4;
    fold.castShadow = true;
    notebookGroup.add(fold);
    
    notebook = notebookGroup;
    scene.add(notebook);
}

// Iluminación simplificada para mejor rendimiento
function setupLightingOptimized() {
    // Solo luz ambiental y una direccional (sin sombras)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
}

// Controles optimizados con mejor responsividad
function setupControlsOptimized() {
    const canvas = document.getElementById('three-canvas');
    let mouseX = 0, mouseY = 0;
    let isMouseDown = false;
    
    // Variables globales para rotación más fluida
    window.targetRotationX = 0;
    window.targetRotationY = 0;
    window.currentRotationX = 0;
    window.currentRotationY = 0;
    window.isInteracting = false;
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        window.isInteracting = true;
        canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mouseup', (e) => {
        isMouseDown = false;
        window.isInteracting = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mouseleave', (e) => {
        isMouseDown = false;
        window.isInteracting = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            const deltaX = (e.clientX - rect.left) / rect.width - 0.5;
            const deltaY = (e.clientY - rect.top) / rect.height - 0.5;
            
            window.targetRotationY += deltaX * 0.02; // Movimiento más fluido
            window.targetRotationX += deltaY * 0.01;
            
            // Limitar rotación vertical
            window.targetRotationX = Math.max(-0.5, Math.min(0.5, window.targetRotationX));
        }
    });
    
    // Touch events optimizados
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.isInteracting = true;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        window.isInteracting = false;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const deltaX = (touch.clientX - rect.left) / rect.width - 0.5;
            const deltaY = (touch.clientY - rect.top) / rect.height - 0.5;
            
            window.targetRotationY += deltaX * 0.02;
            window.targetRotationX += deltaY * 0.01;
            window.targetRotationX = Math.max(-0.5, Math.min(0.5, window.targetRotationX));
        }
    });
    
    // Zoom optimizado
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(4, Math.min(12, camera.position.z));
    });
    
    // Establecer cursor inicial
    canvas.style.cursor = 'grab';
}

// Animation loop optimizado
function animate() {
    requestAnimationFrame(animate);
    
    if (notebook) {
        // Interpolación más suave y rápida
        const lerpFactor = 0.12; // Aumentado para mayor responsividad
        
        window.currentRotationX += (window.targetRotationX - window.currentRotationX) * lerpFactor;
        window.currentRotationY += (window.targetRotationY - window.currentRotationY) * lerpFactor;
        
        notebook.rotation.x = window.currentRotationX;
        notebook.rotation.y = window.currentRotationY;
        
        // Auto-rotación más lenta cuando no hay interacción
        if (!window.isInteracting) {
            window.targetRotationY += 0.003; // Reducido para suavidad
        }
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const newWidth = container.offsetWidth;
    const newHeight = container.offsetHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    init3D();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});