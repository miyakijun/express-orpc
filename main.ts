import express from "express";
import cors from "cors";
import { orpcMiddleware } from './common/middleware';
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

app.use(orpcMiddleware);

const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  console.log(`📄 Swagger UI available at http://localhost:${port}/docs`);
});
