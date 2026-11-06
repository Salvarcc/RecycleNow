document.addEventListener('DOMContentLoaded', () => {
  iniciarBuscadorYChips();
  iniciarFiltroCategorias();
  iniciarChecklistPreparacion();
  iniciarFiltrosYVistasPuntos();
  iniciarFavoritosYRecordatorio();
  iniciarPanelReciclador();
});

function iniciarBuscadorYChips() {
  const formBusqueda = document.getElementById('form-busqueda');
  const inputBusqueda = document.getElementById('input-busqueda');
  const chipsRapidos = document.querySelectorAll('.chip-busqueda');
  const tarjetasResiduo = document.querySelectorAll('.tarjeta-residuo');
  const avisoSinCoincidencias = document.getElementById('sin-coincidencias');

  if (!formBusqueda || !inputBusqueda) return;

  function filtrarPorTermino(termino) {
    const query = termino.toLowerCase().trim();
    let coincidencias = 0;

    tarjetasResiduo.forEach(tarjeta => {
      const nombre = (tarjeta.getAttribute('data-nombre') || tarjeta.textContent).toLowerCase();

      if (query === '' || nombre.includes(query)) {
        tarjeta.classList.remove('oculto');
        coincidencias++;
      } else {
        tarjeta.classList.add('oculto');
      }
    });

    if (coincidencias === 0 && query !== '') {
      if (avisoSinCoincidencias) avisoSinCoincidencias.classList.remove('oculto');
    } else {
      if (avisoSinCoincidencias) avisoSinCoincidencias.classList.add('oculto');
    }
  }

  formBusqueda.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrarPorTermino(inputBusqueda.value);
  });

  inputBusqueda.addEventListener('input', () => {
    filtrarPorTermino(inputBusqueda.value);
  });

  chipsRapidos.forEach(chip => {
    chip.addEventListener('click', () => {
      const termino = chip.getAttribute('data-termino') || chip.textContent.trim();
      inputBusqueda.value = termino;
      filtrarPorTermino(termino);
    });
  });
}

function iniciarFiltroCategorias() {
  const botonesCategoria = document.querySelectorAll('.btn-categoria');
  const tarjetasResiduo = document.querySelectorAll('.tarjeta-residuo');
  const inputBusqueda = document.getElementById('input-busqueda');
  const avisoSinCoincidencias = document.getElementById('sin-coincidencias');

  if (botonesCategoria.length === 0) return;

  botonesCategoria.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesCategoria.forEach(btn => btn.classList.remove('activo'));
      boton.classList.add('activo');

      const categoriaSeleccionada = boton.getAttribute('data-categoria');

      if (inputBusqueda) inputBusqueda.value = '';
      if (avisoSinCoincidencias) avisoSinCoincidencias.classList.add('oculto');

      let visibles = 0;
      tarjetasResiduo.forEach(tarjeta => {
        const categoriaTarjeta = tarjeta.getAttribute('data-categoria');

        if (categoriaSeleccionada === 'todos' || categoriaTarjeta === categoriaSeleccionada) {
          tarjeta.classList.remove('oculto');
          visibles++;
        } else {
          tarjeta.classList.add('oculto');
        }
      });

      if (avisoSinCoincidencias) {
        if (visibles === 0) {
          avisoSinCoincidencias.classList.remove('oculto');
        } else {
          avisoSinCoincidencias.classList.add('oculto');
        }
      }
    });
  });
}

