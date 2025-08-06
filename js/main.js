// Initialize AOS with mobile-friendly settings
AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    disable: window.innerWidth < 768 ? 'mobile' : false
});

// Create fewer particles for better performance
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = window.innerWidth < 768 ? 5 : 8; // Fewer particles on mobile
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Three.js setup for 3D model with mobile optimizations
let scene, camera, renderer, notebook, controls;
let isMobile = window.innerWidth <= 768;

function init3D() {
    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('canvas-container');
    
    if (!container || !canvas) {
        console.error('Canvas container not found');
        return;
    }
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera setup with mobile-friendly FOV
    const fov = isMobile ? 60 : 75;
    camera = new THREE.PerspectiveCamera(fov, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 10 : 8);
    
    // Renderer setup optimized for mobile
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: !isMobile, // Disable antialiasing on mobile for performance
        alpha: true,
        powerPreference: isMobile ? "low-power" : "high-performance"
    });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = false; // Shadows disabled for performance
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Load model
    loadSTLModel();
    
    // Setup lighting and controls
    setupLightingOptimized();
    setupControlsOptimized();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Optimized function to load multiple STL files
function loadSTLModel() {
    const loader = new THREE.STLLoader();
    const notebookGroup = new THREE.Group();
    let loadedParts = 0;
    const totalParts = 2;
    
    // Load main notebook
    loader.load(
        '3D/notepad-libreta.STL',
        function (geometry) {
            const libretaMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff
            });
            
            // Center and scale
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
            
            console.log('Notebook loaded successfully');
        },
        function (progress) {
            if (progress.total > 0) {
                console.log('Notebook progress: ', Math.round(progress.loaded / progress.total * 100) + '%');
            }
        },
        function (error) {
            console.error('Error loading notebook:', error);
            createProceduralNotebook();
        }
    );
    
    // Load spiral
    loader.load(
        '3D/notepad-resorte.STL',
        function (geometry) {
            const resorteMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x444444
            });
            
            // Center geometry
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const center = box.getCenter(new THREE.Vector3());
            geometry.translate(-center.x, -center.y, -center.z);
            
            const resorteMesh = new THREE.Mesh(geometry, resorteMaterial);
            
            // Position spiral on the left edge of the notebook
            const libretaBox = notebookGroup.children[0] ? 
                new THREE.Box3().setFromObject(notebookGroup.children[0]) : 
                new THREE.Box3();
            
            resorteMesh.position.x = libretaBox.min.x - 0.2;
            resorteMesh.position.y = 0;
            resorteMesh.position.z = 0;
            
            notebookGroup.add(resorteMesh);
            
            loadedParts++;
            if (loadedParts === totalParts) {
                finalizeModelOptimized(notebookGroup);
            }
            
            console.log('Spring loaded and positioned');
        },
        function (progress) {
            if (progress.total > 0) {
                console.log('Spring progress: ', Math.round(progress.loaded / progress.total * 100) + '%');
            }
        },
        function (error) {
            console.error('Error loading spring:', error);
            loadedParts++;
            if (loadedParts >= totalParts) {
                finalizeModelOptimized(notebookGroup);
            }
        }
    );
}

// Optimized function to finalize the model
function finalizeModelOptimized(group) {
    // Calculate complete group bounding box
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Center the complete group
    group.position.sub(center);
    
    // Scale appropriately for mobile
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = isMobile ? 3.5 : 4;
    const scale = targetSize / maxDimension;
    group.scale.set(scale, scale, scale);
    
    // Position and rotate for better view
    group.position.set(0, 0, 0);
    group.rotation.x = -Math.PI / 12;
    group.rotation.y = Math.PI / 8;
    
    notebook = group;
    scene.add(notebook);
    
    console.log('Optimized complete model - Dimensions:', size);
}

// Fallback: create procedural notebook
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
    notebookGroup.add(body);
    
    // Spiral binding
    const spiralGeometry = new THREE.TorusGeometry(0.05, 0.02, 8, 50); // Reduced segments for performance
    const spiralMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    for (let i = 0; i < 15; i++) { // Reduced spirals for performance
        const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
        spiral.position.set(-1.3, 0.16, -1.5 + (i * 0.2));
        spiral.rotation.x = Math.PI / 2;
        notebookGroup.add(spiral);
    }
    
    // Logo/Text area (simplified)
    const logoGeometry = new THREE.PlaneGeometry(1.5, 0.8);
    const logoMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4a6fa5, // Updated to match color scheme
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
    notebookGroup.add(fold);
    
    notebook = notebookGroup;
    scene.add(notebook);
}

