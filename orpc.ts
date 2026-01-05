import type { Request, Response, NextFunction } from 'express';

// 假設你的 Symbol 是從某個 constants 引入的
import { SYMBOL_BO_PERSON } from './constants'; 

export type MyContext = {
  user?: { id: number; name: string }; // 定義你想要的 User 形狀
  req: Request;
  res: Response;
};

export const createContext = async ({ req, res }: { req: Request; res: Response }): Promise<MyContext> => {
  // 🎯 關鍵在這裡！
  // 我們假設 parseCookieMiddleware 已經跑過了
  // 所以 req[SYMBOL_BO_PERSON] 裡面應該要有東西 (如果登入的話)
  const user = (req as any)[SYMBOL_BO_PERSON];

  // 回傳給 oRPC 使用
  return {
    user, 
    req,
    res,
  };
};