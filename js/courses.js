import { getCourses } from './api.js';

let allCourses = [];
let currentPage = 1;
const perPage = 5;

const tableBody = document.getElementById('coursesTableBody');
const pagination = document.getElementById('coursesPagination');
const searchInput = document.getElementById('courseSearch');

export async function loadAndRenderCourses() {
  if (allCourses.length === 0) {
    allCourses = await getCourses();
  }
  renderTable(allCourses);
  renderPagination(allCourses.length);
}

function renderTable(courses) {
  tableBody.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageCourses = courses.slice(start, end);

  pageCourses.forEach(course => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${course.name || '—'}</td>
      <td>${course.level || '—'}</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / perPage);
  pagination.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  // Previous
  const prev = document.createElement('li');
  prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prev.innerHTML = `<a class="page-link" href="#">Previous</a>`;
  prev.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      loadAndRenderCourses();
    }
  });
  ul.appendChild(prev);

  // Страницы
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      loadAndRenderCourses();
    });
    ul.appendChild(li);
  }


  const next = document.createElement('li');
  next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  next.innerHTML = `<a class="page-link" href="#">Next</a>`;
  next.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      loadAndRenderCourses();
    }
  });
  ul.appendChild(next);

  pagination.appendChild(ul);
}

// Поиск
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allCourses.filter(c => 
      (c.name || '').toLowerCase().includes(query) ||
      (c.level || '').toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable(filtered);
    renderPagination(filtered.length);
  });
}

