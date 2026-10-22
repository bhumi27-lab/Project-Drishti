import { seed } from './seed'

/** The one in-memory database. Shared by the store (request/response) and the emitter (live). */
export const db = seed(Date.now())
