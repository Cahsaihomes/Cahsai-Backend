import bcrypt from "bcryptjs";
import {
  AgentTable,
  CreatorTable,
  NotificationPreferenceTable,
  User,
} from "../../models/userModel/index.mjs";
import {
  agentSchema,
  bankDetailsSchema,
  baseUserSchema,
  paymentDetailsSchema,
  paymentMethodSchema,
} from "../../validations/signup.validation.mjs";
import { PaymentDetails } from "../../models/userModel/index.mjs";

import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.mjs";
import userRepo from "../repositories/user.repo.mjs";
import { getCardBrand, uploadToCloudinary } from "../../utils/helper.mjs";
import { Op } from "sequelize";
import sequelizeConn from "../../config/database.mjs";
import postRepo from "../repositories/post.repo.mjs";
export const registerUser = async (data) => {
  const { error, value } = baseUserSchema.validate(data, { abortEarly: false });
  if (error) {
    return {
      status: "error",
      code: 400,
      message: "Validation failed",
      // errors: error.details.map((err) => err.message),
      errors: error.details[0].message,
    };
  
  }
  const existingEmail = await User.findOne({ where: { email: value.email } });
  if (existingEmail) {
    return {
      status: "error",
      code: 409,
      message: "Duplicate entry",
      errors: "Email already exists!",
    };
  }

  const existingContact = await User.findOne({
    where: { contact: value.contact },
  });
  if (existingContact) {
    return {
      status: "error",
      code: 409,
      message: "Duplicate entry",
      errors: "Contact number already exists!",
    };
  }

  const hashedPassword = await bcrypt.hash(value.password, 10);

  let performancePoints = 0;

  if (value.role === "agent") {
    performancePoints = 10;
  }

  const user = await User.create({
    first_name: value.first_name,
    last_name: value.last_name,
    user_name: value.user_name,
    email: value.email,
    contact: value.contact,
    password: hashedPassword,
    role: value.role,
    acceptedTerms: value.acceptedTerms,
    avatarUrl: null,
    performancePoints,
  });

  if (value.role === "creator") {
    await CreatorTable.create({
      userId: user.id,
    });
  }
  await NotificationPreferenceTable.create({
    userId: user.id,
  });
  const { password, ...safeUser } = user.toJSON();

  return {
    status: "success",
    code: 201,
    message: "User registered successfully",
    data: safeUser,
  };
};

export const createPaymentDetails = async (data) => {
  const { error, value } = paymentDetailsSchema.validate(data, {
    abortEarly: false,
  });
  if (error) {
    return {
      status: "error",
      code: 400,
      message: "Validation failed",
      // errors: error.details.map((err) => err.message),
      errors: error.details[0].message,
    };
  }

  const user = await User.findByPk(value.userId);
  if (!user) {
    return {
      status: "error",
      code: 404,
      message: "Not Found",
      errors: "User not found",
    };
  }

  // const cardBrand = getCardBrand(value.cardNumber);

  let cardBrand = value?.cardBrand;
  if (!cardBrand && value?.cardNumber) {
    cardBrand = getCardBrand(value.cardNumber);
  }

  const paymentDetails = await PaymentDetails.create({
    userId: user.id,
    cardBrand,
    cardHolderName: value?.cardHolderName,
    cardNumber: value?.cardNumber,
    cardExpiryDate: value?.cardExpiryDate,
    billingAddress: value?.billingAddress,
  });

  await AgentTable.create({
    userId: user.id,
    brokerageName: value?.brokerageName,
    mlsLicenseNumber: value?.mlsLicenseNumber,
    mlsAssociation: value?.mlsAssociation,
  });

  return {
    status: "success",
    code: 201,
    message: "Payment details saved successfully",
    data: paymentDetails,
  };
};

