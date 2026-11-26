document.addEventListener('DOMContentLoaded', () => {
  iniciarMenuMovil();
  iniciarVozHero();
  iniciarBuscadorYChips();
  iniciarIdentificadorFoto();
  iniciarFiltroCategorias();
  iniciarChecklistPreparacion();
  iniciarFiltrosYVistasPuntos();
  iniciarRecomendacionPersonalizada();
  iniciarFavoritosYRecordatorio();
  iniciarPanelReciclador();
  iniciarAsistenteConversacional();
});

const CLAVE_FAVORITOS = 'recyclenow_puntos_favoritos';
const CLAVE_RECORDATORIOS = 'recyclenow_recordatorios';
const CLAVE_CRITERIOS_PUNTOS = 'recyclenow_puntos_custom';
const CLAVE_INTERES = 'recyclenow_ultimo_interes';

function obtenerJsonStorage(clave, defecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) || defecto;
  } catch {
    return defecto;
  }
}

function guardarJsonStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function iniciarMenuMovil() {
  const btnMenu = document.getElementById('btn-menu-movil');
  const navPrincipal = document.getElementById('nav-principal');

  if (!btnMenu || !navPrincipal) return;

  function cerrarMenu() {
    navPrincipal.classList.remove('abierto');
    btnMenu.setAttribute('aria-expanded', 'false');
  }

  btnMenu.addEventListener('click', () => {
    const abierto = navPrincipal.classList.toggle('abierto');
    btnMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  navPrincipal.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', cerrarMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navPrincipal.classList.contains('abierto')) {
      cerrarMenu();
    }
  });
}

function iniciarReconocimientoVoz(boton, estadoEl, onResultado) {
  if (!boton) return;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  boton.addEventListener('click', () => {
    if (!SpeechRec) {
      if (estadoEl) {
        estadoEl.textContent = 'Tu navegador no soporta búsqueda por voz. Puedes escribir manualmente.';
        estadoEl.classList.remove('oculto');
      }
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'es-PE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    boton.classList.add('escuchando');
    if (estadoEl) {
      estadoEl.textContent = 'Escuchando... di el nombre de un residuo o pregunta.';
      estadoEl.classList.remove('oculto');
    }

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      if (estadoEl) {
        estadoEl.textContent = `Escuchado: "${texto}"`;
        estadoEl.classList.remove('oculto');
      }
      onResultado(texto);
    };

    recognition.onerror = () => {
      if (estadoEl) {
        estadoEl.textContent = 'No pudimos captar audio. Intenta de nuevo o escribe en el campo.';
        estadoEl.classList.remove('oculto');
      }
    };

    recognition.onend = () => {
      boton.classList.remove('escuchando');
    };

    recognition.start();
  });
}

function iniciarVozHero() {
  const btnHeroVoz = document.getElementById('btn-hero-voz');
  const heroInput = document.getElementById('hero-input-busqueda');
  const estadoHero = document.getElementById('hero-estado-voz');

  if (!btnHeroVoz || !heroInput) return;

  iniciarReconocimientoVoz(btnHeroVoz, estadoHero, (texto) => {
    heroInput.value = texto;
    heroInput.focus();
  });
}

function actualizarContadorResiduos(visibles, total) {
  const contador = document.getElementById('contador-resultados');
  if (contador) {
    contador.textContent = `Mostrando ${visibles} de ${total} materiales`;
  }
}

