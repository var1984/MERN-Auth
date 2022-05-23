import { Router } from "express";
import { User } from "../models/users.js";
import bcrypt from "bcryptjs"; // дозволяє зрвівнювати захеширувані паролі
import { check, validationResult } from "express-validator"; // валідація пароля і мейла
import jwt from 'jsonwebtoken'
import config from "config";
export const router = Router();

// '/api/auth/register'
router.post(
  "/register",
  [
    check("email", "Не коректний email").isEmail(),
    check("password", "Мінімальна довжина пароля 6 символів").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Не коректні дані при регістрації",
        });
      }
// console.log(User);
      // res.send(User);
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res.status(400).json({ message: "Такий користувач існує" });
      }
      const heshedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: heshedPassword });
      await user.save();

      res.status(201).json({ message: "Користувач створений" });
    } catch (e) {
      res.status(500).json({ message: "Щось пішло не так, спробуйте знову" });
    }
  }
);

// '/api/auth/login'
router.post(
  "/login",
  [
    check("email", "Введіть коректний email").normalizeEmail().isEmail(),
    check("password", "Введіть пароль").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Не коректні дані пр вході в систему",
        });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email })

      if(!user){
        return res.status(400).json({message: 'Користувач не знайдений'})
      }

      const isMatch = await bcrypt.compare(password. user.password)

      if(!isMatch){
        return res.status(400).json({ message: 'Не вірний пароль'})
      }

      const token = jwt.sign(
        {userId: user.id},
        config.get('jwtSecretKey'),
        {expiresIn: '1h'}
      )
      res.json({token, userId: user.id})
    } catch (e) {
      res.status(500).json({ message: "Щось пішло не так, спробуйте знову" });
    }
  }
);
