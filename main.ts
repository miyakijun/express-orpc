import express from "express";
import cors from "cors";
import { OpenAPIHandler } from "@orpc/openapi/node"; // or '@orpc/server/node'
import { appRouter } from "./routers"; // 引入剛剛打包好的 Router
import { onError } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { ZodError } from "zod";
import { orpcMiddleware } from './middleware';
const app = express();
app.enable('trust proxy'); // 讓 req.ip 在反向代理下也能抓到正確 IP
// app.use(helmet());         // 安全性 Header
app.use(cors({             // CORS 設定 (若有特殊邏輯可搬過來)
  origin: true,
  credentials: true
}));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//parseCookieMiddleware
/* const legacyErrorInterceptor = async ({ input, context, meta, next }: any) => {
  try {
    return await next();
  } catch (error) {
    const { res } = context; 
    if (error instanceof ORPCError && error.code === "BAD_REQUEST") {
      console.log('!!!!!', error.code,JSON.stringify(error.data,null,2));
      let hint = "";
      if (error.data?.issues && Array.isArray(error.data.issues)) {
        const uniqueFields = new Set(
          error.data.issues.map((issue: any) => issue.path.join("."))
        );
        hint = [...uniqueFields].join(",");
      }
      const legacyResponse = {
        is_success: false,
        error: {
          code: "ValidationFailed", // 對應你原本 switch case 的名稱
          message: "Input validation failed " + error.message, // 或 error.message
          detail: hint, // 這裡放欄位名稱
        },
      };
      if (!res.headersSent) {
        res.status(400).send(legacyResponse);
      }
      return;
    }
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
    throw error;
  }
};
const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    legacyErrorInterceptor, 
  ],
}); */
app.use(orpcMiddleware);
/* app.use(async (req, res, next) => {
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
}); */

const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  console.log(`📄 Swagger UI available at http://localhost:${port}/docs`);
});
