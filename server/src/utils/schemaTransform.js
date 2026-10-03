export const createJsonTransform =
  (secretFields = []) =>
  (_doc, ret) => {
    if (ret._id !== undefined) {
      ret.id = ret._id;
      delete ret._id;
    }
    delete ret.__v;
    secretFields.forEach((field) => delete ret[field]);
    return ret;
  };

export const buildSchemaOptions = (secretFields = []) => ({
  timestamps: true,
  toJSON: { virtuals: true, transform: createJsonTransform(secretFields) },
  toObject: { virtuals: true, transform: createJsonTransform(secretFields) },
});
