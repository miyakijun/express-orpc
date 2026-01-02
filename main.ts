import express from 'express';
import cors from 'cors';
// import { RPCHandler } from '@orpc/server/node'; // ✅ 改用這個

import { OpenAPIHandler } from '@orpc/openapi/fetch' // or '@orpc/server/node'

import { appRouter } from './routers'; // 引入剛剛打包好的 Router
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const handler = new OpenAPIHandler(appRouter, {
  // interceptors: [
  //   onError((error) => {
  //     console.error(error)
  //   }),
  // ],
})
const router = express.Router()

  
app.use(router)
const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  console.log(`📄 Swagger UI available at http://localhost:${port}/docs`);
});