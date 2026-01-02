import express from 'express';
import cors from 'cors';
import { OpenAPIHandler } from '@orpc/openapi/node' // or '@orpc/server/node'
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
// const router = express.Router()

  
// app.use(router)

app.use(async (req, res, next) => {
  // 這裡是你原本 config 的來源，或是從 process.env 拿
  const config = { someConfig: 'value' }; 
  
  // 假設舊的 middleware 把 user 放在這裡
  // const user = req['SYMBOL_BO_PERSON']; 
  // 為了示範，我們先 mock 一個 user
  const user = { id: 1, role: 'admin' };

  const result = await handler.handle(req, res, {
    // prefix: '/api',
    context: {
      user,
      config,
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