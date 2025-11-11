import express from "express"
import cors from "cors"
import 'dotenv/config'; 
import connectDB from './config/database';
import engagementRoutes from './routes/engagementRoutes';
import { openapiSpec } from "./docs/openapi";

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


app.get("/", (_req, res) => {
  res.send("✅ API online");
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ROTA QUE ENTREGA O JSON DA SPEC
app.get("/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(openapiSpec);
});

// ROTA HTML QUE CARREGA O SWAGGER VIA CDN 
app.get("/docs", (_req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Engagement API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style> body { margin:0; } #swagger-ui { min-height:100vh; } </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/docs.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

app.use('/api/engagement', engagementRoutes);

const startServer = async () => {
  try {
    await connectDB(); 
    app.listen(PORT, () => {
      console.log(`🚀 Backend de Engajamento rodando na porta ${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/docs`);
      console.log(`🧾 OpenAPI JSON: http://localhost:${PORT}/docs.json`);
    });

  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();