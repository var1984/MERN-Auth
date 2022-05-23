import express from "express";
import config from "config";
import mongoose from "mongoose";
import { router } from './routs/auth.route.js'
import cors from 'cors';

const app = express();

app.use(express.json({extended: true})) // щоб нормально парсити body
app.use(cors({ origin: 'http://localhost:3000', credentials:true}));
app.use('/api/auth', router) 


const PORT = config.get('port') || 5000
const start = async () => {
  try {
     await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
     })
  } catch (e) {
    "server Error", e.message;
    process.exit(1) //вихід з процесу якщо помилка
  }
};

app.get("/", (req, res) => {
  res.send("Hello");
});

start()
app.listen(PORT, () => console.log(`serv run port ${PORT}`));