function iniciarBuscadorYChips() {
  const formBusqueda = document.getElementById('form-busqueda');
  const inputBusqueda = document.getElementById('input-busqueda');
  const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
  const btnVoz = document.getElementById('btn-voz-busqueda');
  const estadoVoz = document.getElementById('estado-voz-busqueda');
  const chipsRapidos = document.querySelectorAll('.chip-busqueda');
  const botonesCategoria = document.querySelectorAll('.btn-categoria');
  const tarjetasResiduo = document.querySelectorAll('.tarjeta-residuo');
  const avisoSinCoincidencias = document.getElementById('sin-coincidencias');

  if (!formBusqueda || !inputBusqueda) return;

  function filtrarPorTermino(termino) {
    const query = termino.toLowerCase().trim();
    let coincidencias = 0;

    if (query !== '') {
      localStorage.setItem(CLAVE_INTERES, termino.trim());
    }

    if (btnLimpiar) {
      btnLimpiar.classList.toggle('oculto', query === '');
    }

    if (query !== '' && botonesCategoria.length > 0) {
      botonesCategoria.forEach(btn => {
        btn.classList.toggle('activo', btn.getAttribute('data-categoria') === 'todos');
      });
    }

    tarjetasResiduo.forEach(tarjeta => {
      const nombre = (tarjeta.getAttribute('data-nombre') || tarjeta.textContent).toLowerCase();

      if (query === '' || nombre.includes(query)) {
        tarjeta.classList.remove('oculto');
        coincidencias++;
      } else {
        tarjeta.classList.add('oculto');
      }
    });

    actualizarContadorResiduos(coincidencias, tarjetasResiduo.length);

    if (avisoSinCoincidencias) {
      avisoSinCoincidencias.classList.toggle('oculto', !(coincidencias === 0 && query !== ''));
    }
  }

  formBusqueda.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrarPorTermino(inputBusqueda.value);
  });

  inputBusqueda.addEventListener('input', () => {
    filtrarPorTermino(inputBusqueda.value);
  });

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      inputBusqueda.value = '';
      if (estadoVoz) estadoVoz.classList.add('oculto');
      filtrarPorTermino('');
      inputBusqueda.focus();
    });
  }

  iniciarReconocimientoVoz(btnVoz, estadoVoz, (texto) => {
    inputBusqueda.value = texto;
    filtrarPorTermino(texto);
  });

  chipsRapidos.forEach(chip => {
    chip.addEventListener('click', () => {
      const termino = chip.getAttribute('data-termino') || chip.textContent.trim();
      inputBusqueda.value = termino;
      filtrarPorTermino(termino);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get('q');
  if (queryUrl) {
    inputBusqueda.value = queryUrl;
    filtrarPorTermino(queryUrl);
  }
}

function iniciarIdentificadorFoto() {
  const btnToggle = document.getElementById('btn-toggle-foto');
  const panelFoto = document.getElementById('panel-identificar-foto');
  const inputFoto = document.getElementById('input-foto-residuo');
  const wrapAnalisis = document.getElementById('foto-analisis-wrap');
  const imgPreview = document.getElementById('foto-preview');
  const tituloSug = document.getElementById('foto-sugerencia-titulo');
  const razonSug = document.getElementById('foto-sugerencia-razon');
  const btnConfirmar = document.getElementById('btn-confirmar-foto');
  const btnCorregir = document.getElementById('btn-corregir-foto');

  if (!btnToggle || !panelFoto || !inputFoto) return;

  let categoriaSugerida = 'plasticos';

  btnToggle.addEventListener('click', () => {
    panelFoto.classList.toggle('oculto');
  });

  function inferirCategoriaPorArchivo(nombreArchivo) {
    const n = nombreArchivo.toLowerCase();
    if (n.includes('carton') || n.includes('caja') || n.includes('papel') || n.includes('tetra')) {
      return { cat: 'papel', titulo: 'Tacho Azul · Papel y Cartón (88% confianza)', razon: 'Se detectaron rasgos asociados a envases de cartón o papel. Verifica que esté limpio y seco.' };
    }
    if (n.includes('vidrio') || n.includes('frasco')) {
      return { cat: 'vidrio', titulo: 'Tacho Verde · Vidrio (85% confianza)', razon: 'Posible envase de vidrio. Recuerda retirar tapas metálicas antes de entregar.' };
    }
    if (n.includes('lata') || n.includes('metal') || n.includes('aluminio')) {
      return { cat: 'metales', titulo: 'Tacho Verde · Metales (86% confianza)', razon: 'Posible envase metálico o lata. Enjuaga ligeramente y aplasta para ahorrar espacio.' };
    }
    if (n.includes('aceite') || n.includes('pila') || n.includes('bateria')) {
      return { cat: 'especiales', titulo: 'Tacho Rojo · Residuos especiales (91% confianza)', razon: 'Material que requiere manejo diferenciado. Nunca lo mezcles con la basura común.' };
    }
    return { cat: 'plasticos', titulo: 'Tacho Blanco · Plásticos (84% confianza)', razon: 'Por forma y brillo probable corresponde a envase plástico rígido. Vacíalo y aplástalo antes de entregar.' };
  }

  inputFoto.addEventListener('change', () => {
    const archivo = inputFoto.files && inputFoto.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (imgPreview) imgPreview.src = ev.target.result;
      const res = inferirCategoriaPorArchivo(archivo.name);
      categoriaSugerida = res.cat;
      if (tituloSug) tituloSug.textContent = res.titulo;
      if (razonSug) razonSug.textContent = res.razon;
      if (wrapAnalisis) wrapAnalisis.classList.remove('oculto');
    };
    reader.readAsDataURL(archivo);
  });

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
      const btnCat = document.querySelector(`.btn-categoria[data-categoria="${categoriaSugerida}"]`);
      if (btnCat) btnCat.click();
      panelFoto.classList.add('oculto');
    });
  }

  if (btnCorregir) {
    btnCorregir.addEventListener('click', () => {
      panelFoto.classList.add('oculto');
      const barraCat = document.querySelector('.filtros-categoria');
      if (barraCat) barraCat.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function iniciarFiltroCategorias() {
  const botonesCategoria = document.querySelectorAll('.btn-categoria');
  const tarjetasResiduo = document.querySelectorAll('.tarjeta-residuo');
  const inputBusqueda = document.getElementById('input-busqueda');
  const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
  const avisoSinCoincidencias = document.getElementById('sin-coincidencias');

  if (botonesCategoria.length === 0) return;

  function seleccionarCategoria(boton) {
    botonesCategoria.forEach(btn => btn.classList.remove('activo'));
    boton.classList.add('activo');

    const categoriaSeleccionada = boton.getAttribute('data-categoria');

    if (inputBusqueda) inputBusqueda.value = '';
    if (btnLimpiar) btnLimpiar.classList.add('oculto');
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

    actualizarContadorResiduos(visibles, tarjetasResiduo.length);

    if (avisoSinCoincidencias) {
      avisoSinCoincidencias.classList.toggle('oculto', visibles > 0);
    }
  }

  botonesCategoria.forEach(boton => {
    boton.addEventListener('click', () => seleccionarCategoria(boton));
  });

  const params = new URLSearchParams(window.location.search);
  const catUrl = params.get('cat');
  if (catUrl) {
    const btnMatch = document.querySelector(`.btn-categoria[data-categoria="${catUrl}"]`);
    if (btnMatch) seleccionarCategoria(btnMatch);
  }
}

function iniciarChecklistPreparacion() {
  const checkboxes = document.querySelectorAll('.check-paso');
  const barraProgreso = document.querySelector('.barra-progreso');
  const barraProgresoFill = document.getElementById('progreso-relleno');
  const textoPorcentaje = document.getElementById('progreso-porcentaje');
  const mensajeProgreso = document.getElementById('progreso-mensaje');
  const btnBuscarAcopio = document.getElementById('btn-buscar-acopio');
  const btnManosLibres = document.getElementById('btn-manos-libres');
  const btnLeerPaso = document.getElementById('btn-leer-paso');
  const estadoManosLibres = document.getElementById('estado-manos-libres');

  if (checkboxes.length === 0 || !barraProgresoFill || !textoPorcentaje || !btnBuscarAcopio) return;

  function obtenerIndiceActual() {
    for (let i = 0; i < checkboxes.length; i++) {
      if (!checkboxes[i].checked) return i;
    }
    return checkboxes.length - 1;
  }

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
        itemPaso.classList.toggle('paso-bloqueado', cb.disabled);
        itemPaso.classList.toggle('paso-habilitado', !cb.disabled);
        itemPaso.classList.toggle('paso-completado', cb.checked);
      }

      if (cb.checked) {
        completados++;
      }
    });

    const total = checkboxes.length;
    const porcentaje = Math.round((completados / total) * 100);

    barraProgresoFill.style.width = `${porcentaje}%`;
    if (barraProgreso) barraProgreso.setAttribute('aria-valuenow', String(porcentaje));
    textoPorcentaje.textContent = `${porcentaje}%`;

    if (porcentaje === 100) {
      btnBuscarAcopio.disabled = false;
      btnBuscarAcopio.classList.add('btn-habilitado');
      if (mensajeProgreso) {
        mensajeProgreso.textContent = 'Listo. Completaste los 4 pasos y tu botella está preparada para entregar.';
        mensajeProgreso.className = 'mensaje-progreso exito';
      }
    } else {
      btnBuscarAcopio.disabled = true;
      btnBuscarAcopio.classList.remove('btn-habilitado');
      if (mensajeProgreso) {
        mensajeProgreso.textContent = `Paso actual: marca el paso ${completados + 1} de ${total} para continuar.`;
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

    const itemPaso = cb.closest('.paso-item');
    if (itemPaso) {
      let touchStartX = 0;
      itemPaso.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      itemPaso.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        if (diffX > 50 && !cb.disabled && !cb.checked) {
          cb.checked = true;
          actualizarDisponibilidad();
        }
      }, { passive: true });
    }
  });

  function leerPasoActualEnVoz() {
    const idx = obtenerIndiceActual();
    const pasoEl = checkboxes[idx].closest('.paso-item');
    const texto = pasoEl ? pasoEl.innerText.replace(/\s+/g, ' ').trim() : 'Paso completo';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(texto);
      utter.lang = 'es-PE';
      window.speechSynthesis.speak(utter);
    }
    if (estadoManosLibres) {
      estadoManosLibres.textContent = `Leyendo: ${texto}`;
      estadoManosLibres.classList.remove('oculto');
    }
  }

  if (btnLeerPaso) {
    btnLeerPaso.addEventListener('click', leerPasoActualEnVoz);
  }

  if (btnManosLibres) {
    btnManosLibres.addEventListener('click', () => {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        if (estadoManosLibres) {
          estadoManosLibres.textContent = 'Tu navegador no soporta comandos de voz. Puedes marcar manualmente o deslizar a la derecha en móvil.';
          estadoManosLibres.classList.remove('oculto');
        }
        return;
      }

      const rec = new SpeechRec();
      rec.lang = 'es-PE';
      rec.interimResults = false;
      btnManosLibres.setAttribute('aria-pressed', 'true');
      if (estadoManosLibres) {
        estadoManosLibres.textContent = 'Escuchando comando ("listo" o "siguiente" para avanzar, "atrás" para desmarcar)...';
        estadoManosLibres.classList.remove('oculto');
      }

      rec.onresult = (event) => {
        const cmd = event.results[0][0].transcript.toLowerCase();
        const idx = obtenerIndiceActual();
        if (cmd.includes('listo') || cmd.includes('siguiente') || cmd.includes('completar')) {
          if (!checkboxes[idx].disabled) {
            checkboxes[idx].checked = true;
            actualizarDisponibilidad();
          }
          if (estadoManosLibres) estadoManosLibres.textContent = `Comando "${cmd}": paso marcado.`;
        } else if (cmd.includes('atras') || cmd.includes('atrás') || cmd.includes('deshacer')) {
          for (let i = checkboxes.length - 1; i >= 0; i--) {
            if (checkboxes[i].checked) {
              checkboxes[i].checked = false;
              actualizarDisponibilidad();
              break;
            }
          }
          if (estadoManosLibres) estadoManosLibres.textContent = `Comando "${cmd}": paso revertido.`;
        } else {
          if (estadoManosLibres) estadoManosLibres.textContent = `Escuché "${cmd}". Di "listo" o "atrás".`;
        }
      };

      rec.onerror = () => {
        if (estadoManosLibres) estadoManosLibres.textContent = 'No se detectó voz. Puedes seguir usando las casillas manualmente.';
      };

      rec.onend = () => {
        btnManosLibres.setAttribute('aria-pressed', 'false');
      };

      rec.start();
    });
  }

  actualizarDisponibilidad();

  btnBuscarAcopio.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem(CLAVE_INTERES, 'Botellas de plástico');
    window.location.href = 'puntos.html';
  });
}

