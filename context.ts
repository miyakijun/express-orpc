import type { Request, Response, NextFunction } from 'express';
// 假設你有定義 User 的型別，沒有的話先用 any
// import { User } from './types'; 

// 1. 定義 Context 的形狀
export type MyContext = {
  req: Request;
  res: Response;
  next: NextFunction; // 👈 關鍵：這裡要宣告 Context 裡有 next
  user?: any;         // 這裡放解析出來的 User
};

// 類似原本的 parseReqIpMiddleware
const checkIp = (req: Request) => {
  const ip = req.ip;
  // 假設 isBlocked 是你的工具函式
  // if (isBlocked(ip)) throw new Error('IP Blocked');
};

// 類似原本的 parseCookieMiddleware
const parseUser = async (req: Request) => {
  // 注意：如果你原本用 signedCookies，這裡也要用 signedCookies
  const token = req.signedCookies ? req.signedCookies['token'] : req.cookies['token'];
  
  if (!token) return undefined;
  
  // ... 這裡放原本的驗證邏輯 ...
  // return extractPerson(token);
  return { id: 1, role: 'admin' }; // 假資料
};

// 2. 更新 createContext 的參數定義
// 這裡必須宣告它接受 { req, res, next }
export const createContext = async ({ 
  req, 
  res, 
  next 
}: { 
  req: Request; 
  res: Response; 
  next: NextFunction; // 👈 這裡也要加
}): Promise<MyContext> => {
  
  // 1. 先跑 IP 檢查
  checkIp(req); 

  // 2. 再跑 User 解析
  const user = await parseUser(req);

  // 3. 打包回傳，這裡要把 next 也放進去
  return { 
    req, 
    res, 
    next, // 👈 這裡要把接到的 next 傳出去
    user 
  };
};