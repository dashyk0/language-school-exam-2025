// js/tutors.js
import { getTutors } from './api.js';
import { getLanguageFromCourse } from './utils.js';
import { createOrder } from './api.js';

let allTutors = [];
let filteredTutors = [];
let currentPage = 1;
const PER_PAGE = 5;

const tutorsList = document.getElementById('tutorsList');
const tutorsPagination = document.getElementById('tutorsPagination');
const tutorQualification = document.getElementById('tutorQualification');
const tutorExperience = document.getElementById('tutorExperience');
const tutorSearchBtn = document.getElementById('tutorSearchBtn');

export function filterTutorsByCourse(course) {
  if (!course || allTutors.length === 0) {
    filteredTutors = [...allTutors];
  } else {
    const language = getLanguageFromCourse(course.name).toLowerCase();
    if (language === '') {
      filteredTutors = [...allTutors];
    } else {
      filteredTutors = allTutors.filter(tutor => {
        return tutor.languages_offered && tutor.languages_offered.some(lang => 
          lang.toLowerCase().includes(language)
        );
      });
    }
  }
  currentPage = 1;
  renderTutors();
  renderPagination();
}

export async function loadAndRenderTutors() {
  if (allTutors.length === 0) {
    allTutors = await getTutors();
    filteredTutors = [...allTutors];
  }
  renderTutors();
  renderPagination();
}

function renderTutors() {
  if (!tutorsList) return;

  tutorsList.innerHTML = '';

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageTutors = filteredTutors.slice(start, end);

  if (pageTutors.length === 0) {
    tutorsList.innerHTML = '<div class="text-muted p-3">No tutors found</div>';
    return;
  }

 pageTutors.forEach(tutor => {
    const div = document.createElement('div');
    div.className = 'border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center tutor-item';
    div.style.cursor = 'pointer';

    const languages = tutor.languages_offered ? tutor.languages_offered.join(', ') : '—';

    div.innerHTML = `
      <div>
        <strong>${tutor.name}</strong><br>
        <small class="text-muted">
          Level: ${tutor.language_level || '—'} • 
          Experience: ${tutor.work_experience || 0} лет • 
          Languages: ${languages}
        </small><br>
        <small>Cost: ${tutor.price_per_hour || 0} ₽/hour</small>
      </div>
      <button class="btn btn-primary btn-sm enroll-btn">
        Sign up
      </button>
    `;

    // Клик по карточке — выделение
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('enroll-btn')) return;
      document.querySelectorAll('.tutor-item').forEach(item => item.classList.remove('bg-primary-subtle'));
      div.classList.add('bg-primary-subtle');
      window.selectedTutor = tutor;
    });

    // Клик по кнопке "Записаться"
    div.querySelector('.enroll-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.selectedTutor = tutor;
      
      // очищаем поля формы
      document.getElementById('user-name').value = '';
      document.getElementById('user-email').value = '';
      document.getElementById('tutor-message').value = '';

      const modal = new bootstrap.Modal(document.getElementById('tutorModal'));
      modal.show();
    });

    tutorsList.appendChild(div);
});
}

function renderPagination() {
  if (!tutorsPagination) return;

  const totalPages = Math.ceil(filteredTutors.length / PER_PAGE);
  tutorsPagination.innerHTML = '';

  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  const prev = document.createElement('li');
  prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prev.innerHTML = '<a class="page-link" href="#">Previous</a>';
  prev.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderTutors();
    }
  });
  ul.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderTutors();
    });
    ul.appendChild(li);
  }

  const next = document.createElement('li');
  next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  next.innerHTML = '<a class="page-link" href="#">Next</a>';
  next.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderTutors();
    }
  });
  ul.appendChild(next);

  tutorsPagination.appendChild(ul);
}

function applyFilters() {
  const levelFilter = tutorQualification?.value || '';
  const expMin = tutorExperience?.value ? Number(tutorExperience.value) : 0;

  filteredTutors = allTutors.filter(tutor => {
    let match = true;
    if (levelFilter) {
      match = match && tutor.language_level === levelFilter;
    }
    if (expMin > 0) {
      match = match && tutor.work_experience >= expMin;
    }
    return match;
  });

  currentPage = 1;
  renderTutors();
  renderPagination();
}

// Submit формы репетитора
document.getElementById('tutor-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const userName = document.getElementById('user-name')?.value.trim();
  const email = document.getElementById('user-email')?.value.trim();
  const message = document.getElementById('tutor-message')?.value.trim();

  if (!userName || !email) {
    alert('Заполните имя и email');
    return;
  }

  if (!window.selectedTutor) {
    alert('Репетитор не выбран');
    return;
  }

  // Дата через неделю (как в примере друга)
  const today = new Date('2026-01-07');
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const dateStart = nextWeek.toISOString().split('T')[0];

  const orderData = {
    tutor_id: window.selectedTutor.id,
    date_start: dateStart,
    time_start: '10:00',
    duration: 1,
    persons: 1,
    price: window.selectedTutor.price_per_hour,
    early_registration: false,
    group_enrollment: false,
    intensive_course: false,
    supplementary: false,
    personalized: true,
    excursions: false,
    assessment: false,
    interactive: false
  };

  try {
    const result = await createOrder(orderData);

    if (result.success) {
      alert('Заявка к репетитору успешно отправлена!');
      bootstrap.Modal.getInstance(document.getElementById('tutorModal')).hide();
      document.getElementById('tutor-form').reset();
    } else {
      alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
    }
  } catch (err) {
    alert('Ошибка сети');
    console.error(err);
  }
});

tutorSearchBtn?.addEventListener('click', applyFilters);
tutorQualification?.addEventListener('change', applyFilters);
tutorExperience?.addEventListener('input', applyFilters);