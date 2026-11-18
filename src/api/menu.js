
import { request } from './client';

export const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks'];

// MongoDB _id or existing id ko standard id mein convert karta hai.
export const withId = (item) => ({
  ...item,
  id: item._id || item.id,
});

// Manager-only calls.
export const createMenuItem = (item) =>
  request('/menu', {
    method: 'POST',
    body: item,
  });

export const updateMenuItem = (id, changes) =>
  request(`/menu/${id}`, {
    method: 'PUT',
    body: changes,
  });