function sincronizarBotonesFavorito() {
  const favoritos = obtenerJsonStorage(CLAVE_FAVORITOS, []);
  document.querySelectorAll('.btn-favorito').forEach(btn => {
    const id = btn.getAttribute('data-punto-id');
    if (!id) return;
    const esFavorito = favoritos.includes(id);
    btn.classList.toggle('guardado', esFavorito);
    btn.textContent = esFavorito ? '★ Guardado como favorito' : '☆ Guardar favorito';
    btn.setAttribute('aria-pressed', esFavorito ? 'true' : 'false');
  });
}

function aplicarCambiosDeEncargadoEnPuntos() {
  const cambios = obtenerJsonStorage(CLAVE_CRITERIOS_PUNTOS, {});
  Object.keys(cambios).forEach(puntoId => {
    const info = cambios[puntoId];
    const horarioEl = document.querySelector(`[data-horario-punto="${puntoId}"]`);
    if (horarioEl && info.horario) {
      horarioEl.textContent = info.horario;
    }

    const tagsEl = document.querySelector(`[data-tags-punto="${puntoId}"]`);
    if (tagsEl && Array.isArray(info.materiales)) {
      tagsEl.innerHTML = '';
      info.materiales.forEach(mat => {
        const span = document.createElement('span');
        span.textContent = mat;
        tagsEl.appendChild(span);
      });
    }

    const pinEl = document.querySelector(`.pin-mapa[data-punto-id="${puntoId}"]`);
    if (pinEl) {
      if (info.horario) pinEl.setAttribute('data-horario', info.horario);
      if (Array.isArray(info.materiales)) pinEl.setAttribute('data-recibe', info.materiales.join(', '));
    }
  });
}

