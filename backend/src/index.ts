/**
 * Semoga gak pusing liat kodenya
 * Maaf kalau acak acakan, masih belajar soalnya
 */

import "dotenv/config.js";
import { Elysia, Context } from "elysia";
import { cors } from '@elysiajs/cors'
import * as cache from "elysia-cache";
import HttpException from "@lib/httpException.js";
import { authMiddleware } from "@middleware/auth.middleware.js";

import { authRoute, externalRoute, publicRoute, userRoute } from "@routes/index.js";

const PORT = process.env.PORT || 3000;

const protectedRoute = new Elysia()
  // Middlewarenya
  .onBeforeHandle(authMiddleware)

  // Subrouter User
  .use(userRoute)

// Handler Utama
const app = new Elysia()
  .use(cors())
  .use(cache.cache({
    max: 80
  }))

  // Handle 404
  .onError(({ code }: any) => {
    if (code === "NOT_FOUND") {
      return HttpException.standarException(404, { message: "halaman tidak ditemukan" });
    }
  })
  .onAfterHandle(({ set, response }: any) => {
    set.status = response.status;
  })

  // Route Utama ( Gakguna jir 😂 )
  .get("/", () => {
    return {
      message: "Service active.",
      source: "Finime, Kuramanime, Otakudesu, MyAnimeList, Komi-Komi, AnimeLovers, AnimePlay"
    }
  })

  // Api Route
  .group("/api", (app) => app

    // v1
    .group("/v1", (app) => app
      // Subrouter Public ( No protect middleware )
      .use(authRoute)
      .use(publicRoute)
      .use(externalRoute)

      // Subrouter Anime & Manga ( Protect middleware )
      .use(protectedRoute)
    )

  )

  /**
   * Karna elysia js itu pake runtime bun, jadi gak bisa di deploy di serverless kayak vercel
   * Kalo mau jalanin api backend ini di mode development
   * Uncomment sementara kode .listen ini
   * Lalu kalau udah dan ingin di deploy, comment lagi kodenya
   */
  // .listen(PORT)

/**
 * Inimah gak usah di apa-apain, biarin aja
 */
export const GET = app.handle
export const POST = app.handle
export const PATCH = app.handle
export const PUT = app.handle
export const OPTIONS = app.handle
export const DELETE = app.handle

console.log(
  `[ 🦊 Elysia ] Finime api is running at ${app.server?.hostname}:${app.server?.port}`
);