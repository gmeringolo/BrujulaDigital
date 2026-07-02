

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initActiveLink();
  initScrollReveal();
  initPasswordMeter();
  initQuiz();
  initYear();
});


function initNav() {
  const toggle = document.querySelector('.boton-menu');
  const nav = document.querySelector('.menu-principal');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✖' : '☰';
    });
  }
}


function initActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-principal a[href]').forEach((a) => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('activo');
  });
}


function initScrollReveal() {
  const items = document.querySelectorAll('.revelar');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => io.observe(el));
}


function initPasswordMeter() {
  const input = document.getElementById('password-check');
  const fill = document.getElementById('relleno-medidor');
  const label = document.getElementById('etiqueta-medidor');
  if (!input || !fill || !label) return;

  const rules = document.querySelectorAll('.elemento-regla');

  input.addEventListener('input', () => {
    const val = input.value;
    let score = 0;
    const checks = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      symbol: /[^A-Za-z0-9]/.test(val),
    };
    Object.values(checks).forEach((ok) => { if (ok) score++; });

    rules.forEach((el) => {
      const rule = el.dataset.rule;
      const ok = !!checks[rule];
      el.classList.toggle('regla-cumplida', ok);
      el.textContent = (ok ? '✓ ' : '◻ ') + el.textContent.slice(2);
    });

    const pct = val.length === 0 ? 0 : (score / 5) * 100;
    fill.style.width = pct + '%';

    let text = 'Escribí una contraseña para evaluarla';
    let color = '#E4572E';
    if (val.length > 0) {
      if (score <= 2) { text = 'Débil — le falta variedad'; color = '#E4572E'; }
      else if (score <= 4) { text = 'Aceptable — podés reforzarla'; color = '#FF6F59'; }
      else { text = 'Fuerte — buen trabajo'; color = '#E8B84B'; }
    }
    label.textContent = text;
    fill.style.background = color;
  });
}


const QUIZ_QUESTIONS = [
  {
    q: '¿Cuál de estas contraseñas es más segura?',
    options: ['123456', 'MiPerro2010', 'Rb7!qL2#mZx9', 'contraseña'],
    correct: 2,
    tip: 'Una contraseña fuerte combina mayúsculas, minúsculas, números y símbolos sin formar palabras reales.',
  },
  {
    q: 'Recibís un correo del "banco" pidiendo que confirmes tu clave haciendo clic en un enlace urgente. ¿Qué hacés?',
    options: [
      'Hago clic y completo mis datos rápido, antes de que se bloquee la cuenta',
      'Ignoro el enlace y entro directamente escribiendo la dirección oficial del banco en el navegador',
      'Respondo el correo preguntando si es verdad',
      'Reenvío el correo a mis contactos para avisarles',
    ],
    correct: 1,
    tip: 'Los bancos nunca piden tu clave por correo. Ante dudas, contactá al banco por sus canales oficiales, nunca por el enlace del mensaje.',
  },
  {
    q: '¿Qué es la "huella digital"?',
    options: [
      'Un tipo de virus informático',
      'El rastro de datos e información que dejamos al usar internet',
      'Una contraseña biométrica',
      'Un programa antivirus',
    ],
    correct: 1,
    tip: 'Cada publicación, búsqueda o "me gusta" forma parte de la huella digital que otros pueden ver.',
  },
  {
    q: 'Un compañero de clase recibe mensajes ofensivos repetidos en redes sociales. ¿Cuál es la mejor primera acción?',
    options: [
      'No decir nada para no meterse en problemas',
      'Responder con más insultos para defenderlo',
      'Guardar pruebas (capturas), no responder a las provocaciones y contarlo a un adulto de confianza',
      'Borrar la cuenta del compañero',
    ],
    correct: 2,
    tip: 'Ante el ciberacoso: no respondas con violencia, guardá evidencia y pedí ayuda a un adulto o a la plataforma.',
  },
  {
    q: '¿Qué significa que un sitio use "https" en vez de "http"?',
    options: [
      'Que el sitio es más rápido',
      'Que la conexión entre tu navegador y el sitio está cifrada',
      'Que el sitio no tiene publicidad',
      'Que no necesitás usuario ni contraseña',
    ],
    correct: 1,
    tip: 'La "s" de HTTPS indica que los datos viajan cifrados, lo que dificulta que alguien los intercepte.',
  },
  {
    q: 'Antes de compartir una noticia impactante, ¿qué deberías hacer?',
    options: [
      'Compartirla enseguida si tiene muchos "me gusta"',
      'Verificar la fuente y buscar si otros medios confiables la confirman',
      'Compartirla solo si el titular es llamativo',
      'Cambiar el título para que sea más viral',
    ],
    correct: 1,
    tip: 'Contrastar la fuente y buscar coberturas de medios confiables ayuda a frenar la desinformación.',
  },
];

