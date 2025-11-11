export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Engagement Service API",
    version: "1.0.0",
    description: "API de Engajamento (pontos) – spec mínima",
  },
  servers: [{ url: "http://localhost:3000", description: "DEV local" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    parameters: {
      IdempotencyKey: {
        name: "X-Idempotency-Key", in: "header", required: true,
        schema: { type: "string", minLength: 1 },
        description: "Chave para evitar duplicação de operações."
      }
    },
    schemas: {
      Error: { type: "object", properties: { error: { type: "string" }, message: { type: "string" } } },
      Balance: {
        type: "object",
        properties: {
          balance: { type: "integer", example: 4200 },
          totalEarned: { type: "integer", example: 5600 },
          totalRedeemed: { type: "integer", example: 1400 }
        },
        required: ["balance","totalEarned","totalRedeemed"]
      },
      RedeemRequest: {
        type: "object",
        properties: {
          points: { type: "integer", minimum: 1, example: 300 },
          reason: { type: "string", example: "checkout-discount" },
          orderId: { type: "string", example: "ord_1" }
        },
        required: ["points"]
      },
      RedeemResponse: {
        type: "object",
        properties: {
          redeemedPoints: { type: "integer", example: 300 },
          monetaryValueCents: { type: "integer", example: 3000 },
          newBalance: { type: "integer", example: 3900 }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Healthcheck",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object" } } } } }
      }
    },
    "/api/engagement/me/points": {
      get: {
        tags: ["Me"], security: [{ bearerAuth: [] }],
        summary: "Saldo do usuário autenticado",
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Balance" } } } },
          401: { description: "Sem token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/engagement/points/redeem": {
      post: {
        tags: ["Points"], security: [{ bearerAuth: [] }],
        summary: "Resgatar pontos",
        parameters: [{ $ref: "#/components/parameters/IdempotencyKey" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RedeemRequest" } } } },
        responses: {
          201: { description: "Criado", content: { "application/json": { schema: { $ref: "#/components/schemas/RedeemResponse" } } } },
          422: { description: "Saldo insuficiente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    }
  }
};