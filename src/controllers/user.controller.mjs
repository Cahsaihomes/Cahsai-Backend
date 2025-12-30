import * as userService from "../app/services/user.service.mjs";

export const register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    return res.status(result.code).json(result);
  } catch (err) {
    console.log(err, "err");
    res.status(400).json({ error: err.message });
  }
};

export const createPaymentDetails = async (req, res) => {
  try {
    const result = await userService.createPaymentDetails(req.body);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAgentProfile = async (req, res) => {
  try {
    const { profilePic } = req?.files || null;
    const result = await userService.createAgentProfile(req.body, profilePic);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { status, message, token, user } = await userService.loginUser(
      req.body
    );
    if (status === "error")
      return res.status(401).json({ status, message, user });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

    res.status(200).json({ status, message, data: { token, user } });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const { status, message } = await userService.verifyOtp({ email, otp });

    if (status === "error") {
      return res.status(400).json({ status, message });
    }

    res.status(200).json({ status, message });
  } catch (err) {
    next(err);
  }
};
export const requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { status, message } = await userService.requestOTP(email);

    if (status === "error") {
      return res.status(400).json({ status, message });
    }

    res.status(200).json({ status, message });
  } catch (err) {
    next(err);
  }
};
export const verifyForgetPasswordOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const { status, message } = await userService.verifyForgetPasswordOTP({
      email,
      otp,
    });

    if (status === "error") {
      return res.status(400).json({ status, message });
    }

    res.status(200).json({ status, message });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const { status, message } = await userService.resetPassword({
      email,
      newPassword,
    });

    if (status === "error") {
      return res.status(400).json({ status, message });
    }

    res.status(200).json({ status, message });
  } catch (error) {
    next(error);
  }
};
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, message, data } = await userService.getUserProfile(userId);

    if (status === "error") {
      return res.status(404).json({ status, message });
    }

    res.status(200).json({ status, message, data });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { profilePic } = req?.files || null;
    const { identity } = req?.files || null;
    const { cnic } = req?.files || null;
    const { passport } = req?.files || null;

    const { status, message, user, token } =
      await userService.updateUserProfile(
        userId,
        req.body,
        profilePic,
        identity,
        cnic,
        passport
      );

    if (status === "error") {
      return res.status(400).json({ status, message });
    }

    res.status(200).json({ status, message, token, user });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    const result = await userService.updatePassword(
      userId,
      currentPassword,
      newPassword
    );
    return res.status(result.status === "success" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "No token provided",
      });
    }

    const result = await userService.logoutUser(token);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in logout:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.addPaymentMethod(req.body, userId);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.deletePaymentMethod(req.body, userId);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.getPaymentMethod(userId);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bank_verification } = req?.files || null;
    const result = await userService.addBankDetails(
      req.body,
      userId,
      bank_verification
    );
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.getNotificationPreferences(userId);
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.toggleNotificationPreferences(
      userId,
      req.body
    );
    return res.status(result.code).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const targetUserId = Number(req.params.id);
    const result = await userService.followUser(followerId, targetUserId);
    return res.status(result.code ?? (result.status === "success" ? 200 : 400)).json(result);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const targetUserId = Number(req.params.id);

    const result = await userService.unfollowUser(followerId, targetUserId);
    return res.status(result.code ?? (result.status === "success" ? 200 : 400)).json(result);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// Get user overview (details, followers, following, post count, post details)
export const getUserOverview = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const overview = await userService.getUserOverviewService(userId);
    if (!overview) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: overview });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
