// rakuten.search.mjs
import axios from "axios";
import xml2js from "xml2js";
import { getValidRakutenToken } from "./token.validator.mjs";

const RAKUTEN_API = process.env.RAKUTEN_API;

export async function searchProducts(keyword, page = 1) {
  const token = await getValidRakutenToken();

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
  console.log("Rakuten API response data:", response.data);
  console.log("Rakuten token:", token);

  return xml2js.parseStringPromise(response.data, {
    explicitArray: false,
  });
}
