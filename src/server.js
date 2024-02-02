import express from "express";
import { ProductRouter } from "./routes/products.routes.js";
import { CartsRouter } from "./routes/carts.routes.js";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { viewsRouter } from "./routes/views.routes.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import messagesDao from "./dao/mdbManagers/messages.dao.js";
// import sessionsRouter from "./routes/sessions.routes.js";
import jwtRouter from "./routes/jwt.router.js";
import userViewRouter from "./routes/users.views.routes.js";
import cookieParser from 'cookie-parser';
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import githubLoginViewRouter from "./routes/github-login.views.router.js";

const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const mongoDBConnection = mongoose
  .connect(
    `mongodb+srv://rubendns:UZLxn4iAGvcRngUY@cluster0.6lu3kn4.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("MongoDB Atlas connected!");
  })
  .catch((error) => {
    console.error("MongoDB Atlas connection error:", error);
  });

mongoDBConnection;

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://rubendns:UZLxn4iAGvcRngUY@cluster0.6lu3kn4.mongodb.net/?retryWrites=true&w=majority`,
    }),
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    ttl: 60000,
    secret: "c0d1g0",
    resave: false,
    saveUninitialized: true,
  })
);

const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser("CoderS3cr3tC0d3"));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/", viewsRouter);
app.use("/users", userViewRouter);
// app.use("/api/sessions", sessionsRouter);
app.use("/api/jwt", jwtRouter);
app.use("/github", githubLoginViewRouter);
app.use("/api/products", ProductRouter);
app.use("/api/carts", CartsRouter);
app.get("/failure", (req, res) => {
  res.status(404).send("Error: Page not found");
});

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("message", async (data) => {
    console.log(data);
    await messagesDao.createMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});
