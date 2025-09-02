/**
 * Controller Untuk Autentikasi
 */

import AuthService from "@services/auth.service.js";
import { RegisterUserRequest, LoginUserRequest } from "models/user.model.js";
import { Context } from "elysia";
import { ResponseModel } from "@models/response.model.js";
import Response from "@lib/response.js";
import { ZodIssue } from "zod";
import HttpException from "@lib/httpException.js";

export class AuthController {

  // Register Controller
  static async register(context: Context): Promise<ResponseModel<{ message: string, user: object | null } | ZodIssue[]>> {
    const payload: RegisterUserRequest = (context.body as RegisterUserRequest);
    const response = await AuthService.register(payload);

    if (response.status !== 200) {
      return HttpException.standarException(response.status, response.error as { message: string, user: object | null } | ZodIssue[]);
    }

    return Response.standarResponse(response.status, response.result as { message: string, user: object | null } | ZodIssue[]);
  }

  // Login Controller
  static async login(context: Context): Promise<ResponseModel<{ message?: string, token: string | null } | ZodIssue[]>> {
    const payload: LoginUserRequest = (context.body as LoginUserRequest);
    const response = await AuthService.login(payload);
    
    if (response.status !== 200) {
      return HttpException.standarException(response.status, response.error as { message?: string, token: string | null } | ZodIssue[]);
    }

    return Response.standarResponse(response.status, response.result as { message?: string, token: string | null } | ZodIssue[]);
  }

}