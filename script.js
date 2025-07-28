document.addEventListener('DOMContentLoaded', () => {
    const ramos = document.querySelectorAll('.ramo');
    const alerta = document.getElementById('alerta-requisitos');
    const cerrarAlerta = document.querySelector('.cerrar-alerta');
    const listaRequisitos = document.getElementById('lista-requisitos');
    const claveStorage = 'ramosAprobadosIngComercial';
    
    let ramosAprobados = new Set();

    // Función para capitalizar texto (ej: "hola-mundo" -> "Hola Mundo")
    const capitalizar = (str) => {
        return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // 1. Cargar el estado desde localStorage
    const cargarEstado = () => {
        const guardados = JSON.parse(localStorage.getItem(claveStorage));
        if (guardados) {
            ramosAprobados = new Set(guardados);
            ramosAprobados.forEach(id => {
                const ramo = document.querySelector(`.ramo[data-id='${id}']`);
                if (ramo) {
                    ramo.classList.add('aprobado');
                }
            });
        }
    };

    // 2. Guardar el estado en localStorage
    const guardarEstado = () => {
        localStorage.setItem(claveStorage, JSON.stringify(Array.from(ramosAprobados)));
    };

    // 3. Actualizar el estado visual de todos los ramos (bloqueado/disponible)
    const actualizarEstadoVisual = () => {
        ramos.forEach(ramo => {
            if (ramo.classList.contains('aprobado')) return;

            const requisitos = (ramo.dataset.requisitos || '').split(',').filter(Boolean);
            if (requisitos.length === 0) {
                ramo.classList.remove('bloqueado');
                return;
            }

            const todosRequisitosCumplidos = requisitos.every(reqId => ramosAprobados.has(reqId));
            
            if (todosRequisitosCumplidos) {
                ramo.classList.remove('bloqueado');
            } else {
                ramo.classList.add('bloqueado');
            }
        });
    };

    // 4. Mostrar alerta de requisitos faltantes
    const mostrarAlerta = (requisitosFaltantes) => {
        listaRequisitos.innerHTML = '';
        requisitosFaltantes.forEach(reqId => {
            const li = document.createElement('li');
            li.textContent = capitalizar(reqId);
            listaRequisitos.appendChild(li);
        });
        alerta.classList.remove('oculto');
    };

    // 5. Manejar el clic en un ramo
    const manejarClickRamo = (e) => {
        const ramo = e.target;
        const id = ramo.dataset.id;
        
        // Si ya está aprobado, permite des-aprobarlo
        if (ramo.classList.contains('aprobado')) {
            ramo.classList.remove('aprobado');
            ramosAprobados.delete(id);
        } else {
            // Verificar requisitos para aprobar
            const requisitos = (ramo.dataset.requisitos || '').split(',').filter(Boolean);
            const requisitosFaltantes = requisitos.filter(reqId => !ramosAprobados.has(reqId));

            if (requisitosFaltantes.length > 0) {
                mostrarAlerta(requisitosFaltantes);
                return; // Detiene la ejecución si faltan requisitos
            }

            ramo.classList.add('aprobado');
            ramosAprobados.add(id);
        }
        
        // Actualizar todo después de un cambio
        guardarEstado();
        actualizarEstadoVisual();
    };

    // --- INICIALIZACIÓN ---

    // Añadir listeners a todos los ramos
    ramos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickRamo);
    });

    // Listener para cerrar la alerta
    cerrarAlerta.addEventListener('click', () => {
        alerta.classList.add('oculto');
    });
    
    alerta.addEventListener('click', (e) => {
        if (e.target === alerta) {
            alerta.classList.add('oculto');
        }
    });

    // Cargar y establecer el estado inicial
    cargarEstado();
    actualizarEstadoVisual();
});
