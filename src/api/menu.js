import { request } from './client';

export const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks'];

// MongoDB sends "_id". The rest of the app (cart, cards) uses "id", so we add it here.
export const withId = (item) => ({ ...item, id: item._id });

// Manager-only calls. The token is added automatically by request().
export const createMenuItem = (item) => request('/menu', { method: 'POST', body: item });
export const updateMenuItem = (id, changes) => request(`/menu/${id}`, { method: 'PUT', body: changes });
