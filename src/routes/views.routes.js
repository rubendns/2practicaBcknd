import { Router } from "express";
import cookieParser from 'cookie-parser';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PRIVATE_KEY } from '../utils.js';
import productsDao from "../dao/mdbManagers/products.dao.js";
import cartsDao from "../dao/mdbManagers/carts.dao.js";
import userModel from "../dao/models/user.model.js";

const viewsRouter = Router();

viewsRouter.use(cookieParser("CoderS3cr3tC0d3"));

viewsRouter.get("/", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});

function auth(req, res, next) {
  if (req.session.user && req.session.admin) {
      return next();
  } else {
      return res.status(403).send("User not authorized to enter this resource.");
  }
}

viewsRouter.get('/private', auth, (req, res) => {
  res.send("Si estas viendo esto es porque pasaste la autorización a este recurso!");
});


viewsRouter.get("/productManager", async (req, res) => {
  const products = await productsDao.getAllProducts();
  res.render("productManager", {
    title: "Products Mongoose",
    products,
  });
});

viewsRouter.get("/chat", (req, res) => {
  res.render("chat", {
    title: "Chat",
  });
});

viewsRouter.get("/products", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { page, limit, sort } = req.query;
  const token = req.cookies.jwtCookieToken;
  console.log("Authenticated user: ", req.user.name);
  if (!token) {
    return res.render('products', { title: 'Products', products: [], user: null });
  }

  try {
    const decodedToken = jwt.verify(token, PRIVATE_KEY);
    const user = decodedToken.user;

    const products = await productsDao.getAllProducts(page, limit, sort);

    res.render("products", {
      title: "Products",
      products,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
    });

  } catch (error) {
    return res.render('products', { title: 'Products', products: [], user: null });
  }
});

viewsRouter.get("/carts/", async (req, res) => {
  const carts = await cartsDao.getAllCarts();
  res.render("carts", {
    title: "Carts",
    carts,
  });
});

viewsRouter.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  const cart = await cartsDao.getCartById(cid);
  res.render("cart", {
    title: "Cart",
    cart,
  });
});

export { viewsRouter };