export const createAgentProfile = async (data, profilePic) => {
  if (typeof data.areasServed === "string") {
    try {
      data.areasServed = JSON.parse(data.areasServed);
    } catch {
      data.areasServed = [data.areasServed];
    }
  }

  if (typeof data.specializations === "string") {
    try {
      data.specializations = JSON.parse(data.specializations);
    } catch {
      data.specializations = [data.specializations];
    }
  }

  const { error, value } = agentSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return {
      status: "error",
      code: 400,
      message: "Validation failed",
      // errors: error.details.map((err) => err.message),
      errors: error.details[0].message,
    };
  }
  const profilepicUrl =
    profilePic !== undefined || profilePic
      ? await uploadToCloudinary(profilePic[0], "profile_pic")
      : null;

  const user = await User.findByPk(value.userId);
  if (!user) {
    return {
      status: "error",
      code: 404,
      message: "Not Found",
      errors: "User not found",
    };
  }

  if (profilepicUrl) {
    await user.update({ avatarUrl: profilepicUrl });
  }
  const agentProfile = await AgentTable.findOne({
    where: { userId: user.id },
  });

  if (!agentProfile) {
    return {
      status: "error",
      code: 404,
      message: "Not Found",
      errors: "Agent profile not found",
    };
  }

  const agentdata = await agentProfile.update({
    linkedinUrl: value.linkedinUrl,
    instagramUsername: value.instagramUsername,
    areasServed: value.areasServed,
    specializations: value.specializations,
  });

  return {
    status: "success",
    code: 201,
    message: "Profile Created successfully",
    data: agentdata,
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new Error("Email and password are required");

  const user = await User.findOne({
    where: { email },
    attributes: [
      "id",
      "first_name",
      "last_name",
      "user_name",
      "contact",
      "role",
      "email",
      "password",
      "emailVerified",
      "performancePoints",
      "acceptedTerms",
      "isDeleted",
      "avatarUrl",
      "isRentalCompany",
    ],
  });

  if (!user) return { status: "error", message: "Invalid email or password" };

  if (!user.emailVerified) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp); // For debugging purposes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // in 10  minutes
    await user.update({ otp, otpExpiry });
    const userData = user.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;
    delete userData.performancePoints;
    delete userData.acceptedTerms;

    await sendEmail(user.email, `Your OTP verification code is: ${otp}`);

    return {
      status: "error",
      message:
        "Your email is not verified. An OTP has been sent to your email. Please verify your account.",
      user: userData,
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return { status: "error", message: "Invalid email or password" };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, isRentalCompany: user.isRentalCompany },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  let userData = user.toJSON();
  delete userData.password;
  if (user.role === "agent") {
    const existingProfile = await AgentTable.findOne({
      where: { userId: user.id },
    });

    const existingPayment = await PaymentDetails.findOne({
      where: { userId: user.id },
    });
    let profileInfo = existingProfile ? existingProfile.toJSON() : null;

    if (profileInfo) {
      if (profileInfo.areasServed && typeof profileInfo.areasServed === "string") {
        try {
          profileInfo.areasServed = JSON.parse(profileInfo.areasServed);
        } catch (e) {
          // leave as is if not valid JSON
        }
      }
      if (profileInfo.specializations && typeof profileInfo.specializations === "string") {
        try {
          profileInfo.specializations = JSON.parse(profileInfo.specializations);
        } catch (e) {
          // leave as is if not valid JSON
        }
      }
    }
    userData = {
      ...userData,
      profile_info: profileInfo,
      paymentDetails: existingPayment || null,
    };
  }
  if (user.role === "creator") {
    const existingProfile = await CreatorTable.findOne({
      where: { userId: user.id },
    });

    const existingPayment = await PaymentDetails.findOne({
      where: { userId: user.id },
    });

    userData = {
      ...userData,
      profile_info: existingProfile || null,
      paymentDetails: existingPayment || null,
    };
  }

  return {
    status: "success",
    message: "Login successful",
    token,
    user: userData,
  };
};

