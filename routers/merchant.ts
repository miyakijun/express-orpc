import { os } from '../common/context';
import Merchant from '../services/merchant';
const getAll = os
  .route({
    method: 'GET',
    path: '/merchant/all', // 明確定義路徑
    summary: '取得所有商戶',
    tags: ['Merchant'],
  })
  .handler(async ({ context: ctx }) => {
    const result = await Merchant.all(ctx.user);
    return result;
  });

export const merchantRouter = os.router({
  all: getAll, 
});