function iniciarRecomendacionPersonalizada() {
  const bloqueRec = document.getElementById('bloque-recomendado');
  const tituloRec = document.getElementById('recomendado-titulo');
  const motivoRec = document.getElementById('recomendado-motivo');
  const btnRecMapa = document.getElementById('btn-recomendado-mapa');
  const btnRecRec = document.getElementById('btn-recomendado-recordatorio');

  if (!bloqueRec || !tituloRec || !motivoRec) return;

  const favoritos = obtenerJsonStorage(CLAVE_FAVORITOS, []);
  const interes = localStorage.getItem(CLAVE_INTERES) || '';
  const puntos = Array.from(document.querySelectorAll('.item-punto'));

  let mejorPunto = puntos.find(p => p.getAttribute('data-abierto') === 'true' && favoritos.includes(p.getAttribute('data-punto-id')));
  let razon = '';

  if (mejorPunto) {
    const nombre = mejorPunto.querySelector('h3')?.textContent || 'Punto limpio';
    const dist = mejorPunto.getAttribute('data-distancia');
    tituloRec.textContent = `${nombre}`;
    razon = `Sugerido porque es uno de tus favoritos, está abierto ahora y se encuentra a ${dist} km.`;
  } else {
    mejorPunto = puntos
      .filter(p => p.getAttribute('data-abierto') === 'true')
      .sort((a, b) => parseFloat(a.getAttribute('data-distancia')) - parseFloat(b.getAttribute('data-distancia')))[0];

    if (mejorPunto) {
      const nombre = mejorPunto.querySelector('h3')?.textContent || 'Parque Reducto N° 2';
      const dist = mejorPunto.getAttribute('data-distancia');
      tituloRec.textContent = `${nombre}`;
      razon = interes
        ? `Sugerido porque está abierto ahora, a ${dist} km y recibe "${interes}".`
        : `Sugerido por ser el punto abierto más cercano a tu ubicación (${dist} km).`;
    }
  }

  if (mejorPunto) {
    motivoRec.textContent = razon;
    const idMejor = mejorPunto.getAttribute('data-punto-id');
    const nombreSolo = mejorPunto.querySelector('h3')?.textContent || 'Parque Reducto N° 2';

    if (btnRecMapa) {
      btnRecMapa.addEventListener('click', () => {
        const btnMapaTab = document.getElementById('btn-vista-mapa');
        if (btnMapaTab) btnMapaTab.click();
        const pin = document.querySelector(`.pin-mapa[data-punto-id="${idMejor}"]`);
        if (pin) pin.click();
      });
    }

    if (btnRecRec) {
      btnRecRec.addEventListener('click', () => {
        const btnAbrir = mejorPunto.querySelector('.btn-configurar-recordatorio');
        if (btnAbrir) btnAbrir.click();
        else btnRecRec.setAttribute('data-nombre-punto', nombreSolo);
      });
    }
  }
}