export const verifyOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    return { status: "error", message: "Email and OTP are required" };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { status: "error", message: "User not found" };
  }

  if (user.emailVerified) {
    return { status: "success", message: "Email already verified" };
  }

  if (user.otp !== otp) {
    return { status: "error", message: "Invalid OTP" };
  }

  if (user.otpExpiry < new Date()) {
    return {
      status: "error",
      message: "OTP expired. Please request a new one.",
    };
  }

  await user.update({
    emailVerified: true,
    otp: null,
    otpExpiry: null,
  });

  return { status: "success", message: "Email verified successfully" };
};

export const requestOTP = async (email) => {
  if (!email) {
    return { status: "error", message: "Email is required" };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { status: "error", message: "User not found" };
  }
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.update({ otp, otpExpiry });
  await sendEmail(email, `Your password reset OTP is: ${otp}`);
  return {
    status: "success",
    message: "OTP sent to your email. It will expire in 10 minutes.",
  };
};

export const verifyForgetPasswordOTP = async ({ email, otp }) => {
  if (!email || !otp) {
    return { status: "error", message: "Email and OTP are required" };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { status: "error", message: "User not found" };
  }

  if (user.otp !== otp) {
    return { status: "error", message: "Invalid OTP" };
  }

  if (user.otpExpiry < new Date()) {
    return {
      status: "error",
      message: "OTP expired. Please request a new one.",
    };
  }

  // OTP verified - clear OTP fields
  await user.update({ otp: null, otpExpiry: null });

  return { status: "success", message: "OTP verified successfully" };
};

export const resetPassword = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    return { status: "error", message: "Email and new password are required" };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { status: "error", message: "User not found" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({ passwordHash: hashedPassword });

  return { status: "success", message: "Password reset successfully" };
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password", "otp", "otpExpiry", "AccessToken"] },
  });

  if (!user) {
    return { status: "error", message: "User not found" };
  }
  const safeParseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const s = value.trim();
   
      if (s.startsWith("[") || s.startsWith("{")) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
      
        }
      }
      if (s.includes(",")) {
        return s.split(",").map((x) => x.trim()).filter(Boolean);
      }
      return s ? [s] : [];
    }
    return [];
  };

  if (user.role === "agent") {
    const paymentDetails = await PaymentDetails.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const agent = await AgentTable.findOne({ where: { userId } });
    const parsedAgent = agent
      ? {
          ...agent.toJSON(),
          areasServed: safeParseList(agent.areasServed),
          specializations: safeParseList(agent.specializations),
        }
      : null;
    const parsedPayments = paymentDetails.map((pd) => ({
      ...pd.toJSON(),
      verification_documents: safeParseList(pd.verification_documents),
    }));
    return {
      status: "success",
      message: "Agent profile fetched successfully",
      data: {
        user,
        bankDetails: parsedPayments,
        agent: parsedAgent,
      },
    };
  }
  if (user.role === "creator") {
    const paymentDetails = await PaymentDetails.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    const creator = await CreatorTable.findOne({ where: { userId } });
    const parsedCreator = creator
      ? {
          ...creator.toJSON(),
          identity_verification: safeParseList(
            creator.identity_verification
          ),
        }
      : null;
    const parsedPayments = paymentDetails.map((pd) => ({
      ...pd.toJSON(),
      verification_documents: safeParseList(pd.verification_documents),
    }));
    return {
      status: "success",
      message: "Creator profile fetched successfully",
      data: {
        user,
        bankDetails: parsedPayments,
        creator: parsedCreator,
      },
    };
  }
  // For admin and buyer just return user info
  return {
    status: "success",
    message: "User profile fetched successfully",
    data: user,
  };
};

// export const updateUserProfile = async (
//   userId,
//   profileData,
//   profilePic,
//   identity
// ) => {

//   const profilepicUrl =
//     profilePic && profilePic.length > 0
//       ? await uploadToCloudinary(profilePic[0], "profile_pic")
//       : null;

