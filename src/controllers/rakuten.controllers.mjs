import AffiliateProduct from "../models/rakutenModel/affiliateProduct.mjs";
import generateRakutenToken from "../services/rakuten.token.mjs";
import { searchProducts } from "../services/rakuten.searchproduct.mjs";

/*** Generate Rakuten Token */
export const generateToken = async (req, res) => {
  try {
    const token = await generateRakutenToken();

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Rakuten token",
    });
  }
};

/*** Get & Store Products */
export const getProducts = async (req, res) => {
  try {
    const { keyword, page = 1 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    // 🔹 Call Rakuten service
    const data = await searchProducts(keyword, page);

    // 🔹 Safe XML path
    const products = data?.response?.products?.product || [];

    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        products: [],
      });
    }
    // 🔹 Map API → MongoDB schema
    const mappedItems = products.map((item) => ({
      mid: Number(item.mid),
      merchantname: item.merchantname,
      linkid: item.linkid,
      sku: Number(item.sku),
      productname: item.productname,
      price: {
        amount: Number(item.price),
        currency: "USD",
      },
      saleprice: item.saleprice
        ? {
            amount: Number(item.saleprice),
            currency: "USD",
          }
        : undefined,
      keywords: item.keywords,
      linkurl: item.linkurl,
      imageurl: item.imageurl,
    }));

    // 🔹 Insert without stopping on duplicates
    const savedProducts = await AffiliateProduct.insertMany(mappedItems, {
      ordered: false,
    });

    return res.status(200).json({
      success: true,
      page: data.response.pageNumber,
      totalMatches: data.response.totalMatches,
      products: savedProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
