import { logger } from '../config/logger.js';
import * as auditLogRepository from '../repositories/auditLog.repository.js';

export const record = async ({ actorId, action, entity, entityId, meta, ip }) => {
  try {
    await auditLogRepository.create({ actor: actorId, action, entity, entityId, meta, ip });
  } catch (error) {
    logger.error('Audit log write failed', { action, entity, error: error.message });
  }
};
