import { getOrders, getCourse, deleteOrder } from './api.js';
import { showNotification } from './main.js';

let allOrders = [];
let currentPage = 1;
const ORDERS_PER_PAGE = 5;

const tbody = document.getElementById('ordersTableBody');
const paginationUl = document.getElementById('ordersPagination').querySelector('ul');
let courseCache = {}; // Кэш: course_id → course_name

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadOrders);

export async function loadOrders() {
    // Показываем спиннер
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading your orders...</span>
                </div>
            </td>
        </tr>
    `;

    const result = await getOrders();
    if (!result.success) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${result.error}</td></tr>`;
        paginationUl.innerHTML = '';
        return;
    }

    allOrders = result.data;

    if (allOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No orders yet</td></tr>`;
        paginationUl.innerHTML = '';
        return;
    }

    renderCurrentPage();
    renderPagination();
}

async function renderCurrentPage() {
    tbody.innerHTML = '';

    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    const end = start + ORDERS_PER_PAGE;
    const pageOrders = allOrders.slice(start, end);

    for (const order of pageOrders) {
        // Получаем название курса с кэшем
        let courseName = courseCache[order.course_id] || 'Loading...';
        if (!courseCache[order.course_id]) {
            const courseResult = await getCourse(order.course_id);
            if (courseResult.success) {
                courseName = courseResult.data.name;
                courseCache[order.course_id] = courseName;
            } else {
                courseName = 'Unknown course';
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${courseName}</td>
            <td>
                ${order.date_start}<br>
                <small class="text-muted">${order.time_start}</small>
            </td>
            <td><strong>${order.price} rub</strong></td>
            <td>
                <button class="btn btn-sm btn-outline-info me-2 details-btn" data-id="${order.id}">Details</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${order.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    // Обработчики кнопок
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = allOrders.find(o => o.id == btn.dataset.id);
            if (order) {
                // Красиво форматируем JSON
                const details = Object.entries(order)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                alert('Order Details:\n\n' + details);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderId = btn.dataset.id;
            const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
            document.getElementById('confirmDeleteBtn').onclick = () => deleteConfirmed(orderId, modal);
            modal.show();
        });
    });
}

async function deleteConfirmed(orderId, modal) {
    const result = await deleteOrder(orderId);
    if (result.success) {
        showNotification('Order successfully deleted!', 'success');
        modal.hide();
        loadOrders(); // Перезагружаем список
    } else {
        showNotification('Error deleting order: ' + result.error, 'danger');
        modal.hide();
    }
}

function renderPagination() {
    paginationUl.innerHTML = '';

    const totalPages = Math.ceil(allOrders.length / ORDERS_PER_PAGE);
    if (totalPages <= 1) return;

    // Кнопка « (предыдущая)
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            renderPagination();
        }
    });
    paginationUl.appendChild(prevLi);

    // Номера страниц
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
        paginationUl.appendChild(li);
    }

    // Кнопка » (следующая)
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            renderPagination();
        }
    });
    paginationUl.appendChild(nextLi);
}