function initQuiz() {
  const panel = document.getElementById('panel-cuestionario');
  if (!panel) return;

  let current = 0;
  let score = 0;
  const total = QUIZ_QUESTIONS.length;

  const progressEl = document.getElementById('progreso-cuestionario');
  const bodyEl = document.getElementById('quiz-body');

  buildProgress();
  renderQuestion();

  function buildProgress() {
    progressEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const span = document.createElement('span');
      progressEl.appendChild(span);
    }
  }

  function updateProgress() {
    [...progressEl.children].forEach((span, i) => {
      span.classList.toggle('done', i < current);
      span.classList.toggle('current', i === current);
    });
  }

  function renderQuestion() {
    updateProgress();

    if (current >= total) {
      renderResult();
      return;
    }

    const item = QUIZ_QUESTIONS[current];
    bodyEl.innerHTML = `
      <p class="rumbo">Pregunta ${current + 1} de ${total}</p>
      <h3>${item.q}</h3>
      <div class="opciones-cuestionario" role="group" aria-label="Opciones de respuesta"></div>
      <p class="retroalimentacion-cuestionario" aria-live="polite"></p>
      <div style="text-align:right;">
        <button type="button" class="boton boton-principal" id="quiz-next" disabled>Siguiente ruta →</button>
      </div>
    `;

    const optionsWrap = bodyEl.querySelector('.opciones-cuestionario');
    const feedback = bodyEl.querySelector('.retroalimentacion-cuestionario');
    const nextBtn = bodyEl.querySelector('#quiz-next');
    let answered = false;

    item.options.forEach((opt, idx) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'opcion-cuestionario';
      boton.textContent = opt;
      boton.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const isCorrect = idx === item.correct;
        if (isCorrect) score++;

        [...optionsWrap.children].forEach((b, i) => {
          b.disabled = true;
          if (i === item.correct) b.classList.add('correct');
          else if (i === idx && !isCorrect) b.classList.add('incorrect');
        });

        feedback.textContent = (isCorrect ? '¡Correcto! ' : 'No es la mejor opción. ') + item.tip;
        feedback.classList.add(isCorrect ? 'ok' : 'bad');
        nextBtn.disabled = false;
      });
      optionsWrap.appendChild(boton);
    });

    nextBtn.addEventListener('click', () => {
      current++;
      renderQuestion();
    });
  }

  function renderResult() {
    const pct = Math.round((score / total) * 100);
    let msg = '';
    if (pct >= 85) msg = 'Excelente rumbo: manejás muy bien la ciudadanía digital.';
    else if (pct >= 60) msg = 'Buen viaje: conocés lo esencial, seguí reforzando algunos puntos.';
    else msg = 'Es un buen punto de partida: repasá las secciones del sitio y volvé a intentarlo.';

    bodyEl.innerHTML = `
      <div class="resultado-cuestionario">
        <p class="rumbo centrado" style="justify-content:centrado;">Resultado final</p>
        <p class="score">${score}/${total}</p>
        <p>${msg}</p>
        <button type="button" class="boton boton-principal" id="quiz-restart">Volver a navegar</button>
      </div>
    `;
    document.getElementById('quiz-restart').addEventListener('click', () => {
      current = 0;
      score = 0;
      renderQuestion();
    });
  }
}

function initYear() {
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