// Simplified lighting for better performance
function setupLightingOptimized() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Additional soft light from the side
    const sideLight = new THREE.DirectionalLight(0x4a6fa5, 0.3);
    sideLight.position.set(-3, 2, 3);
    scene.add(sideLight);
}

// Optimized controls with better mobile support
function setupControlsOptimized() {
    const canvas = document.getElementById('three-canvas');
    let isInteracting = false;
    let previousTouch = null;
    
    // Global rotation variables
    window.targetRotationX = 0;
    window.targetRotationY = 0;
    window.currentRotationX = 0;
    window.currentRotationY = 0;
    window.isInteracting = false;
    
    // Mouse events for desktop
    canvas.addEventListener('mousedown', (e) => {
        isInteracting = true;
        window.isInteracting = true;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    canvas.addEventListener('mouseup', (e) => {
        isInteracting = false;
        window.isInteracting = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mouseleave', (e) => {
        isInteracting = false;
        window.isInteracting = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isInteracting) {
            const rect = canvas.getBoundingClientRect();
            const deltaX = (e.clientX - rect.left) / rect.width - 0.5;
            const deltaY = (e.clientY - rect.top) / rect.height - 0.5;
            
            window.targetRotationY += deltaX * 0.02;
            window.targetRotationX += deltaY * 0.01;
            
            // Limit vertical rotation
            window.targetRotationX = Math.max(-0.5, Math.min(0.5, window.targetRotationX));
        }
    });
    
    // Enhanced touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.isInteracting = true;
        isInteracting = true;
        
        if (e.touches.length === 1) {
            previousTouch = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        window.isInteracting = false;
        isInteracting = false;
        previousTouch = null;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && previousTouch) {
            const touch = e.touches[0];
            const deltaX = (touch.clientX - previousTouch.x) * 0.01;
            const deltaY = (touch.clientY - previousTouch.y) * 0.005;
            
            window.targetRotationY += deltaX;
            window.targetRotationX += deltaY;
            window.targetRotationX = Math.max(-0.5, Math.min(0.5, window.targetRotationX));
            
            previousTouch = {
                x: touch.clientX,
                y: touch.clientY
            };
        }
    }, { passive: false });
    
    // Pinch to zoom for mobile
    let initialPinchDistance = 0;
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const scaleFactor = distance / initialPinchDistance;
            const zoomDelta = (1 - scaleFactor) * 2;
            
            camera.position.z += zoomDelta;
            camera.position.z = Math.max(4, Math.min(12, camera.position.z));
            
            initialPinchDistance = distance;
        }
    }, { passive: false });
    
    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = isMobile ? 0.02 : 0.01;
        camera.position.z += e.deltaY * zoomSpeed;
        camera.position.z = Math.max(4, Math.min(12, camera.position.z));
    }, { passive: false });
    
    // Set initial cursor
    canvas.style.cursor = 'grab';
}

// Optimized animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (notebook) {
        // Smooth interpolation
        const lerpFactor = isMobile ? 0.08 : 0.12; // Slower on mobile to save battery
        
        window.currentRotationX += (window.targetRotationX - window.currentRotationX) * lerpFactor;
        window.currentRotationY += (window.targetRotationY - window.currentRotationY) * lerpFactor;
        
        notebook.rotation.x = window.currentRotationX;
        notebook.rotation.y = window.currentRotationY;
        
        // Slower auto-rotation when not interacting
        if (!window.isInteracting) {
            window.targetRotationY += isMobile ? 0.002 : 0.003;
        }
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    const newWidth = container.offsetWidth;
    const newHeight = container.offsetHeight;
    
    // Update mobile detection
    isMobile = window.innerWidth <= 768;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Small delay to ensure canvas is properly sized
    setTimeout(() => {
        init3D();
    }, 100);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Handle tab switching and resize 3D canvas accordingly
document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (e) {
        if (e.target.id === 'model3d-tab') {
            // Small delay to ensure tab content is visible
            setTimeout(() => {
                onWindowResize();
            }, 100);
        }
    });
});

// Optimize performance on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    // Reduce particle count and animation frequency on low-end devices
    document.addEventListener('DOMContentLoaded', function() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 3) particle.remove(); // Keep only 4 particles
        });
    });
}