// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('¡La página ha cargado completamente! 🎉');

    const libretaInteractiva = document.getElementById('libreta-interactiva');

    if (libretaInteractiva) {
        // Ejemplo simple de interactividad: cambiar la imagen al hacer clic
        let isFront = true;
        libretaInteractiva.addEventListener('click', function() {
            if (isFront) {
                // Asume que tienes una imagen 'libreta-demo-back.png'
                libretaInteractiva.src = 'images/libreta-demo-back.png';
                libretaInteractiva.alt = 'Libreta (vista trasera)';
            } else {
                libretaInteractiva.src = 'images/libreta-demo.png';
                libretaInteractiva.alt = 'Libreta de ejemplo';
            }
            isFront = !isFront;
            console.log('Libreta clicada. Vista actual:', isFront ? 'frontal' : 'trasera');
        });

        // Ejemplo más avanzado: girar con CSS 3D al arrastrar (requiere más imágenes o una librería 3D)
        // Para un efecto de giro 3D más complejo, podrías considerar:
        // 1. Una secuencia de 10-20 imágenes de la libreta girando (libreta-spin-01.png, libreta-spin-02.png, etc.)
        // 2. Usar JavaScript para cambiar la src de la imagen según el movimiento del ratón/arrastre.
        // Esto sería un poco más complejo que este ejemplo básico.

        // Por ahora, el efecto de hover en CSS ya da un toque.

        // Puedes añadir más funciones interactivas aquí.
    }
});

// Puedes añadir otras funciones JavaScript aquí, por ejemplo, para un carrusel manual,
// validación de formulario, etc.