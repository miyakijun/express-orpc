import type { Request, Response, NextFunction } from 'express';
import { Token } from './utils/token'; // 假設你的 Token 工具路徑
import { extractPerson } from './utils/auth'; // 假設你的驗證工具
import { BO_COOKIE_KEY } from './constants';

export type MyContext = {
  user?: { id: number; role: string }; // 定義你的 User Type
  req: Request;
  res: Response;
  // next: NextFunction; // 其實在 Context 裡通常用不到 next，但你想留著也可以
};

// 傳入的參數通常只有 req, res，有些 adapter 會給 next
export const createContext = async ({ req, res, next }: { req: Request; res: Response, next: NextFunction }): Promise<MyContext> => {
  let user = undefined;

  // --- 原本 parseCookieMiddleware 的邏輯開始 ---
  
  const token = req.signedCookies && req.signedCookies[BO_COOKIE_KEY];

  // 1. 如果有 Token 才開始驗證
  if (token) {
    // 假設 config 需要從某個 global 或 env 拿 (因為這裡很難傳入 config)
    const signKey = process.env.BACKOFFICE_TOKEN_SIGN_KEY; 
    
    const person = extractPerson(token, signKey);

    if (!person) {
      // 驗證失敗：清空 Cookie (Side Effect 是允許的)
      res.cookie(BO_COOKIE_KEY, '', { expire: new Date(0) });
    } else {
      // 查 Redis
      const redisToken = await Token.get(person.id);
      
      // 檢查 Redis Token 是否吻合
      if (redisToken && redisToken === token) {
        // ✅ 驗證成功！
        // 這裡有副作用：更新 Redis 時間
        await Token.set(person.id, token);
        
        // 設定 user 變數
        user = person;
      }
    }
  }
  // --- 邏輯結束 ---

  // 如果你也想順便塞回 req 讓其他 legacy middleware 用，可以在這裡偷偷做 (Optional)
  // (req as any)['SYMBOL_BO_PERSON'] = user;

  return {
    user, // 這裡回傳的 user 可能是 undefined (沒登入) 或 person 物件
    req,
    res,
    next
  };
};