//   let identityUrls = [];
//   if (identity && identity.length > 0) {
//     for (const file of identity) {
//       const url = await uploadToCloudinary(file, "identity_verification_docs");
//       identityUrls.push(url);
//     }
//   }
//    if (typeof profileData.areasServed === "string") {
//     try {
//       profileData.areasServed = JSON.parse(profileData.areasServed);
//     } catch {
//       profileData.areasServed = [profileData.areasServed];
//     }
//   }

//   if (typeof profileData.specializations === "string") {
//     try {
//       profileData.specializations = JSON.parse(profileData.specializations);
//     } catch {
//       profileData.specializations = [profileData.specializations];
//     }
//   }
//   const user = await userRepo.findUserById(userId);

//   if (!user) {
//     return { status: "error", message: "User not found" };
//   }

//   const userFields = [
//     "first_name",
//     "last_name",
//     "user_name",
//     "email",
//     "contact",
//     "acceptedTerms",
//     "avatarUrl",
//   ];

//   const agentFields = [
//     "linkedinUrl",
//     "brokerageName",
//     "mlsLicenseNumber",
//     "mlsAssociation",
//     "instagramUsername",
//     "areasServed",
//     "specializations",
//   ];
//   const creatorFields = [
//     "location",
//     "bio",
//     "identity_verification",
//     "isIdentityVerified",
//   ];
//   const userData = {};
//   const creatorData = {};
//   const agentData = {};

//   for (const key in profileData) {
//     if (userFields.includes(key)) {
//       userData[key] = profileData[key];
//     } else if (creatorFields.includes(key)) {
//       creatorData[key] = profileData[key];
//     } else if (agentFields.includes(key)) {
//       agentData[key] = profileData[key];
//     }
//   }

//   // Update User
//   if (Object.keys(userData).length > 0) {
//     await userRepo.updateUser(userId, userData);
//   }

//   // Update agent
//   if (Object.keys(agentData).length > 0) {
//     const existingAgent = await userRepo.findAgents(userId);
//     const updatedAgent = {
//       ...existingAgent?.toJSON(),
//       ...agentData,
//     };
//     await userRepo.updateAgents(userId, updatedAgent);
//   }

//   // Update creator
//   if (Object.keys(creatorData).length > 0) {
//     const existingCreator = await userRepo.findCreators(userId);
//     const updatedCreator = {
//       ...existingCreator?.toJSON(),
//       ...creatorData,
//     };
//     await userRepo.updateCreators(userId, updatedCreator);
//   }

//   const updatedUser = await userRepo.getFullUserProfile(userId);

//   return {
//     status: "success",
//     message: "Profile updated successfully",
//     data: updatedUser,
//   };
// };