function iniciarFiltrosYVistasPuntos() {
  const btnVistaLista = document.getElementById('btn-vista-lista');
  const btnVistaMapa = document.getElementById('btn-vista-mapa');
  const contenedorLista = document.getElementById('vista-lista');
  const contenedorMapa = document.getElementById('vista-mapa');
  const filtroAbierto = document.getElementById('filtro-abierto');
  const filtroFavoritos = document.getElementById('filtro-favoritos');
  const filtroDistancia = document.getElementById('filtro-distancia');
  const puntosAcopio = document.querySelectorAll('.item-punto');
  const pinesMapa = document.querySelectorAll('.pin-mapa');
  const detalleNombre = document.getElementById('mapa-detalle-nombre');
  const detalleMeta = document.getElementById('mapa-detalle-meta');
  const detalleAcciones = document.getElementById('mapa-detalle-acciones');
  const mapaBtnFavorito = document.getElementById('mapa-btn-favorito');
  const mapaBtnRecordatorio = document.getElementById('mapa-btn-recordatorio');
  const avisoSinPuntos = document.getElementById('sin-puntos-aviso');

  if (!btnVistaLista || !btnVistaMapa || !contenedorLista || !contenedorMapa) return;

  aplicarCambiosDeEncargadoEnPuntos();

  btnVistaLista.addEventListener('click', () => {
    btnVistaLista.classList.add('activo');
    btnVistaLista.setAttribute('aria-selected', 'true');
    btnVistaMapa.classList.remove('activo');
    btnVistaMapa.setAttribute('aria-selected', 'false');
    contenedorLista.classList.remove('oculto');
    contenedorMapa.classList.add('oculto');
  });

  btnVistaMapa.addEventListener('click', () => {
    btnVistaMapa.classList.add('activo');
    btnVistaMapa.setAttribute('aria-selected', 'true');
    btnVistaLista.classList.remove('activo');
    btnVistaLista.setAttribute('aria-selected', 'false');
    contenedorMapa.classList.remove('oculto');
    contenedorLista.classList.add('oculto');
  });

  function resetearDetalleMapa() {
    if (detalleNombre) detalleNombre.textContent = 'Selecciona un punto en el mapa';
    if (detalleMeta) detalleMeta.textContent = 'Toca cualquiera de los marcadores para ver su horario, guardar favorito o programar tu entrega.';
    if (detalleAcciones) detalleAcciones.classList.add('oculto');
  }

  function aplicarFiltrosPuntos() {
    const soloAbiertos = filtroAbierto ? filtroAbierto.checked : false;
    const soloFavs = filtroFavoritos ? filtroFavoritos.checked : false;
    const distanciaMax = filtroDistancia && filtroDistancia.value !== 'todas'
      ? parseFloat(filtroDistancia.value)
      : Infinity;
    const favoritos = obtenerJsonStorage(CLAVE_FAVORITOS, []);

    let visibles = 0;

    puntosAcopio.forEach(punto => {
      const id = punto.getAttribute('data-punto-id');
      const estaAbierto = punto.getAttribute('data-abierto') === 'true';
      const distancia = parseFloat(punto.getAttribute('data-distancia') || '0');
      const cumple = (!soloAbiertos || estaAbierto) && (!soloFavs || favoritos.includes(id)) && distancia <= distanciaMax;

      punto.classList.toggle('oculto', !cumple);
      if (cumple) visibles++;
    });

    pinesMapa.forEach(pin => {
      const id = pin.getAttribute('data-punto-id');
      const estaAbierto = pin.getAttribute('data-abierto') === 'true';
      const distancia = parseFloat(pin.getAttribute('data-distancia') || '0');
      const cumple = (!soloAbiertos || estaAbierto) && (!soloFavs || favoritos.includes(id)) && distancia <= distanciaMax;

      pin.classList.toggle('oculto', !cumple);
      if (!cumple && pin.classList.contains('pin-activo')) {
        pin.classList.remove('pin-activo');
        resetearDetalleMapa();
      }
    });

    if (avisoSinPuntos) {
      avisoSinPuntos.classList.toggle('oculto', visibles > 0);
    }
  }

  pinesMapa.forEach(pin => {
    pin.addEventListener('click', () => {
      pinesMapa.forEach(p => p.classList.remove('pin-activo'));
      pin.classList.add('pin-activo');

      const id = pin.getAttribute('data-punto-id');
      const nombre = pin.getAttribute('data-nombre') || 'Punto de acopio';
      const zona = pin.getAttribute('data-zona') || '';
      const horario = pin.getAttribute('data-horario') || '';
      const recibe = pin.getAttribute('data-recibe') || '';

      if (detalleNombre) detalleNombre.textContent = `${nombre} (${zona})`;
      if (detalleMeta) detalleMeta.textContent = `${horario} · Recibe: ${recibe}`;

      if (mapaBtnFavorito && id) {
        mapaBtnFavorito.setAttribute('data-punto-id', id);
      }
      if (mapaBtnRecordatorio) {
        mapaBtnRecordatorio.setAttribute('data-nombre-punto', nombre);
      }
      if (detalleAcciones) detalleAcciones.classList.remove('oculto');
      sincronizarBotonesFavorito();
    });
  });

  if (filtroAbierto) filtroAbierto.addEventListener('change', aplicarFiltrosPuntos);
  if (filtroFavoritos) filtroFavoritos.addEventListener('change', aplicarFiltrosPuntos);
  if (filtroDistancia) filtroDistancia.addEventListener('change', aplicarFiltrosPuntos);

  document.addEventListener('favoritosActualizados', () => {
    if (filtroFavoritos && filtroFavoritos.checked) {
      aplicarFiltrosPuntos();
    }
  });
}

