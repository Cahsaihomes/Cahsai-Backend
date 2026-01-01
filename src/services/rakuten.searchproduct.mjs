import axios from "axios";
import xml2js from "xml2js";
import generateRakutenToken from "./rakuten.token.mjs";

const RAKUTEN_API = process.env.RAKUTEN_API;

export async function searchProducts(keyword, page = 1) {
  const res = await generateRakutenToken();

  const refreshToken = res.refresh_token;
  const token = res.access_token;

  console.log("token : " , token);
  const response = await axios.get(RAKUTEN_API, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/xml",
    },
    params: {
      keyword,
      mid: process.env.RAKUTEN_MID,
      resultsperpage: 20,
      pagenumber: page,
    },
  });

  const parsed = await xml2js.parseStringPromise(response.data, {
    explicitArray: false,
  });

  return parsed;
}
