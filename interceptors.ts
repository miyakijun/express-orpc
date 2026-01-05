import { ORPCError } from '@orpc/server';

/**
 * 🕵️‍♂️ Trace Interceptor (取代原本的 traceMiddleware)
 * 負責紀錄請求時間、路徑、以及是誰發出的請求
 */
export const traceInterceptor = async ({ context, meta, next }: any) => {
  // 1. 紀錄開始時間
  const start = Date.now();
  const { req, user } = context;

  // 2. 執行真正的業務邏輯 (Zod 驗證 -> Procedure Handler)
  // 如果中間有噴錯，這裡會直接跳出去，所以通常把 Log 放在 try-finally 或讓 error interceptor 處理
  // 但為了簡單起見，我們假設 legacyErrorInterceptor 會接住錯誤並正常回傳
  let result;
  let isError = false;

  try {
    result = await next();
  } catch (err) {
    isError = true;
    throw err; // 往外丟給 legacyErrorInterceptor 處理
  } finally {
    // 3. 請求結束 (不管成功失敗都會執行)
    const duration = Date.now() - start;
    
    // 模擬原本的 Log 格式
    // 原本：traceMiddleware(Trace.save, SYMBOL_BO_PERSON)
    const userId = user?.id || 'guest';
    const clientIp = req.ip || 'unknown';
    const path = meta.path.join('/'); // oRPC 的 path 是陣列，例如 ['posts', 'create']

    // 這裡可以換成你原本的 Logger (例如 Log.info 或 Trace.save)
    console.log(`[Trace] ${req.method} /api/${path} | User:${userId} | IP:${clientIp} | Time:${duration}ms | Error:${isError}`);
    
    // 如果你有 DB 紀錄需求：
    // await Trace.save({ userId, path, duration, ip: clientIp });
  }

  return result;
};

/**
 * 🚑 Legacy Error Interceptor (取代原本的 openApiErrorHandler)
 * 負責把 Zod/oRPC 的錯誤，整容成舊系統前端看不出來的樣子
 */
export const legacyErrorInterceptor = async ({ context, next }: any) => {
  try {
    return await next();
  } catch (error) {
    const { res } = context;

    // -----------------------------------------------------------
    // 情況 A：處理 Zod 驗證錯誤 (Bad Request)
    // 對應原本: OpenApiValidator 噴出的錯誤
    // -----------------------------------------------------------
    if (error instanceof ORPCError && error.code === 'BAD_REQUEST') {
      
      // 1. 組合錯誤欄位提示 (Hint)
      let hint = '';
      if (error.data?.issues && Array.isArray(error.data.issues)) {
        // Zod 的 issue.path 是 ['body', 'email'] 這種陣列，轉成 "body.email"
        const uniqueFields = new Set(
          error.data.issues.map((issue: any) => issue.path.join('.'))
        );
        hint = [...uniqueFields].join(',');
      }

      // 2. 組裝舊版 JSON 格式
      const legacyResponse = {
        is_success: false,
        error: {
          code: 'ValidationFailed', // 前端可能認這個字串
          message: 'Input validation failed: ' + error.message,
          detail: hint, // 告訴前端錯在哪個欄位
        },
      };

      // 3. 直接送出回應 (Bypass oRPC)
      if (!res.headersSent) {
        res.status(400).json(legacyResponse);
      }
      
      return; // 攔截成功，不再往外拋錯
    }

    // -----------------------------------------------------------
    // 情況 B：處理權限錯誤 (Unauthorized)
    // 對應原本: parseCookieMiddleware 或 guard 噴出的錯誤
    // -----------------------------------------------------------
    if (error instanceof ORPCError && (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')) {
      const legacyResponse = {
        is_success: false,
        error: {
          code: 'AuthenticationFailed', // 前端可能認這個字串
          message: '身份认证失败', // 維持原本的錯誤訊息習慣
          detail: '',
        },
      };

      if (!res.headersSent) {
        // 401: 未登入, 403: 沒權限
        const status = error.code === 'UNAUTHORIZED' ? 401 : 403;
        res.status(status).json(legacyResponse);
      }
      
      return;
    }

    // -----------------------------------------------------------
    // 情況 C：其他的系統錯誤 (500)
    // -----------------------------------------------------------
    // 這些錯誤我們不攔截，直接 throw 出去
    // 讓 main.ts 最外層的 app.use((err, req, res, next) => ...) 去處理
    // 這樣可以確保你在 Server Console 看到完整的 Error Stack Trace
    throw error;
  }
};