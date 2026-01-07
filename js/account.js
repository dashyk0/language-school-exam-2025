import { getOrders, getCourse, getTutor, deleteOrder, updateOrder } from './api.js';
import { Calculator } from './calculator.js';
import { showNotification } from './notification.js';

let allOrders = [];
let currentPage = 1;
const ORDERS_PER_PAGE = 5;

const tbody = document.getElementById('ordersTableBody');
const paginationUl = document.getElementById('ordersPagination');
let courseCache = {};
let tutorCache = {};
let currentOrder = null; // для модалок Details, Edit, Delete

document.addEventListener('DOMContentLoaded', loadOrders);

async function loadOrders() {
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

  const result = await getOrders();
  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Error loading orders</td></tr>';
    return;
  }

  allOrders = result.data || [];
  renderCurrentPage();
  renderPagination();
}

async function renderCurrentPage() {
  if (!tbody) return;

  const start = (currentPage - 1) * ORDERS_PER_PAGE;
  const end = start + ORDERS_PER_PAGE;
  const pageOrders = allOrders.slice(start, end);

  if (pageOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No orders yet</td></tr>';
    return;
  }

  let html = '';
  for (const order of pageOrders) {
    let name = 'Loading...';

    if (order.course_id) {
      if (!courseCache[order.course_id]) {
        const course = await getCourse(order.course_id);
        if (course) courseCache[order.course_id] = course.name;
      }
      name = courseCache[order.course_id] || 'Course';
    } else if (order.tutor_id) {
      if (!tutorCache[order.tutor_id]) {
        const tutor = await getTutor(order.tutor_id);
        if (tutor) tutorCache[order.tutor_id] = tutor.name;
      }
      name = tutorCache[order.tutor_id] || 'Tutor';
    }

    html += `
      <tr>
        <td>${order.id}</td>
        <td>${name}</td>
        <td>${order.date_start || '—'} ${order.time_start || ''}</td>
        <td>${order.price || 0} ₽</td>
        <td>
          <button class="btn btn-info btn-sm me-1 details-btn" data-id="${order.id}">Details</button>
          <button class="btn btn-warning btn-sm me-1 edit-btn" data-id="${order.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${order.id}">Delete</button>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = html;

  // Обработчики кнопок действий
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => showDetails(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
  });
}

async function showDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  let name = 'Unknown';
  if (order.course_id && courseCache[order.course_id]) name = courseCache[order.course_id];
  if (order.tutor_id && tutorCache[order.tutor_id]) name = tutorCache[order.tutor_id];

  document.getElementById('details-id').textContent = order.id;
  document.getElementById('details-name').textContent = name;
  document.getElementById('details-date').textContent = order.date_start || '—';
  document.getElementById('details-time').textContent = order.time_start || '—';
  document.getElementById('details-persons').textContent = order.persons || 1;
  document.getElementById('details-price').textContent = order.price || 0;

  const badgesContainer = document.getElementById('details-badges');
  badgesContainer.innerHTML = '<span class="text-muted">No automatic discounts/surcharges</span>';

  if (order.course_id) {
    const course = await getCourse(order.course_id);
    if (course) {
      const formData = {
        date_start: order.date_start,
        time_start: order.time_start,
        students_count: order.persons || 1,
        supplementary: order.supplementary || false,
        personalized: order.personalized || false,
        excursions: order.excursions || false,
        assessment: order.assessment || false,
        interactive: order.interactive || false
      };
      const calc = Calculator.calculateTotalCost(course, formData);

      let badges = '';
      if (calc.earlyRegistration) badges += '<span class="badge bg-success me-2">Early registration -10%</span>';
      if (calc.groupEnrollment) badges += '<span class="badge bg-success me-2">Group -15%</span>';
      if (calc.intensiveCourse) badges += '<span class="badge bg-warning me-2">Intensive +20%</span>';
      if (badges) badgesContainer.innerHTML = badges;
    }
  }

  const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
  modal.show();
}

async function openEditModal(orderId) {
  currentOrder = allOrders.find(o => o.id === orderId);
  if (!currentOrder || !currentOrder.course_id) {
    alert('Editing is only available for course orders');
    return;
  }

  const course = await getCourse(currentOrder.course_id);
  if (!course) {
    alert('Course not found');
    return;
  }

  // Заполнение полей
  document.getElementById('edit-order-id').value = currentOrder.id;
  document.getElementById('edit-course-id').value = currentOrder.course_id;
  document.getElementById('edit-course-name').value = course.name;
  document.getElementById('edit-teacher-name').value = course.teacher || 'Not specified';
  document.getElementById('edit-duration').value = `${course.total_length} weeks`;

  const dateSelect = document.getElementById('edit-start-date');
  const timeSelect = document.getElementById('edit-start-time');
  dateSelect.innerHTML = '<option value="">Select date</option>';
  timeSelect.innerHTML = '<option value="">Select time</option>';
  timeSelect.disabled = true;

  // Уникальные даты
  const uniqueDates = new Set();
  course.start_dates.forEach(fullDateTime => {
    if (fullDateTime && fullDateTime.includes('T')) {
      const datePart = fullDateTime.split('T')[0];
      uniqueDates.add(datePart);
    }
  });

  [...uniqueDates].sort().forEach(date => {
    const displayDate = new Date(date).toLocaleDateString('en-GB');
    const option = document.createElement('option');
    option.value = date;
    option.textContent = displayDate;
    dateSelect.appendChild(option);
  });

  // Текущее значение
  if (currentOrder.date_start) {
    dateSelect.value = currentOrder.date_start;
  }
  document.getElementById('edit-students').value = currentOrder.persons || 1;

  // Опции
  document.getElementById('edit-opt-supplementary').checked = currentOrder.supplementary || false;
  document.getElementById('edit-opt-personalized').checked = currentOrder.personalized || false;
  document.getElementById('edit-opt-excursions').checked = currentOrder.excursions || false;
  document.getElementById('edit-opt-assessment').checked = currentOrder.assessment || false;
  document.getElementById('edit-opt-interactive').checked = currentOrder.interactive || false;

  document.getElementById('edit-total-cost').textContent = '0';
  document.getElementById('edit-auto-options').innerHTML = '<small class="text-muted">Select date and time to calculate</small>';

  // Обработчик выбора даты → заполнение времён
  dateSelect.addEventListener('change', () => {
    const selectedDate = dateSelect.value;
    timeSelect.innerHTML = '<option value="">Select time</option>';
    timeSelect.disabled = !selectedDate;

    if (selectedDate) {
      const timesForDate = [];
      course.start_dates.forEach(fullDateTime => {
        if (fullDateTime.startsWith(selectedDate + 'T')) {
          const timePart = fullDateTime.split('T')[1].slice(0, 5);
          if (!timesForDate.includes(timePart)) {
            timesForDate.push(timePart);
          }
        }
      });

      timesForDate.sort().forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
      });

      if (currentOrder.date_start === selectedDate && currentOrder.time_start) {
        timeSelect.value = currentOrder.time_start;
      }
    }

    calculateEditCost(course);
  });

  // Автоматический пересчёт
  timeSelect.addEventListener('change', () => calculateEditCost(course));
  document.getElementById('edit-students').addEventListener('input', () => calculateEditCost(course));
  document.querySelectorAll('#edit-order-form .form-check-input').forEach(cb => {
    cb.addEventListener('change', () => calculateEditCost(course));
  });

  // Если дата уже выбрана — запускаем заполнение времён и расчёт
  if (dateSelect.value) {
    dateSelect.dispatchEvent(new Event('change'));
  }

  const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
  modal.show();
}

function calculateEditCost(course) {
  const date = document.getElementById('edit-start-date').value;
  const time = document.getElementById('edit-start-time').value;
  const students = Number(document.getElementById('edit-students').value) || 1;

  if (!date || !time) {
    document.getElementById('edit-total-cost').textContent = '0';
    document.getElementById('edit-auto-options').innerHTML = '<small class="text-muted">Select date and time</small>';
    return;
  }

  const formData = {
    date_start: date,
    time_start: time,
    students_count: students,
    supplementary: document.getElementById('edit-opt-supplementary').checked,
    personalized: document.getElementById('edit-opt-personalized').checked,
    excursions: document.getElementById('edit-opt-excursions').checked,
    assessment: document.getElementById('edit-opt-assessment').checked,
    interactive: document.getElementById('edit-opt-interactive').checked
  };

  const result = Calculator.calculateTotalCost(course, formData);

  document.getElementById('edit-total-cost').textContent = result.totalCost;

  let badges = '';
  if (result.earlyRegistration) badges += '<span class="badge bg-success me-2">Early registration -10%</span>';
  if (result.groupEnrollment) badges += '<span class="badge bg-success me-2">Group -15%</span>';
  if (result.intensiveCourse) badges += '<span class="badge bg-warning me-2">Intensive +20%</span>';

  document.getElementById('edit-auto-options').innerHTML = badges || '<small class="text-muted">No automatic discounts/surcharges</small>';
}

function openDeleteModal(orderId) {
  currentOrder = allOrders.find(o => o.id === orderId);
  if (!currentOrder) return;

  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

// Удаление
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!currentOrder) return;

    const result = await deleteOrder(currentOrder.id);

    if (result.success) {
        showNotification('Order deleted successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        await loadOrders();
    } else {
        showNotification('Error deleting order: ' + (result.error || 'Unknown error'), 'danger');
    }
});

// Сохранение изменений (только разрешённые поля!)
document.getElementById('save-order-btn').addEventListener('click', async () => {
    const orderId = document.getElementById('edit-order-id').value;
    const date = document.getElementById('edit-start-date').value;
    const time = document.getElementById('edit-start-time').value;
    const persons = Number(document.getElementById('edit-students').value);

    if (!date || !time || persons < 1 || persons > 20) {
        showNotification('Please fill in all required fields correctly', 'danger');
        return;
    }

    const courseId = document.getElementById('edit-course-id').value;
    const course = await getCourse(courseId);
    if (!course) {
        showNotification('Course not found', 'danger');
        return;
    }

    const formData = {
        date_start: date,
        time_start: time,
        students_count: persons,
        supplementary: document.getElementById('edit-opt-supplementary').checked,
        personalized: document.getElementById('edit-opt-personalized').checked,
        excursions: document.getElementById('edit-opt-excursions').checked,
        assessment: document.getElementById('edit-opt-assessment').checked,
        interactive: document.getElementById('edit-opt-interactive').checked
    };

    const calc = Calculator.calculateTotalCost(course, formData);

    const updatedData = {
        date_start: date,
        time_start: time,
        persons: persons,
        price: calc.totalCost
    };

    const result = await updateOrder(orderId, updatedData);

    if (result.success) {
        showNotification('Changes successfully saved!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editOrderModal')).hide();
        await loadOrders();
    } else {
        showNotification('Error saving changes: ' + (result.error || 'Unknown error'), 'danger');
    }
});

// Пагинация с стрелками
function renderPagination() {
  if (!paginationUl) return;
  paginationUl.innerHTML = '';

  const totalPages = Math.ceil(allOrders.length / ORDERS_PER_PAGE);
  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
  prevLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
      renderPagination();
    }
  });
  ul.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      renderCurrentPage();
      renderPagination();
    });
    ul.appendChild(li);
  }

  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
  nextLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
      renderPagination();
    }
  });
  ul.appendChild(nextLi);

  paginationUl.appendChild(ul);
}