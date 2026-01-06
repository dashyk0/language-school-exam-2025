// js/api.js

const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
const API_KEY = '2d451ee9-0077-47ae-9708-61c16e452353';

export async function getCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
    return [];
  }
}

export async function getTutors() {
  try {
    const response = await fetch(`${API_BASE_URL}/tutors?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки репетиторов:', error);
    return [];
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Ошибка отправки заявки:', error);
    return { success: false, error };
  }
}