export const updateUserProfile = async (
  userId,
  profileData,
  profilePic,
  identity,
  cnic,
  passport
) => {
  const profilepicUrl =
    profilePic && profilePic.length > 0
      ? await uploadToCloudinary(profilePic[0], "profile_pic")
      : null;

  const cnicUrl =
    cnic && cnic.length > 0
      ? await uploadToCloudinary(cnic[0], "creator_cnic")
      : null;

  const passportUrl =
    passport && passport.length > 0
      ? await uploadToCloudinary(passport[0], "creator_passport")
      : null;

  let identityUrls = [];
  if (identity && identity.length > 0) {
    for (const file of identity) {
      const url = await uploadToCloudinary(file, "identity_verification_docs");
      identityUrls.push(url);
    }
  }

  if (typeof profileData.areasServed === "string") {
    try {
      profileData.areasServed = JSON.parse(profileData.areasServed);
    } catch {
      profileData.areasServed = [profileData.areasServed];
    }
  }

  if (typeof profileData.specializations === "string") {
    try {
      profileData.specializations = JSON.parse(profileData.specializations);
    } catch {
      profileData.specializations = [profileData.specializations];
    }
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return { status: "error", message: "User not found" };
  }

  if (profileData.email) {
    const existingEmail = await User.findOne({
      where: { email: profileData.email, id: { [Op.ne]: userId } },
    });
    if (existingEmail) {
      return { status: "error", message: "Email already in use" };
    }
  }

  if (profileData.contact) {
    const existingContact = await User.findOne({
      where: { contact: profileData.contact, id: { [Op.ne]: userId } },
    });
    if (existingContact) {
      return { status: "error", message: "Contact already in use" };
    }
  }
  const userFields = [
    "first_name",
    "last_name",
    "user_name",
    "email",
    "contact",
    "acceptedTerms",
    "avatarUrl",
  ];
  const agentFields = [
    "linkedinUrl",
    "brokerageName",
    "mlsLicenseNumber",
    "mlsAssociation",
    "instagramUsername",
    "areasServed",
    "specializations",
  ];
  const creatorFields = [
    "location",
    "bio",
    "identity_verification",
    "isIdentityVerified",
    "cnicUrl",
    "passportUrl",
  ];

  const userData = {};
  const agentData = {};
  const creatorData = {};

  for (const key in profileData) {
    if (userFields.includes(key)) {
      userData[key] = profileData[key];
    } else if (agentFields.includes(key)) {
      agentData[key] = profileData[key];
    } else if (creatorFields.includes(key)) {
      creatorData[key] = profileData[key];
    }
  }

  if (profilepicUrl) {
    userData.avatarUrl = profilepicUrl;
  }

  if (cnicUrl) {
    creatorData.cnicUrl = cnicUrl;
  }

  if (passportUrl) {
    creatorData.passportUrl = passportUrl;
  }

  if (cnicUrl || passportUrl) {
    creatorData.isIdentityVerified = true;
  }
  if (profileData.isPassportRemove === "true") {
    creatorData.passportUrl = null;
  }
  if (profileData.isCnicRemove === "true") {
    creatorData.cnicUrl = null;
  }
  if (identityUrls.length > 0) {
    creatorData.identity_verification = identityUrls;
    creatorData.isIdentityVerified = true;
  }

  if (Object.keys(userData).length > 0) {
    await User.update(userData, { where: { id: userId } });
  }

  if (Object.keys(agentData).length > 0) {
    const existingAgent = await AgentTable.findOne({ where: { userId } });
    if (existingAgent) {
      await AgentTable.update(agentData, { where: { userId } });
    } else {
      await AgentTable.create({ userId, ...agentData });
    }
  }

  if (Object.keys(creatorData).length > 0) {
    const existingCreator = await CreatorTable.findOne({ where: { userId } });
    if (existingCreator) {
      await CreatorTable.update(creatorData, { where: { userId } });
    } else {
      await CreatorTable.create({ userId, ...creatorData });
    }
  }

  let updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
  });

  if (updatedUser.role === "agent") {
    const agentTable = await AgentTable.findOne({ where: { userId } });
    updatedUser = {
      ...updatedUser.toJSON(),
      profile_info: agentTable
        ? {
            ...agentTable.toJSON(),
            areasServed:
              agentTable.areasServed && typeof agentTable.areasServed === "string"
                ? (() => { try { return JSON.parse(agentTable.areasServed); } catch { return agentTable.areasServed; } })()
                : agentTable.areasServed || [],
            specializations:
              agentTable.specializations && typeof agentTable.specializations === "string"
                ? (() => { try { return JSON.parse(agentTable.specializations); } catch { return agentTable.specializations; } })()
                : agentTable.specializations || [],
          }
        : null,
    };
  }

  if (updatedUser.role === "creator") {
    const creatorTable = await CreatorTable.findOne({ where: { userId } });
    updatedUser = {
      ...updatedUser.toJSON(),
      profile_info: creatorTable
        ? {
            ...creatorTable.toJSON(),
            identity_verification: Array.isArray(
              creatorTable.identity_verification
            )
              ? creatorTable.identity_verification
              : creatorTable.identity_verification
              ? JSON.parse(creatorTable.identity_verification)
              : [],
          }
        : null,
    };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return {
    status: "success",
    message: "Profile updated successfully",
    token,
    user: updatedUser,
  };
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    return { status: "error", message: "User not found" };
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return { status: "error", message: "Current password is incorrect" };
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await userRepo.updateUser(userId, { password: hashedPassword });

  return { status: "success", message: "Password updated successfully" };
};

