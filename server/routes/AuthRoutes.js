import { Router } from "express";
import { checkUser, generateToken, getAllUsers, onBoardUser } from "../controllers/AuthController.js";


const router = Router();

router.post('/check-user', checkUser);

router.post('/on-board-user', onBoardUser);

router.get('/get-contacts', getAllUsers);

router.get('/generate-tokens/:userId', generateToken);

export default router;