import { os } from '@orpc/server';

// 建立一個基礎的 procedure builder
// 如果你未來需要 Context (例如 headers, user)，可以改成 os.$context<{ user: string }>()
export const p = os;