export const logoutUser = async (token) => {
  await userRepo.blacklistToken(token);

  return {
    status: "success",
    message: "Logged out successfully",
  };
};

export const addPaymentMethod = async (data, userId) => {
  const { error, value } = paymentMethodSchema.validate(data, {
    abortEarly: false,
  });
  if (error) {
    return {
      status: "error",
      code: 400,
      message: "Validation failed",
      errors: error.details[0].message,
    };
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return {
      status: "error",
      code: 404,
      message: "Not Found",
      errors: "User not found",
    };
  }

  const cardBrand = getCardBrand(value.cardNumber);

  const payment_method = await PaymentDetails.create({
    userId: userId,
    cardBrand,
    cardHolderName: value?.cardHolderName,
    cardNumber: value?.cardNumber,
    cardCvv: value?.cardCvv,
    cardExpiryDate: value?.cardExpiryDate,
    billingAddress: value?.billingAddress,
  });

  return {
    status: "success",
    code: 201,
    message: "Payment Method add successfully",
    data: payment_method,
  };
};

export const deletePaymentMethod = async (data, userId) => {
  const { paymentMethodId } = data;

  if (!paymentMethodId) {
    return {
      status: "error",
      code: 400,
      message: "Payment Method ID is required",
    };
  }

  const paymentMethod = await PaymentDetails.findOne({
    where: { id: paymentMethodId, userId },
  });

  if (!paymentMethod) {
    return {
      status: "error",
      code: 404,
      message: "Payment Method not found",
    };
  }

  await paymentMethod.destroy();

  return {
    status: "success",
    code: 200,
    message: "Payment Method deleted successfully",
  };
};

export const getPaymentMethod = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: "error",
        code: 404,
        message: "User not found",
      };
    }

    const paymentMethods = await PaymentDetails.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const count = await PaymentDetails.count({ where: { userId } });

    return {
      status: "success",
      code: 200,
      message: "Payment methods fetched successfully",
      count,
      data: paymentMethods,
    };
  } catch (error) {
    return {
      status: "error",
      code: 500,
      message: "Something went wrong",
      errors: error.message,
    };
  }
};

export const addBankDetails = async (data, userId, bank_verification) => {
  const { error, value } = bankDetailsSchema.validate(data, {
    abortEarly: false,
  });
  if (error) {
    return {
      status: "error",
      code: 400,
      message: "Validation failed",
      errors: error.details[0].message,
    };
  }

  let bank_verification_urls = [];
  if (bank_verification && bank_verification.length > 0) {
    for (const file of bank_verification) {
      const url = await uploadToCloudinary(file, "bank_verification_documents");
      bank_verification_urls.push(url);
    }
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return {
      status: "error",
      code: 404,
      message: "Not Found",
      errors: "User not found",
    };
  }

  let cardBrand = value?.cardBrand;
  if (!cardBrand && value?.cardNumber) {
    cardBrand = getCardBrand(value.cardNumber);
  }

  const bankDetails = await PaymentDetails.create({
    userId: userId,
    cardBrand,
    cardHolderName: value?.cardHolderName,
    cardNumber: value?.cardNumber,
    cardCvv: value?.cardCvv,
    cardExpiryDate: value?.cardExpiryDate,
    billingAddress: value?.billingAddress || null,
    account_name: value?.account_name,
    account_type: value?.account_type,
    bank_name: value?.bank_name,
    iban: value?.iban,
    routing_number: value?.routing_number || null,
    currency: value?.currency,
    email: value?.email,
    phone_number: value?.phone_number,
    verification_documents: bank_verification_urls.length
      ? bank_verification_urls
      : [],
  });

  return {
    status: "success",
    code: 201,
    message: "Add Acount Details successfully",
    data: bankDetails,
  };
};