function iniciarChecklistPreparacion() {
  const checkboxes = document.querySelectorAll('.check-paso');
  const barraProgresoFill = document.getElementById('progreso-relleno');
  const textoPorcentaje = document.getElementById('progreso-porcentaje');
  const mensajeProgreso = document.getElementById('progreso-mensaje');
  const btnBuscarAcopio = document.getElementById('btn-buscar-acopio');

  if (checkboxes.length === 0 || !barraProgresoFill || !textoPorcentaje || !btnBuscarAcopio) return;

  function actualizarDisponibilidad() {
    let completados = 0;

    checkboxes.forEach((cb, index) => {
      const itemPaso = cb.closest('.paso-item') || cb.parentElement;

      if (index === 0) {
        cb.disabled = false;
      } else {
        const pasoAnteriorMarcado = checkboxes[index - 1].checked;
        cb.disabled = !pasoAnteriorMarcado;
        if (!pasoAnteriorMarcado) {
          cb.checked = false;
        }
      }

      if (itemPaso) {
        if (cb.disabled) {
          itemPaso.classList.add('paso-bloqueado');
          itemPaso.classList.remove('paso-habilitado');
        } else {
          itemPaso.classList.remove('paso-bloqueado');
          itemPaso.classList.add('paso-habilitado');
        }
      }

      if (cb.checked) {
        completados++;
        if (itemPaso) itemPaso.classList.add('paso-completado');
      } else {
        if (itemPaso) itemPaso.classList.remove('paso-completado');
      }
    });

    const total = checkboxes.length;
    const porcentaje = Math.round((completados / total) * 100);

    barraProgresoFill.style.width = `${porcentaje}%`;
    textoPorcentaje.textContent = `${porcentaje}%`;

    if (porcentaje === 100) {
      btnBuscarAcopio.disabled = false;
      btnBuscarAcopio.classList.add('btn-habilitado');
      if (mensajeProgreso) {
        mensajeProgreso.textContent = '¡Excelente! Los 4 pasos están completos en orden. Tu botella está lista.';
        mensajeProgreso.className = 'mensaje-progreso exito';
      }
    } else {
      btnBuscarAcopio.disabled = true;
      btnBuscarAcopio.classList.remove('btn-habilitado');
      if (mensajeProgreso) {
        mensajeProgreso.textContent = `Debes completar los pasos en orden. Paso actual habilitado: ${completados + 1} de ${total}.`;
        mensajeProgreso.className = 'mensaje-progreso pendiente';
      }
    }
  }

  checkboxes.forEach((cb, index) => {
    cb.addEventListener('change', () => {
      if (!cb.checked) {
        for (let i = index + 1; i < checkboxes.length; i++) {
          checkboxes[i].checked = false;
        }
      }
      actualizarDisponibilidad();
    });
  });

  actualizarDisponibilidad();

  btnBuscarAcopio.addEventListener('click', (e) => {
    e.preventDefault();
    const seccionPuntos = document.getElementById('seccion-puntos-acopio');
    if (seccionPuntos) {
      seccionPuntos.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'index.html#seccion-puntos-acopio';
    }
  });
}

function iniciarFiltrosYVistasPuntos() {
  const btnVistaLista = document.getElementById('btn-vista-lista');
  const btnVistaMapa = document.getElementById('btn-vista-mapa');
  const contenedorLista = document.getElementById('vista-lista');
  const contenedorMapa = document.getElementById('vista-mapa');
  const filtroAbierto = document.getElementById('filtro-abierto');
  const filtroDistancia = document.getElementById('filtro-distancia');
  const puntosAcopio = document.querySelectorAll('.item-punto');
  const avisoSinPuntos = document.getElementById('sin-puntos-aviso');

  if (!btnVistaLista || !btnVistaMapa || !contenedorLista || !contenedorMapa) return;

  btnVistaLista.addEventListener('click', () => {
    btnVistaLista.classList.add('activo');
    btnVistaMapa.classList.remove('activo');
    contenedorLista.classList.remove('oculto');
    contenedorMapa.classList.add('oculto');
  });

  btnVistaMapa.addEventListener('click', () => {
    btnVistaMapa.classList.add('activo');
    btnVistaLista.classList.remove('activo');
    contenedorMapa.classList.remove('oculto');
    contenedorLista.classList.add('oculto');
  });

  function aplicarFiltrosPuntos() {
    const soloAbiertos = filtroAbierto ? filtroAbierto.checked : false;
    const distanciaMax = filtroDistancia && filtroDistancia.value !== 'todas'
      ? parseFloat(filtroDistancia.value)
      : Infinity;

    let visibles = 0;

    puntosAcopio.forEach(punto => {
      const estaAbierto = punto.getAttribute('data-abierto') === 'true';
      const distancia = parseFloat(punto.getAttribute('data-distancia') || '0');

      const cumpleAbierto = !soloAbiertos || estaAbierto;
      const cumpleDistancia = distancia <= distanciaMax;

      if (cumpleAbierto && cumpleDistancia) {
        punto.classList.remove('oculto');
        visibles++;
      } else {
        punto.classList.add('oculto');
      }
    });

    if (avisoSinPuntos) {
      if (visibles === 0) {
        avisoSinPuntos.classList.remove('oculto');
      } else {
        avisoSinPuntos.classList.add('oculto');
      }
    }
  }

  if (filtroAbierto) filtroAbierto.addEventListener('change', aplicarFiltrosPuntos);
  if (filtroDistancia) filtroDistancia.addEventListener('change', aplicarFiltrosPuntos);
}

