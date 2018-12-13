import { post, get } from './request';

export const updateAvailability = (availableStartTime, availableEndTime, nanny) => {
  return post('/api/availability', { availableStartTime, availableEndTime, nanny });
};

export const getAvailability = id => {
  return get(`/api/availability/${id}`);
};
