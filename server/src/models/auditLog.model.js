import mongoose from 'mongoose';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor is required'],
      immutable: true,
    },
    action: { type: String, required: [true, 'Action is required'], trim: true, immutable: true },
    entity: { type: String, required: [true, 'Entity is required'], trim: true, immutable: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, immutable: true },
    meta: { type: mongoose.Schema.Types.Mixed, immutable: true },
    ip: { type: String, trim: true, immutable: true },
  },
  { ...buildSchemaOptions(), timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
