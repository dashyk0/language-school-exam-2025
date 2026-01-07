const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
const API_KEY = '2d451ee9-0077-47ae-9708-61c16e452353';

export async function getCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    return [];
  }
}

export async function getTutors() {
  try {
    const response = await fetch(`${API_BASE_URL}/tutors?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки репетиторов:', error);
    return [];
  }
}

export async function getCourse(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки курса:', error);
    return null;
  }
}

export async function getTutor(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tutors/${id}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки репетитора:', error);
    return null;
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?api_key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    return { success: false, error: error.message };
  }
}
export async function getOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    return { success: false, error: error.message };
  }
}
export async function updateOrder(id, orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}?api_key=${API_KEY}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Ошибка обновления заказа:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrder(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}?api_key=${API_KEY}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { success: true };
  } catch (error) {
    console.error('Ошибка удаления:', error);
    return { success: false, error: error.message };
  }
}
