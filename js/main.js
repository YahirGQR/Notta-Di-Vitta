document.addEventListener('DOMContentLoaded', function() {
    // Crear la escena 3D, cámara y renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    const container = document.getElementById('libreta-3d');
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Añadir una luz
    const light = new THREE.AmbientLight(0x404040); // Luz suave
    scene.add(light);

    // Crear un loader para cargar el archivo STL
    const loader = new THREE.STLLoader();
    loader.load('http://localhost:3000/3D/Notepad%20web%20-%20NOTEPAD%20BIEN-1.STL', function (geometry) {
        const material = new THREE.MeshStandardMaterial({ color: 0x007bff });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        mesh.rotation.x = -Math.PI / 2; // Ajustar orientación si es necesario
        mesh.position.set(0, 0, 0);
    });


    // Posicionar la cámara
    camera.position.z = 5;

    // Crear el control de la cámara
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Función de animación
    function animate() {
        requestAnimationFrame(animate);

        // Gira el modelo 3D de manera automática
        scene.children[1].rotation.x += 0.01;
        scene.children[1].rotation.y += 0.01;

        controls.update(); // Actualizar el control de la cámara
        renderer.render(scene, camera);
    }

    // Iniciar la animación
    animate();
});
