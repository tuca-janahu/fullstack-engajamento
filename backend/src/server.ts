import express from "express"
import cors from "cors"
import 'dotenv/config'; 
import connectDB from './config/database';
import engagementRoutes from './routes/engagementRoutes';

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api/engagement', engagementRoutes);

const startServer = async () => {
  try {
    await connectDB(); 
    app.listen(PORT, () => {
      console.log(`🚀 Backend de Engajamento rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();