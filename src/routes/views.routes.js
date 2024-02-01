import { Router } from "express";
import cookieParser from 'cookie-parser';
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
      return res.status(403).send("Usuario no autorizado para ingresar a este recurso.");
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

viewsRouter.get("/products", async (req, res) => {
  const { page, limit, sort } = req.query;
  const products = await productsDao.getAllProducts(page, limit, sort);

  res.render("products", {
    title: "Products",
    products,
    user: req.session.user,
  });
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

// viewsRouter.get("/logout", (req, res) => {
//   req.session.destroy((error) => {
//     if (error) {
//       res.json({ error: "Error logout", msg: "Error closing session" });
//     }
//     res.send("Session closed correctly!");
//   });
// });

export { viewsRouter };
