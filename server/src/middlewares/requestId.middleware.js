import { randomUUID } from 'node:crypto';

export const requestId = (req, res, next) => {
  const incoming = req.get('X-Request-Id');
  req.id = incoming && incoming.length <= 64 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