function iniciarFavoritosYRecordatorio() {
  const modalRecordatorio = document.getElementById('modal-recordatorio');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const btnCerrarModalX = document.getElementById('btn-cerrar-modal-x');
  const formRecordatorio = document.getElementById('form-recordatorio');
  const inputFecha = document.getElementById('recordatorio-fecha');
  const inputHora = document.getElementById('recordatorio-hora');
  const spanNombrePunto = document.getElementById('modal-nombre-punto');
  const errorRecordatorio = document.getElementById('error-recordatorio');
  const feedbackGlobal = document.getElementById('feedback-recordatorio-global');
  const mapaBtnRecordatorio = document.getElementById('mapa-btn-recordatorio');
  const bloqueRecordatorios = document.getElementById('bloque-recordatorios');
  const listaRecordatorios = document.getElementById('lista-recordatorios');
  const btnLimpiarRecordatorios = document.getElementById('btn-limpiar-recordatorios');

  if (inputFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.setAttribute('min', hoy);
  }

  function renderizarRecordatorios() {
    if (!bloqueRecordatorios || !listaRecordatorios) return;
    const recordatorios = obtenerJsonStorage(CLAVE_RECORDATORIOS, []);
    listaRecordatorios.innerHTML = '';

    if (recordatorios.length === 0) {
      bloqueRecordatorios.classList.add('oculto');
      return;
    }

    recordatorios.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = `${rec.punto} — ${rec.fecha} a las ${rec.hora}`;
      listaRecordatorios.appendChild(li);
    });
    bloqueRecordatorios.classList.remove('oculto');
  }

  sincronizarBotonesFavorito();
  renderizarRecordatorios();

  if (btnLimpiarRecordatorios) {
    btnLimpiarRecordatorios.addEventListener('click', () => {
      guardarJsonStorage(CLAVE_RECORDATORIOS, []);
      renderizarRecordatorios();
    });
  }

  document.addEventListener('click', (e) => {
    const btnFav = e.target.closest('.btn-favorito');
    if (!btnFav) return;
    const id = btnFav.getAttribute('data-punto-id');
    if (!id) return;

    let actuales = obtenerJsonStorage(CLAVE_FAVORITOS, []);
    if (actuales.includes(id)) {
      actuales = actuales.filter(item => item !== id);
    } else {
      actuales.push(id);
    }
    guardarJsonStorage(CLAVE_FAVORITOS, actuales);
    sincronizarBotonesFavorito();
    document.dispatchEvent(new CustomEvent('favoritosActualizados'));
  });

  let ultimoElementoEnfocado = null;
  let puntoSeleccionadoActual = 'Punto de acopio';

  function abrirModalPara(nombrePunto) {
    if (!modalRecordatorio) return;
    ultimoElementoEnfocado = document.activeElement;
    puntoSeleccionadoActual = nombrePunto || 'Punto de acopio';
    if (spanNombrePunto) spanNombrePunto.textContent = puntoSeleccionadoActual;
    if (errorRecordatorio) errorRecordatorio.classList.add('oculto');
    modalRecordatorio.classList.remove('oculto');
    if (inputFecha) inputFecha.focus();
  }

  function cerrarModal() {
    if (!modalRecordatorio) return;
    modalRecordatorio.classList.add('oculto');
    if (formRecordatorio) formRecordatorio.reset();
    if (errorRecordatorio) errorRecordatorio.classList.add('oculto');
    if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === 'function') {
      ultimoElementoEnfocado.focus();
      ultimoElementoEnfocado = null;
    }
  }

  document.querySelectorAll('.btn-configurar-recordatorio').forEach(btn => {
    btn.addEventListener('click', () => {
      abrirModalPara(btn.getAttribute('data-nombre-punto'));
    });
  });

  if (mapaBtnRecordatorio) {
    mapaBtnRecordatorio.addEventListener('click', () => {
      abrirModalPara(mapaBtnRecordatorio.getAttribute('data-nombre-punto'));
    });
  }

  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
  if (btnCerrarModalX) btnCerrarModalX.addEventListener('click', cerrarModal);

  if (modalRecordatorio) {
    modalRecordatorio.addEventListener('click', (e) => {
      if (e.target === modalRecordatorio) cerrarModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalRecordatorio.classList.contains('oculto')) {
        cerrarModal();
      }
    });
  }

  if (formRecordatorio) {
    formRecordatorio.addEventListener('submit', (e) => {
      e.preventDefault();
      const fecha = inputFecha ? inputFecha.value.trim() : '';
      const hora = inputHora ? inputHora.value.trim() : '';

      if (!fecha || !hora) {
        if (errorRecordatorio) {
          errorRecordatorio.textContent = 'Por favor selecciona la fecha y la hora para guardar tu recordatorio.';
          errorRecordatorio.classList.remove('oculto');
        }
        return;
      }

      const lista = obtenerJsonStorage(CLAVE_RECORDATORIOS, []);
      lista.push({ punto: puntoSeleccionadoActual, fecha, hora });
      guardarJsonStorage(CLAVE_RECORDATORIOS, lista);
      renderizarRecordatorios();

      cerrarModal();

      if (feedbackGlobal) {
        feedbackGlobal.textContent = 'Entrega programada con éxito';
        feedbackGlobal.classList.remove('oculto');

        setTimeout(() => {
          feedbackGlobal.classList.add('oculto');
        }, 4000);
      }
    });
  }
}

