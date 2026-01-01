import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    mid: {
      type: Number,
      required: true,
      index: true,
    },

    merchantname: {
      type: String,
      required: true,
    },

    linkid: {
      type: String,
      required: true,
      unique: true,
    },

    sku: {
      type: Number,
      required: true,
      index: true,
    },

    productname: {
      type: String,
      required: true,
      index: "text",
    },

    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    saleprice: {
      amount: {
        type: Number,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    keywords: {
      type: String,
      index: "text",
    },

    linkurl: {
      type: String,
      required: true,
    },

    imageurl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AffiliateProduct", ProductSchema);