function iniciarFavoritosYRecordatorio() {
  const botonesFavorito = document.querySelectorAll('.btn-favorito');
  const modalRecordatorio = document.getElementById('modal-recordatorio');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const formRecordatorio = document.getElementById('form-recordatorio');
  const inputFecha = document.getElementById('recordatorio-fecha');
  const inputHora = document.getElementById('recordatorio-hora');
  const spanNombrePunto = document.getElementById('modal-nombre-punto');
  const errorRecordatorio = document.getElementById('error-recordatorio');
  const feedbackGlobal = document.getElementById('feedback-recordatorio-global');
  const botonesAbrirModal = document.querySelectorAll('.btn-configurar-recordatorio');

  const CLAVE_FAVORITOS = 'recyclenow_puntos_favoritos';

  function obtenerFavoritos() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];
    } catch {
      return [];
    }
  }

  function guardarFavoritos(favoritos) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  }

  function actualizarEstadoVisualBoton(btn, esFavorito) {
    if (esFavorito) {
      btn.classList.add('guardado');
      btn.innerHTML = '★ Guardado como favorito';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('guardado');
      btn.innerHTML = '☆ Guardar favorito';
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  const favoritosGuardados = obtenerFavoritos();
  botonesFavorito.forEach(btn => {
    const id = btn.getAttribute('data-punto-id');
    if (favoritosGuardados.includes(id)) {
      actualizarEstadoVisualBoton(btn, true);
    }

    btn.addEventListener('click', () => {
      let actuales = obtenerFavoritos();
      const yaGuardado = actuales.includes(id);

      if (yaGuardado) {
        actuales = actuales.filter(item => item !== id);
        actualizarEstadoVisualBoton(btn, false);
      } else {
        actuales.push(id);
        actualizarEstadoVisualBoton(btn, true);
      }
      guardarFavoritos(actuales);
    });
  });

  if (botonesAbrirModal.length > 0 && modalRecordatorio) {
    botonesAbrirModal.forEach(btn => {
      btn.addEventListener('click', () => {
        const nombre = btn.getAttribute('data-nombre-punto') || 'Punto de acopio';
        if (spanNombrePunto) spanNombrePunto.textContent = nombre;
        if (errorRecordatorio) errorRecordatorio.classList.add('oculto');
        modalRecordatorio.classList.remove('oculto');
      });
    });

    function cerrarModal() {
      modalRecordatorio.classList.add('oculto');
      if (formRecordatorio) formRecordatorio.reset();
      if (errorRecordatorio) errorRecordatorio.classList.add('oculto');
    }

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);

    modalRecordatorio.addEventListener('click', (e) => {
      if (e.target === modalRecordatorio) cerrarModal();
    });

    if (formRecordatorio) {
      formRecordatorio.addEventListener('submit', (e) => {
        e.preventDefault();
        const fecha = inputFecha ? inputFecha.value.trim() : '';
        const hora = inputHora ? inputHora.value.trim() : '';

        if (!fecha || !hora) {
          if (errorRecordatorio) {
            errorRecordatorio.textContent = 'Por favor selecciona tanto la fecha como la hora de tu entrega.';
            errorRecordatorio.classList.remove('oculto');
          }
          return;
        }

        cerrarModal();

        if (feedbackGlobal) {
          feedbackGlobal.textContent = 'Entrega programada con éxito';
          feedbackGlobal.classList.remove('oculto');
          feedbackGlobal.classList.add('alerta-activa');

          setTimeout(() => {
            feedbackGlobal.classList.remove('alerta-activa');
            feedbackGlobal.classList.add('oculto');
          }, 4000);
        }
      });
    }
  }
}

