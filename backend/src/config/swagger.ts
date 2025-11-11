import { Request, Response } from "express";
import { openapiSpec } from "../docs/openapi";

export function swaggerJsonHandler(_req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(openapiSpec);
}

export function swaggerHtmlHandler(_req: Request, res: Response) {
  // HTML mínimo usando CDN oficial do swagger-ui-dist
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
}
