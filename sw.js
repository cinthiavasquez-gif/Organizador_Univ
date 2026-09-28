let d = JSON.parse(localStorage.getItem('miAgendaU_v3') || '{"subjects":[],"tasks":[],"profile":{},"theme":"classic","mood":""}');
let sec = 1500;
let int = null;

const moods = ['😴 Con sueño', '😌 En calma', '🔥 Con motivación', '😵 Con mucho en mente', '🤩 Con energía'];
const quotes = [
  '🌸 Haz lo que puedas hoy, eso también cuenta.',
  '💗 No tienes que hacerlo todo de una vez.',
  '✨ Pequeños avances también son avances.',
  '🎓 Organízate, respira y continúa: vas muy bien.'
];

function save() {
  localStorage.setItem('miAgendaU_v3', JSON.stringify(d));
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function show(id, b) {
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setTheme(x) {
  d.theme = x;
  save();
  render();
  showToast('Tema cambiado a ' + x);
}

function render() {
  document.body.className = d.theme;
  
  const metaTheme = document.getElementById('meta-theme-color');
  if (metaTheme) {
    metaTheme.content = d.theme === 'girly' ? '#e56b9f' : d.theme === 'dark' ? '#121218' : '#3157a6';
  }

  document.getElementById('title').textContent = d.theme === 'girly' ? '🎀 Mi Agenda U' : d.theme === 'dark' ? '🌙 Mi Agenda U' : '🎓 Mi Agenda U';
  document.getElementById('hello').textContent = d.profile.name ? '¡Hola, ' + d.profile.name + '! 👋' : '¡Hola! 👋';
  document.getElementById('badge').textContent = d.profile.career || 'Estudiante';
  document.getElementById('count').textContent = d.subjects.length;

  let done = d.tasks.filter(x => x.done).length;
  let p = d.tasks.length ? Math.round(done / d.tasks.length * 100) : 0;
  document.getElementById('pending').textContent = d.tasks.length - done;
  document.getElementById('pct').textContent = p + '%';
  document.getElementById('bar').style.width = p + '%';

  document.getElementById('quote').textContent = quotes[new Date().getDate() % quotes.length];
  document.getElementById('moods').innerHTML = moods.map(m => `<button class="mood ${d.mood === m ? 'active' : ''}" onclick="moodSet('${m}')">${m}</button>`).join('');

  document.getElementById('subjects').innerHTML = d.subjects.length 
    ? d.subjects.map((s, i) => `<div class="item"><b>${s}</b><button class="danger" onclick="delSub(${i})">Eliminar</button></div>`).join('') 
    : '<div class="card muted">Aún no has agregado materias.</div>';

  document.getElementById('tasks').innerHTML = d.tasks.length 
    ? d.tasks.map(t => `<div class="item"><div class="${t.done ? 'done' : ''}"><b>${t.title}</b><br><small class="muted">📚 ${t.subject || 'Sin materia'} · 📅 ${t.date || 'Sin fecha'}</small></div><div class="item-actions"><button class="success" onclick="doneTask(${t.id})">✓</button><button class="danger" onclick="delTask(${t.id})">×</button></div></div>`).join('') 
    : '<div class="card muted">No tienes tareas pendientes.</div>';

  document.getElementById('upcoming').innerHTML = d.tasks.filter(t => !t.done).slice(0, 4).map(t => `<div class="item"><b>${t.title}</b><button class="success" onclick="doneTask(${t.id})">✓</button></div>`).join('') 
    || '<div class="card muted">¡Todo al día! 💗</div>';

  document.getElementById('achievements').innerHTML = [
    ['🌟', 'Primer paso', done >= 1],
    ['🔥', 'Constante', done >= 5],
    ['📚', 'Organizado', d.subjects.length >= 3],
    ['🏆', 'Imparable', done >= 10]
  ].map(a => `<div class="card" style="opacity:${a[2] ? 1 : 0.35}; text-align:center;"><div style="font-size:24px">${a[0]}</div><b>${a[1]}</b></div>`).join('');

  document.getElementById('name').value = d.profile.name || '';
  document.getElementById('career').value = d.profile.career || '';

  document.querySelectorAll('.themeBtn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(d.theme === 'classic' ? 'Clásico' : d.theme === 'girly' ? 'Girly' : 'Dark'));
  });
}

// SISTEMA DE MODALES FLOTANTES
function openModal(title, contentHtml, onConfirm) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = contentHtml;
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('active');

  document.getElementById('modalConfirmBtn').onclick = () => {
    onConfirm();
    closeModal();
  };
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function openSubjectModal() {
  openModal('Agregar Materia', '<input id="subInput" placeholder="Nombre de la materia">', () => {
    const val = document.getElementById('subInput').value;
    if (val) {
      d.subjects.push(val);
      save(); render();
      showToast('Materia agregada');
    }
  });
}

function openTaskModal() {
  const options = d.subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  const html = `
    <input id="taskTitle" placeholder="Título de la tarea">
    <select id="taskSub"><option value="">Seleccionar Materia (opcional)</option>${options}</select>
    <input id="taskDate" type="date">
  `;
  openModal('Nueva Tarea', html, () => {
    const title = document.getElementById('taskTitle').value;
    if (title) {
      d.tasks.push({
        id: Date.now(),
        title,
        subject: document.getElementById('taskSub').value,
        date: document.getElementById('taskDate').value,
        done: false
      });
      save(); render();
      showToast('Tarea creada');
    }
  });
}

function moodSet(m) { d.mood = m; save(); render(); showToast('Ánimo guardado'); }
function doneTask(id) { 
  let t = d.tasks.find(x => x.id == id); 
  if (t) { t.done = !t.done; save(); render(); showToast(t.done ? '¡Tarea completada!' : 'Tarea pendiente'); } 
}
function delTask(id) { d.tasks = d.tasks.filter(x => x.id != id); save(); render(); showToast('Tarea eliminada'); }
function delSub(i) { d.subjects.splice(i, 1); save(); render(); showToast('Materia eliminada'); }

function saveProfile() {
  d.profile = { name: document.getElementById('name').value, career: document.getElementById('career').value };
  save(); render();
  showToast('Perfil actualizado');
}

// CRONÓMETRO FOCUS
function updateTimerDisplay() {
  let m = Math.floor(sec / 60), s = sec % 60;
  document.getElementById('timer').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function toggleTimer() {
  const btn = document.getElementById('timerBtn');
  if (int) { 
    clearInterval(int); int = null; btn.textContent = '▶ Continuar'; 
  } else {
    btn.textContent = '⏸ Pausar';
    int = setInterval(() => {
      if (--sec <= 0) { 
        clearInterval(int); int = null; 
        showToast('🎉 ¡Sesión completada!');
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() { 
  clearInterval(int); int = null; sec = 1500; 
  updateTimerDisplay(); 
  document.getElementById('timerBtn').textContent = '▶ Comenzar'; 
}

updateTimerDisplay();
render();