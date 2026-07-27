import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { loginService } from "../services/login.service";


class AuthController {

  async register(
    req: Request,
    res: Response
  ) {
    try {

      const result =
        await authService.register(
          req.body
        );

      return res.status(201).json(result);

    } catch (error: any) {

      return res.status(400).json({
        message: error.message,
      });

    }
  }


  async login(
    req: Request,
    res: Response
  ) {

    try {

      console.log("========== LOGIN ==========");
      console.log("HEADERS:");
      console.log(req.headers);

      console.log("BODY:");
      console.log(req.body);


      const result =
        await loginService.login(
          req.body
        );


      return res.status(200).json(result);


    } catch (error: any) {

      console.log("LOGIN ERROR:");
      console.log(error);


      return res.status(401).json({
        message: error.message,
      });

    }

  }

}


export const authController =
  new AuthController();