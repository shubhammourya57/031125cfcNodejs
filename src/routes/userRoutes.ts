import express from 'express';
const router = express.Router();
import { login, logout, signup,profile } from '../controller/userController';

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', profile);    

export default router;