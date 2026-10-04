import { escapeRegex } from './escapeRegex.js';

export const exactMatchInsensitive = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

export const containsInsensitive = (value) => new RegExp(escapeRegex(value), 'i');
