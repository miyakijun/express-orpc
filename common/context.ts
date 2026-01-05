import type { Request, Response, NextFunction } from 'express';
import { os as baseOS } from '@orpc/server';

// 1. 定義 Context 的形狀
export type MyContext = {
  req: Request;
  res: Response;
  next: NextFunction; 
  user?: any;         
};

export const os = baseOS.$context<MyContext>();
// export const p = os; // p 只是 os 的別名，方便寫 .route()

// 類似原本的 parseReqIpMiddleware
const checkIp = (req: Request) => {
  const ip = req.ip;
  // 假設 isBlocked 是你的工具函式
  // if (isBlocked(ip)) throw new Error('IP Blocked');
};

// 類似原本的 parseCookieMiddleware
const parseUser = async (req: Request) => {
  // const token = req.signedCookies ? req.signedCookies['token'] : req.cookies['token'];
  // if (!token) return undefined;
  return { id: 1, role: 'admin' }; // 假資料
};

export const createContext = async ({ 
  req, 
  res, 
  next 
}: { 
  req: Request; 
  res: Response; 
  next: NextFunction; 
}): Promise<MyContext> => {
  checkIp(req); 
  const user = await parseUser(req);
  return { 
    req, 
    res, 
    next, 
    user 
  };
};
