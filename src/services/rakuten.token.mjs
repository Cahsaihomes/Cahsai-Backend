import axios from "axios";
import qs from "querystring";

const clientId = process.env.RAKUTEN_CLIENT_ID;
const clientSecret = process.env.RAKUTEN_CLIENT_SECRET;
const username = process.env.RAKUTEN_USERNAME;
const password = process.env.RAKUTEN_PASSWORD;
const sid = process.env.RAKUTEN_SID;

export default async function generateRakutenToken() {
  try {
    const authHeader = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    const body = qs.stringify({
      grant_type: "password",
      username,
      password,
      scope: sid,
    });

    const response = await axios.post(
      "https://api.linksynergy.com/token",
      body,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    console.log(response.data);
    return response.data; // ✅ return token only
  } catch (err) {
    if (err.response) {
      console.error("Token Error:", err.response.data);
    } else {
      console.error(err.message);
    }
    throw err;
  }
}
