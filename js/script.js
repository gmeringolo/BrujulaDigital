

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initActiveLink();
  initScrollReveal();
  initPasswordMeter();
  initQuiz();
  initContactForm();
  initYear();
});


function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✕' : '☰';
    });
  }

  // En pantallas táctiles, permite tocar para abrir el submenú
  document.querySelectorAll('.has-submenu > a').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });
}


function initActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a[href]').forEach((a) => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
}


function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => io.observe(el));
}


function initPasswordMeter() {
  const input = document.getElementById('password-check');
  const fill = document.getElementById('meter-fill');
  const label = document.getElementById('meter-label');
  if (!input || !fill || !label) return;

  const rules = document.querySelectorAll('.rule-item');

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
      el.classList.toggle('rule-ok', ok);
      el.textContent = (ok ? '☑ ' : '☐ ') + el.textContent.slice(2);
    });

    const pct = val.length === 0 ? 0 : (score / 5) * 100;
    fill.style.width = pct + '%';

    let text = 'Escribí una contraseña para evaluarla';
    let color = 'var(--color-danger)';
    if (val.length > 0) {
      if (score <= 2) { text = 'Débil — le falta variedad'; color = 'var(--color-danger)'; }
      else if (score <= 4) { text = 'Aceptable — podés reforzarla'; color = 'var(--color-accent)'; }
      else { text = 'Fuerte — buen trabajo'; color = 'var(--color-accent-2)'; }
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
  const panel = document.getElementById('quiz-panel');
  if (!panel) return;

  let current = 0;
  let score = 0;
  const total = QUIZ_QUESTIONS.length;

  const progressEl = document.getElementById('quiz-progress');
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
      <div class="quiz-options" role="group" aria-label="Opciones de respuesta"></div>
      <p class="quiz-feedback" aria-live="polite"></p>
      <div style="text-align:right;">
        <button type="button" class="btn btn-primary" id="quiz-next" disabled>Siguiente ruta →</button>
      </div>
    `;

    const optionsWrap = bodyEl.querySelector('.quiz-options');
    const feedback = bodyEl.querySelector('.quiz-feedback');
    const nextBtn = bodyEl.querySelector('#quiz-next');
    let answered = false;

    item.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
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
      optionsWrap.appendChild(btn);
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
      <div class="quiz-result">
        <p class="rumbo center" style="justify-content:center;">Resultado final</p>
        <p class="score">${score}/${total}</p>
        <p>${msg}</p>
        <button type="button" class="btn btn-primary" id="quiz-restart">Volver a navegar</button>
      </div>
    `;
    document.getElementById('quiz-restart').addEventListener('click', () => {
      current = 0;
      score = 0;
      renderQuestion();
    });
  }
}


function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nombre = form.querySelector('#nombre');
    const email = form.querySelector('#email');
    const rol = form.querySelector('#rol');
    const mensaje = form.querySelector('#mensaje');
    const acepta = form.querySelector('#acepta');

    valid = validateField(nombre, nombre.value.trim().length >= 2, 'Ingresá tu nombre.') && valid;
    valid = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Ingresá un correo válido.') && valid;
    valid = validateField(rol, rol.value !== '', 'Seleccioná una opción.') && valid;
    valid = validateField(mensaje, mensaje.value.trim().length >= 10, 'Contanos un poco más (mínimo 10 caracteres).') && valid;
    valid = validateField(acepta, acepta.checked, 'Debés aceptar para continuar.') && valid;

    if (valid) {
      success.classList.add('show');
      success.textContent = `¡Gracias, ${nombre.value.trim()}! Recibimos tu mensaje y lo vamos a revisar pronto.`;
      form.reset();
      form.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));
    } else {
      success.classList.remove('show');
    }
  });

  function validateField(el, condition, message) {
    const field = el.closest('.field');
    const errorEl = field.querySelector('.field-error');
    if (!condition) {
      field.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
      return false;
    }
    field.classList.remove('has-error');
    return true;
  }
}


function initYear() {
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
