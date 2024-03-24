// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Pool } from "@neondatabase/serverless";
import type { NextFetchEvent, NextRequest } from "next/server";
import zod, { string } from "zod";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

async function extractBody(req: NextRequest) {
  if (!req.body) {
    return null;
  }

  const decoder = new TextDecoder();
  const reader = req.body.getReader();

  let body = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      try {
        return JSON.parse(body);
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    body += decoder.decode(value);
  }
}

const schema = zod.object({
  handle: string().max(64).min(1),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const { handle } = schema.parse(body);
  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const sql = sqlstring.format(
    `
  INSERT INTO page (handle)
  VALUES (?);
  `,
    [handle],
  );

  console.log("sql", sql);

  await pool.query(sql);

  event.waitUntil(pool.end());

  return new Response(JSON.stringify({ handle }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return createPageHandler(req, event);
  }

  return new Response("Invalid method", {
    status: 405,
  });
}
