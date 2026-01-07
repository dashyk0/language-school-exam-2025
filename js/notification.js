export function showNotification(message, type = 'success') {
    const area = document.getElementById('notification-area');
    if (!area) return;

    // Определяем классы в зависимости от типа
    const alertClass = type === 'success' ? 'alert-success' :
                       type === 'danger'  ? 'alert-danger' :
                       type === 'warning' ? 'alert-warning' : 'alert-info';

    // Создаём элемент уведомления
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show shadow-sm`;
    alert.style.marginBottom = '0.5rem';
    alert.innerHTML = `
        <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    area.appendChild(alert);

    // Автоматическое исчезновение через 4 секунды
    setTimeout(() => {
        if (alert && alert.parentNode) {
            bootstrap.Alert.getOrCreateInstance(alert).close();
        }
    }, 4000);
}