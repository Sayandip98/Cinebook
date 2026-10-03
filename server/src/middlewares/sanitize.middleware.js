const isUnsafeKey = (key) => key.startsWith('$') || key.includes('.');

const stripUnsafeKeys = (value) => {
  if (Array.isArray(value)) {
    value.forEach(stripUnsafeKeys);
    return;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (isUnsafeKey(key)) {
        delete value[key];
      } else {
        stripUnsafeKeys(value[key]);
      }
    }
  }
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body) stripUnsafeKeys(req.body);
  if (req.params) stripUnsafeKeys(req.params);
  next();
};