function iniciarPanelReciclador() {
  const formAdmin = document.getElementById('form-admin-reciclador');
  const chipsMateriales = document.querySelectorAll('.chip-material-admin');
  const selectDias = document.getElementById('admin-dias');
  const inputApertura = document.getElementById('admin-hora-apertura');
  const inputCierre = document.getElementById('admin-hora-cierre');
  const vistaHorario = document.getElementById('vista-horario-actual');
  const badgeEstado = document.getElementById('badge-estado-publicacion');
  const errorMateriales = document.getElementById('error-materiales-admin');
  const contenedorChips = document.getElementById('contenedor-chips-admin');
  const alertaConfirmacion = document.getElementById('alerta-publicacion-admin');

  if (!formAdmin) return;

  chipsMateriales.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      chip.classList.toggle('seleccionado');

      if (contenedorChips) contenedorChips.classList.remove('campo-error');
      if (errorMateriales) errorMateriales.classList.add('oculto');
    });
  });

  function formatearHora(hora24) {
    if (!hora24) return '';
    const [h, m] = hora24.split(':');
    const horasNum = parseInt(h, 10);
    const periodo = horasNum >= 12 ? 'pm' : 'am';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${m} ${periodo}`;
  }

  function actualizarVistaHorario() {
    if (!vistaHorario) return;
    const dias = selectDias ? selectDias.value : 'Lunes a Sábado';
    const apertura = inputApertura && inputApertura.value ? formatearHora(inputApertura.value) : '8:00 am';
    const cierre = inputCierre && inputCierre.value ? formatearHora(inputCierre.value) : '4:00 pm';
    vistaHorario.textContent = `${dias}: ${apertura} - ${cierre}`;
  }

  if (selectDias) selectDias.addEventListener('change', actualizarVistaHorario);
  if (inputApertura) inputApertura.addEventListener('change', actualizarVistaHorario);
  if (inputCierre) inputCierre.addEventListener('change', actualizarVistaHorario);

  formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();

    const seleccionados = document.querySelectorAll('.chip-material-admin.seleccionado');

    if (seleccionados.length === 0) {
      if (contenedorChips) contenedorChips.classList.add('campo-error');
      if (errorMateriales) {
        errorMateriales.textContent = 'Error: Debes seleccionar al menos una categoría de material antes de publicar.';
        errorMateriales.classList.remove('oculto');
      }
      return;
    }

    if (contenedorChips) contenedorChips.classList.remove('campo-error');
    if (errorMateriales) errorMateriales.classList.add('oculto');

    if (badgeEstado) {
      badgeEstado.textContent = 'Criterios publicados y visibles';
      badgeEstado.className = 'badge-estado estado-publicado';
    }

    if (alertaConfirmacion) {
      alertaConfirmacion.textContent = 'Criterios y horarios publicados exitosamente.';
      alertaConfirmacion.classList.remove('oculto');
      alertaConfirmacion.classList.add('alerta-activa');

      setTimeout(() => {
        alertaConfirmacion.classList.remove('alerta-activa');
        alertaConfirmacion.classList.add('oculto');
      }, 3500);
    }
  });
}
