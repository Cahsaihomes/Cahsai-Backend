// rakuten.token.mjs
import axios from "axios";
import qs from "querystring";
import { saveToken } from "./token.validator.mjs";

export async function generateRakutenToken() {
  const authHeader = Buffer
    .from(`${process.env.RAKUTEN_CLIENT_ID}:${process.env.RAKUTEN_CLIENT_SECRET}`)
    .toString("base64");

  const body = qs.stringify({
    grant_type: "password",
    username: process.env.RAKUTEN_USERNAME,
    password: process.env.RAKUTEN_PASSWORD,
    scope: process.env.RAKUTEN_SID,
  });

  const response = await axios.post(
    "https://api.linksynergy.com/token",
    body,
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  saveToken(response.data);
  return response.data.access_token;
}
