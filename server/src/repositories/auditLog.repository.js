import AuditLog from '../models/auditLog.model.js';

export const create = (data) => AuditLog.create(data);
