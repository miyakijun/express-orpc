// import { os } from '@orpc/server';

// // 建立一個基礎的 procedure builder
// // 如果你未來需要 Context (例如 headers, user)，可以改成 os.$context<{ user: string }>()
// export const p = os;



// src/orpc.ts
import { os } from '@orpc/server';

// 定義你的 Context 形狀
export type MyContext = {
  user?: any; // 對應原本的 req[SYMBOL_BO_PERSON]
  config?: any; // 對應原本傳入的 config
};

// 建立帶有 Context 支援的 builder
export const p = os.$context<MyContext>();
