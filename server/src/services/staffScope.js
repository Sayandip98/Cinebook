import { ROLES } from '../constants/roles.js';
import * as theaterRepository from '../repositories/theater.repository.js';

// null = admin (no restriction). Otherwise the ids of the theaters this manager runs.
export const getTheaterScope = async (actor) =>
  actor.role === ROLES.ADMIN ? null : theaterRepository.findIdsByManager(actor._id);