function iniciarPanelReciclador() {
  const formAdmin = document.getElementById('form-admin-reciclador');
  const selectPunto = document.getElementById('admin-punto');
  const vistaPuntoNombre = document.getElementById('vista-punto-nombre');
  const chipsMateriales = document.querySelectorAll('.chip-material-admin');
  const selectDias = document.getElementById('admin-dias');
  const inputApertura = document.getElementById('admin-hora-apertura');
  const inputCierre = document.getElementById('admin-hora-cierre');
  const vistaHorario = document.getElementById('vista-horario-actual');
  const vistaMateriales = document.getElementById('vista-materiales-actual');
  const badgeEstado = document.getElementById('badge-estado-publicacion');
  const errorHorario = document.getElementById('error-horario-admin');
  const errorMateriales = document.getElementById('error-materiales-admin');
  const contenedorChips = document.getElementById('contenedor-chips-admin');
  const alertaConfirmacion = document.getElementById('alerta-publicacion-admin');
  const btnSugerir = document.getElementById('btn-sugerir-criterios');
  const boxSugerencia = document.getElementById('box-sugerencia-encargado');
  const txtSugerencia = document.getElementById('texto-sugerencia-encargado');
  const btnAplicarSug = document.getElementById('btn-aplicar-sugerencia');
  const btnDescartarSug = document.getElementById('btn-descartar-sugerencia');

  if (!formAdmin) return;

  function obtenerMaterialesActivos() {
    return Array.from(document.querySelectorAll('.chip-material-admin.seleccionado'))
      .map(chip => chip.getAttribute('data-material') || chip.textContent.trim());
  }

  function actualizarVistaMateriales() {
    if (!vistaMateriales) return;
    const activos = obtenerMaterialesActivos();
    vistaMateriales.textContent = activos.length > 0 ? activos.join(', ') : 'Ninguno seleccionado';
  }

  chipsMateriales.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      chip.classList.toggle('seleccionado');

      if (contenedorChips) contenedorChips.classList.remove('campo-error');
      if (errorMateriales) errorMateriales.classList.add('oculto');
      actualizarVistaMateriales();
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

  function obtenerHorarioFormateado() {
    const dias = selectDias ? selectDias.value : 'Lunes a Sábado';
    const apertura = inputApertura && inputApertura.value ? formatearHora(inputApertura.value) : '8:00 am';
    const cierre = inputCierre && inputCierre.value ? formatearHora(inputCierre.value) : '4:00 pm';
    return `${dias}: ${apertura} - ${cierre}`;
  }

  function actualizarVistaHorario() {
    if (errorHorario) errorHorario.classList.add('oculto');
    if (vistaHorario) {
      vistaHorario.textContent = obtenerHorarioFormateado();
    }
  }

  if (selectPunto && vistaPuntoNombre) {
    selectPunto.addEventListener('change', () => {
      vistaPuntoNombre.textContent = selectPunto.options[selectPunto.selectedIndex].text;
    });
  }

  if (selectDias) selectDias.addEventListener('change', actualizarVistaHorario);
  if (inputApertura) inputApertura.addEventListener('change', actualizarVistaHorario);
  if (inputCierre) inputCierre.addEventListener('change', actualizarVistaHorario);

  if (btnSugerir && boxSugerencia && txtSugerencia) {
    btnSugerir.addEventListener('click', () => {
      const puntoNombre = selectPunto ? selectPunto.options[selectPunto.selectedIndex].text : 'este punto';
      txtSugerencia.textContent = `Sugerencia para ${puntoNombre}: Lunes a Sábado de 8:00 am a 5:00 pm recibiendo Botellas de plástico, Cartón y Papel, Vidrio y Latas (los materiales de mayor demanda ciudadana).`;
      boxSugerencia.classList.remove('oculto');
    });

    if (btnAplicarSug) {
      btnAplicarSug.addEventListener('click', () => {
        if (selectDias) selectDias.value = 'Lunes a Sábado';
        if (inputApertura) inputApertura.value = '08:00';
        if (inputCierre) inputCierre.value = '17:00';
        const recomendados = ['Botellas de plástico', 'Cartón y Papel', 'Vidrio', 'Latas'];
        chipsMateriales.forEach(chip => {
          const mat = chip.getAttribute('data-material');
          chip.classList.toggle('seleccionado', recomendados.includes(mat));
        });
        if (contenedorChips) contenedorChips.classList.remove('campo-error');
        if (errorMateriales) errorMateriales.classList.add('oculto');
        actualizarVistaHorario();
        actualizarVistaMateriales();
        boxSugerencia.classList.add('oculto');
      });
    }

    if (btnDescartarSug) {
      btnDescartarSug.addEventListener('click', () => {
        boxSugerencia.classList.add('oculto');
      });
    }
  }

  actualizarVistaMateriales();

  formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();

    const materialesActivos = obtenerMaterialesActivos();
    const aperturaVal = inputApertura ? inputApertura.value : '';
    const cierreVal = inputCierre ? inputCierre.value : '';

    if (aperturaVal && cierreVal && cierreVal <= aperturaVal) {
      if (errorHorario) errorHorario.classList.remove('oculto');
      return;
    }

    if (materialesActivos.length === 0) {
      if (contenedorChips) contenedorChips.classList.add('campo-error');
      if (errorMateriales) {
        errorMateriales.textContent = 'Debes seleccionar al menos una categoría de material antes de publicar.';
        errorMateriales.classList.remove('oculto');
      }
      return;
    }

    if (contenedorChips) contenedorChips.classList.remove('campo-error');
    if (errorMateriales) errorMateriales.classList.add('oculto');
    if (errorHorario) errorHorario.classList.add('oculto');

    const puntoId = selectPunto ? selectPunto.value : 'punto-reducto';
    const cambios = obtenerJsonStorage(CLAVE_CRITERIOS_PUNTOS, {});
    cambios[puntoId] = {
      horario: obtenerHorarioFormateado(),
      materiales: materialesActivos
    };
    guardarJsonStorage(CLAVE_CRITERIOS_PUNTOS, cambios);

    if (badgeEstado) {
      badgeEstado.textContent = 'Criterios publicados y visibles';
      badgeEstado.className = 'badge-estado estado-publicado';
    }

    if (alertaConfirmacion) {
      alertaConfirmacion.textContent = 'Criterios y horarios publicados exitosamente.';
      alertaConfirmacion.classList.remove('oculto');

      setTimeout(() => {
        alertaConfirmacion.classList.add('oculto');
      }, 3500);
    }
  });
}

