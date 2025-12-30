import express from "express";
import "./jobs/expireToursJob.mjs";
import userRoutes from "./routes/user.routes.mjs";
import postRoutes from "./routes/post.routes.mjs";
import tourRoutes from "./routes/tour.routes.mjs";
import agentDashboardRoutes from "./routes/dashboard.routes.mjs";
import postStatsRoutes from "./routes/postStats.routes.mjs";
import postCommentRoutes from "./routes/postComment.routes.mjs";
import buyerSavedPostRoutes from "./routes/buyerSavedPost.routes.mjs";
import buyerSharePostRoutes from "./routes/buyerSharePost.routes.mjs";
import buyerReviewPostRoutes from "./routes/buyerReviewPost.routes.mjs";
import chatRoutes from "./routes/chat.routes.mjs";
import stripeRoutes from "./routes/stripe.routes.mjs";
import paymentRoutes from "./routes/payment.routes.mjs";
import webhookRoutes from "./routes/webhook.routes.mjs";
import notificationRoutes from "./routes/notification.routes.mjs";
import errorHandler from "./middlewares/errorHandler.mjs";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["https://cahsai-one.vercel.app","https://cahsai-nine.vercel.app", "http://localhost:3000","http://localhost:3001", "https://cahsai-frontend-production.up.railway.app"],
    credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    optionsSuccessStatus: 204,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts-stats", postStatsRoutes);
app.use("/api/post-comments", postCommentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tour", tourRoutes);
app.use("/api/dashboard", agentDashboardRoutes);
app.use("/api/buyer-saved-posts", buyerSavedPostRoutes);
app.use("/api/buyer-shares-posts", buyerSharePostRoutes);
app.use("/api/buyer-reviews-posts", buyerReviewPostRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/webhook", webhookRoutes);

app.use(errorHandler);

export default app;
