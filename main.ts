import express from "express";
import cors from "cors";
import { OpenAPIHandler } from "@orpc/openapi/node"; // or '@orpc/server/node'
import { appRouter } from "./routers"; // 引入剛剛打包好的 Router
import { onError } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { ZodError } from "zod";
import { orpcMiddleware } from './middleware';
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//parseCookieMiddleware
const legacyErrorInterceptor = async ({ input, context, meta, next }: any) => {
  try {
    return await next();
  } catch (error) {
    const { res } = context; // 從 Context 拿到 Express Response
    // 🕵️‍♂️ 情況一：處理 Zod 驗證錯誤 (原本吐一大串 data.issues 的那個)
    if (error instanceof ORPCError && error.code === "BAD_REQUEST") {
      console.log('!!!!!', error.code,JSON.stringify(error.data,null,2));
      // 1. 模仿舊邏輯：提取錯誤欄位 (hint)
      // error.data?.issues 是 Zod 的原始錯誤陣列
      let hint = "";
      // 1. 檢查 data.issues 是否存在
      if (error.data?.issues && Array.isArray(error.data.issues)) {
        // 2. 取出 path (注意 Zod 的 path 是陣列，要 join 起來變字串)
        const uniqueFields = new Set(
          error.data.issues.map((issue: any) => issue.path.join("."))
        );

        // 3. 組合結果，例如 "content,title"
        hint = [...uniqueFields].join(",");
      }

      // 2. 組裝舊版錯誤格式 (ValidationFailedError 的形狀)
      const legacyResponse = {
        is_success: false,
        error: {
          code: "ValidationFailed", // 對應你原本 switch case 的名稱
          message: "Input validation failed " + error.message, // 或 error.message
          detail: hint, // 這裡放欄位名稱
        },
      };

      // 3. 🔥 直接用 Express res 送出回應，並結束 Request
      // 這樣 oRPC 就不會再吐它預設的 JSON 了
      if (!res.headersSent) {
        res.status(400).send(legacyResponse);
      }

      // 回傳 undefined 告訴 oRPC 我們處理完了 (雖然 res 已經送出)
      return;
    }

    // 🕵️‍♂️ 情況二：處理權限錯誤 (401 Unauthorized)
    if (error instanceof ORPCError && error.code === "UNAUTHORIZED") {
      const legacyResponse = {
        is_success: false,
        error: {
          code: "AuthenticationFailed",
          message: "身份认证失败",
          detail: "",
        },
      };
      if (!res.headersSent) {
        res.status(401).send(legacyResponse);
      }
      return;
    }

    // 其他錯誤繼續往外丟，或許交給 Express 的 globalErrorHandler
    throw error;
  }
};
const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    legacyErrorInterceptor, // 👈 掛上去，讓它先攔截錯誤
  ],
});


app.use(orpcMiddleware);

app.use(async (req, res, next) => {
  const config = { someConfig: "value" };
  const user = { id: 1, role: "admin" };
  const result = await handler.handle(req, res, {
    // prefix: '/api',
    context: {
      user,
      config,
      req,
      res,
      next,
    },
  });

  if (result.matched) return;
  next();
});

const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  console.log(`📄 Swagger UI available at http://localhost:${port}/docs`);
});
