import express, { urlencoded } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import { url } from 'inspector';
import userRoutes from './routes/userRoutes';
import rateLimit from 'express-rate-limit';
import chatSocket from './socket/chatSocket';
// import routes from './routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

chatSocket(io);
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(bodyParser.json());
app.use(cors(
    { origin: '*' }
));
app.use(morgan('combined'));
app.use(helmet());
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/user', userRoutes);
// Use routes

// app.use('/api', routes);
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

export default app;