export const getNotificationPreferences = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: "error",
        code: 404,
        message: "User not found",
      };
    }

    const data = await NotificationPreferenceTable.findOne({
      where: { userId },
    });

    return {
      status: "success",
      code: 200,
      message: "Notification Preferences fetched successfully",
      data,
    };
  } catch (error) {
    return {
      status: "error",
      code: 500,
      message: "Something went wrong",
      errors: error.message,
    };
  }
};

export const toggleNotificationPreferences = async (userId, body) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: "error",
        code: 404,
        message: "User not found",
      };
    }

    let preference = await NotificationPreferenceTable.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = await NotificationPreferenceTable.create({
        userId,
        ...body,
      });
    } else {
      await preference.update(body);
    }

    let messages = [];
    if ("isAll" in body) {
      messages.push(
        body.isAll ? "Notifications Enabled" : "Notifications Disabled"
      );
    }
    if ("isPush" in body) {
      messages.push(
        body.isPush ? "Notifications Enabled" : "Notifications Disabled"
      );
    }
    if ("isEmail" in body) {
      messages.push(
        body.isEmail ? "Notifications Enabled" : "Notifications Disabled"
      );
    }

    const finalMessage =
      messages.length > 0
        ? messages.join(", ")
        : "Notification Preferences updated successfully";

    return {
      status: "success",
      code: 200,
      message: finalMessage,
      data: preference,
    };
  } catch (error) {
    return {
      status: "error",
      code: 500,
      message: "Something went wrong",
      errors: error.message,
    };
  }
};

// Helper to ensure arrays
const toArray = (val) => {
  const arr = Array.isArray(val) ? val : val ? JSON.parse(val) : [];
  // Normalize to numbers when possible
  return arr.map((x) => {
    const n = Number(x);
    return Number.isNaN(n) ? x : n;
  });
};

// Follow logic using MySQL JSON ops when available
export const followUser = async (followerId, targetUserId) => {
  try {
    if (!targetUserId || Number.isNaN(targetUserId)) {
      return { status: "error", code: 400, message: "Invalid target user id" };
    }
    if (followerId === targetUserId) {
      return { status: "error", code: 400, message: "You cannot follow yourself" };
    }

    const [follower, target] = await Promise.all([
      User.findByPk(followerId, { attributes: ["id", "following_ids"] }),
      User.findByPk(targetUserId, { attributes: ["id", "followers_ids"] }),
    ]);

    if (!follower || !target) {
      return { status: "error", code: 404, message: "User not found" };
    }

    let following = toArray(follower.following_ids);
    let followers = toArray(target.followers_ids);
    let action;
    if (following.includes(targetUserId)) {
      // Unfollow
      following = following.filter((id) => id !== targetUserId);
      followers = followers.filter((id) => id !== followerId);
      action = "unfollowed";
    } else {
      // Follow
      following.push(targetUserId);
      followers.push(followerId);
      action = "followed";
    }
    await follower.update({ following_ids: following });
    await target.update({ followers_ids: followers });
    return {
      status: "success",
      code: 200,
      message: action === "followed" ? "Followed successfully" : "Unfollowed successfully",
      action,
      data: { followerId, targetUserId, followingCount: following.length, followersCount: followers.length },
    };
  } catch (e2) {
    return { status: "error", code: 500, message: e2.message };
  }
};

