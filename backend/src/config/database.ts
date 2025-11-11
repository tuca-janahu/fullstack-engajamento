import mongoose from 'mongoose';
import 'dotenv/config'; 

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ ERRO: MONGO_URI não definida no .env');
    process.exit(1); 
  }

  try {
    await mongoose.connect(mongoURI);
    
    console.log('✅ Conectado ao MongoDB (engagement-db)');

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1); 
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB desconectado.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Erro de conexão do MongoDB: ${err.message}`);
});

export default connectDB;