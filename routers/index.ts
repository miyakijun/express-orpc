import { os } from '../common/context';
import { healthCheck } from './health';
import { merchantRouter } from './merchant';
import { postsRouter } from './posts';

export const appRouter = os.router({
  posts: postsRouter,
  merchant: merchantRouter,
  health: healthCheck,
});