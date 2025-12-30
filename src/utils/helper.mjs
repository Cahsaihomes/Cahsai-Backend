// helpers.mjs
import cloudinary from "../config/cloudnary.mjs";

export const getCardBrand = (cardNumber) => {
  if (!cardNumber) return "Unknown";

  const num = cardNumber.replace(/\s+/g, "");

  // Visa: Starts with 4, length 13 or 16
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(num)) {
    return "Visa";
  }

  // MasterCard: Starts with 51–55 or 2221–2720
  if (
    /^(5[1-5][0-9]{14}|2(2[2-9][0-9]{12}|[3-6][0-9]{13}|7[01][0-9]{12}|720[0-9]{12}))$/.test(
      num
    )
  ) {
    return "MasterCard";
  }

  // American Express: Starts with 34 or 37, length 15
  if (/^3[47][0-9]{13}$/.test(num)) {
    return "American Express";
  }

  // Discover: Starts with 6011, 65, 644-649
  if (/^6(?:011|5[0-9]{2}|4[4-9][0-9])/.test(num)) {
    return "Discover";
  }

  return "Unknown";
};

export const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    let resourceType = "auto";
    cloudinary.uploader
      .upload_stream(
        { folder: folder, resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(file.buffer);
  });
};
