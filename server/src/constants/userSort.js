export const USER_SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: 1 },
  oldest: { createdAt: 1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: 1 },
});

export const USER_SORT_KEYS = Object.freeze(Object.keys(USER_SORT_OPTIONS));
