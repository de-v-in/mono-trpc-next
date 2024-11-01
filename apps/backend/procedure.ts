import { authChecker } from './middlewares/user';
import { procedure } from './trpc';

/**
 * Public procedure
 */
export const publicProcedure = procedure;

/**
 * Protected base procedure
 */
export const privateProcedure = procedure.use(authChecker);
