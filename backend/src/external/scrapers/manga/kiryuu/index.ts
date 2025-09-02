import { Context, Elysia } from "elysia";
import { KiryuuParser } from "./parser.js";
import Response from "@lib/response.js";

export const kiryuuRoute = new Elysia()
  .group("/kiryuu", (app) => app
  
    .get("/by-genre", async (ctx: Context) => {
      const genre = ctx.query.genre || "romance"
      return Response.standarResponse(200, await KiryuuParser.byGenre(genre));
    })
  
    .get("/search", async (ctx: Context) => {
      const query = ctx.query.query || "Alya"
      return Response.standarResponse(200, await KiryuuParser.search(query));
    })

  );