export const unfollowUser = async (followerId, targetUserId) => {
  try {
    if (!targetUserId || Number.isNaN(targetUserId)) {
      return { status: "error", code: 400, message: "Invalid target user id" };
    }
    if (followerId === targetUserId) {
      return { status: "error", code: 400, message: "You cannot unfollow yourself" };
    }

    const [follower, target] = await Promise.all([
      User.findByPk(followerId, { attributes: ["id", "following_ids"] }),
      User.findByPk(targetUserId, { attributes: ["id", "followers_ids"] }),
    ]);

    if (!follower || !target) {
      return { status: "error", code: 404, message: "User not found" };
    }

    await sequelizeConn.transaction(async (t) => {
      const targetStr = String(targetUserId);
      const followerStr = String(followerId);

      // Remove from follower.following_ids by locating path and JSON_REMOVE
      await sequelizeConn.query(
        `UPDATE users
         SET following_ids = (
           CASE
             WHEN JSON_SEARCH(COALESCE(following_ids, JSON_ARRAY()), 'one', :targetStr) IS NOT NULL
             THEN JSON_REMOVE(
               COALESCE(following_ids, JSON_ARRAY()),
               JSON_UNQUOTE(JSON_SEARCH(COALESCE(following_ids, JSON_ARRAY()), 'one', :targetStr))
             )
             ELSE COALESCE(following_ids, JSON_ARRAY())
           END
         )
         WHERE id = :followerId`,
        { replacements: { followerId, targetStr }, transaction: t }
      );

      // Remove from target.followers_ids
      await sequelizeConn.query(
        `UPDATE users
         SET followers_ids = (
           CASE
             WHEN JSON_SEARCH(COALESCE(followers_ids, JSON_ARRAY()), 'one', :followerStr) IS NOT NULL
             THEN JSON_REMOVE(
               COALESCE(followers_ids, JSON_ARRAY()),
               JSON_UNQUOTE(JSON_SEARCH(COALESCE(followers_ids, JSON_ARRAY()), 'one', :followerStr))
             )
             ELSE COALESCE(followers_ids, JSON_ARRAY())
           END
         )
         WHERE id = :targetId`,
        { replacements: { followerStr, targetId: targetUserId }, transaction: t }
      );
    });

    const updatedFollower = await User.findByPk(followerId, { attributes: ["id", "following_ids"] });
    const updatedTarget = await User.findByPk(targetUserId, { attributes: ["id", "followers_ids"] });

    const following = toArray(updatedFollower.following_ids);
    const followers = toArray(updatedTarget.followers_ids);

    return {
      status: "success",
      code: 200,
      message: "Unfollowed successfully",
      data: {
        followerId,
        targetUserId,
        followingCount: following.length,
        followersCount: followers.length,
      },
    };
  } catch (error) {
    try {
      const follower = await User.findByPk(followerId);
      const target = await User.findByPk(targetUserId);
      if (!follower || !target) {
        return { status: "error", code: 404, message: "User not found" };
      }
      let following = toArray(follower.following_ids);
      let followers = toArray(target.followers_ids);
      following = following.filter((id) => id !== targetUserId);
      followers = followers.filter((id) => id !== followerId);
      await follower.update({ following_ids: following });
      await target.update({ followers_ids: followers });
      return {
        status: "success",
        code: 200,
        message: "Unfollowed successfully",
        data: { followerId, targetUserId, followingCount: following.length, followersCount: followers.length },
      };
    } catch (e2) {
      return { status: "error", code: 500, message: e2.message };
    }
  }
};
// Get user overview: details, followers, following, post count, all post details
  export const getUserOverviewService = async (userId) => {
    // Get user details
    const user = await User.findByPk(userId, {
      attributes: [
        "id", "first_name", "last_name", "user_name", "role", "avatarUrl", "followers_ids", "following_ids"
      ]
    });
    if (!user) return null;

    // Followers and following
    const followers = Array.isArray(user.followers_ids)
      ? user.followers_ids
      : user.followers_ids ? JSON.parse(user.followers_ids) : [];
    const following = Array.isArray(user.following_ids)
      ? user.following_ids
      : user.following_ids ? JSON.parse(user.following_ids) : [];

    // Get all posts by user
    const posts = await postRepo.getPostsByUserId(userId);
    const postCount = posts.length;

    return {
      user: user.toJSON(),
      totalFollowers: followers.length,
      totalFollowing: following.length,
      postCount,
      posts: posts.map(post => post.toJSON()),
    };
  };