function iniciarAsistenteConversacional() {
  const btnAsistente = document.getElementById('btn-asistente');
  const btnCerrar = document.getElementById('btn-cerrar-asistente');
  const panel = document.getElementById('panel-asistente');
  const mensajes = document.getElementById('asistente-mensajes');
  const form = document.getElementById('form-asistente');
  const input = document.getElementById('input-asistente');
  const btnVoz = document.getElementById('btn-voz-asistente');
  const chips = document.querySelectorAll('.asistente-chip');

  if (!btnAsistente || !panel || !mensajes || !form || !input) return;

  btnAsistente.addEventListener('click', () => {
    const abierto = !panel.classList.toggle('oculto');
    btnAsistente.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    if (abierto) input.focus();
  });

  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
      panel.classList.add('oculto');
      btnAsistente.setAttribute('aria-expanded', 'false');
      btnAsistente.focus();
    });
  }

  function agregarMensaje(textoHtml, tipo) {
    const div = document.createElement('div');
    div.className = tipo === 'user' ? 'msg-user' : 'msg-bot';
    if (tipo === 'user') {
      div.textContent = textoHtml;
    } else {
      div.innerHTML = textoHtml;
    }
    mensajes.appendChild(div);
    mensajes.scrollTop = mensajes.scrollHeight;
  }

  function responderConsulta(consulta) {
    const q = consulta.toLowerCase();
    if (q.includes('aceite')) {
      return 'El aceite usado va en una botella plástica bien cerrada (nunca al caño). Puedes dejarlo en <a href="puntos.html">Parque Castilla (Lince)</a> o revisar el <a href="residuos.html?q=aceite">catálogo</a>.';
    }
    if (q.includes('botella') || q.includes('prepar')) {
      return 'Para botellas plásticas: vacía, enjuaga con poca agua, quita tapa y aplasta. Mira la guía paso a paso en <a href="preparacion.html">Preparación</a>.';
    }
    if (q.includes('abierto') || q.includes('horario') || q.includes('punto') || q.includes('donde')) {
      return 'Hoy están abiertos Parque Reducto N° 2 (Miraflores), Bosque El Olivar (San Isidro), Barranco y Parque Castilla. Revisa distancias en <a href="puntos.html">Puntos de acopio</a>.';
    }
    if (q.includes('pila') || q.includes('bateria') || q.includes('batería')) {
      return 'Las pilas y baterías van en el Tacho Rojo (especiales). Bosque El Olivar recibe pilas y pequeños aparatos. Ver más en <a href="residuos.html?cat=especiales">Especiales</a>.';
    }
    if (q.includes('carton') || q.includes('cartón') || q.includes('pizza') || q.includes('caja')) {
      return 'Las cajas deben ir secas, limpias y desarmadas (Tacho Azul). El cartón con grasa de comida no se recicla. Ver <a href="residuos.html?cat=papel">Papel y Cartón</a>.';
    }
    return 'Solo respondo dudas sobre materiales, preparación y puntos de RecycleNow. Puedes buscar directo en <a href="residuos.html">Qué reciclar</a> o revisar <a href="puntos.html">Puntos de acopio</a>.';
  }

  function procesarPregunta(texto) {
    const limpio = texto.trim();
    if (!limpio) return;
    agregarMensaje(limpio, 'user');
    const resp = responderConsulta(limpio);
    setTimeout(() => agregarMensaje(resp, 'bot'), 220);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    procesarPregunta(input.value);
    input.value = '';
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      procesarPregunta(chip.getAttribute('data-pregunta') || chip.textContent);
    });
  });

  iniciarReconocimientoVoz(btnVoz, null, (texto) => {
    procesarPregunta(texto);
  });
}
