import { ORPCError } from '@orpc/server';

export const traceInterceptor = async ({ context, meta, next }: any) => {
  const start = Date.now();
  const { req, user } = context;
  let result;
  let isError = false;

//   try {
    result = await next();
//   } catch (err) {
//     isError = true;
//     throw err; 
//   } finally {
//     const duration = Date.now() - start;
//     const userId = user?.id || 'guest';
//     const clientIp = req.ip || 'unknown';
 
//     const path = meta.path; 
//     console.log(`[Trace] ${req.method} /api/${path} | User:${userId} | IP:${clientIp} | Time:${duration}ms | Error:${isError}`);
//   }
  return result;
};

export const legacyErrorInterceptor = async ({ context, next }: any) => {
  try {
    return await next();
  } catch (error) {
    const { res } = context;
    if (error instanceof ORPCError && error.code === 'BAD_REQUEST') {
      
      let hint = '';
      if (error.data?.issues && Array.isArray(error.data.issues)) {
        const uniqueFields = new Set(
          error.data.issues.map((issue: any) => issue.path.join('.'))
        );
        hint = [...uniqueFields].join(',');
      }

      const legacyResponse = {
        is_success: false,
        error: {
          code: 'ValidationFailed',
          message: 'Input validation failed: ' + error.message,
          detail: hint, 
        },
      };

      if (!res.headersSent) {
        res.status(400).json(legacyResponse);
      }
      
      return; 
    }

    if (error instanceof ORPCError && (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')) {
      const legacyResponse = {
        is_success: false,
        error: {
          code: 'AuthenticationFailed',
          message: '身份认证失败', 
          detail: '',
        },
      };

      if (!res.headersSent) {
        const status = error.code === 'UNAUTHORIZED' ? 401 : 403;
        res.status(status).json(legacyResponse);
      }
      
      return;
    }
    throw error;
  }
};