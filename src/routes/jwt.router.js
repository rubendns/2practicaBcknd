import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import passport from "passport";
import { isValidPassword } from "../utils.js";
import { generateJWToken } from "../utils.js";

const router = Router();

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] }),
    async (req, res) => {}
);

router.get(
    "/githubcallback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "/github/error",
    }),
    async (req, res) => {
        const user = req.user;

        // conJWT
        const tokenUser = {
       //name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role,
        };
        const access_token = generateJWToken(tokenUser);
        //console.log(access_token);
        res.cookie("jwtCookieToken", access_token, {
        maxAge: 60000,
        //httpOnly: true, //No se expone la cookie
        httpOnly: false //Si se expone la cookie
        });
        res.redirect("/users");
    }
);

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            console.warn("User doesn't exist with email: " + email);
            return res.status(204).send({
                error: "Not found",
                message: "User not found with email: " + email,
            });
        }

        if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials for user: " + email);
            return res.status(401).send({
                status: "error",
                error: "Invalid username or password!",
            });
        }

        const tokenUser = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role: user.role,
        };

        const access_token = generateJWToken(tokenUser);

        res.cookie("jwtCookieToken", access_token, {
            maxAge: 60000,
            httpOnly: false,
        });

        // Incluye la información del usuario en la respuesta
        res.send({
            status: "success",
            message: "Login success!",
            user: tokenUser,
        });
        console.log('Usuario enviado al frontend:', tokenUser);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "error",
            error: "Internal application error.",
        });
    }
});

router.post("/register", async (req, res, next) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
        console.log(`User with email ${req.body.email} already exists.`);
        return res.redirect("/api/jwt/fail-register");
        }
        passport.authenticate("register", {
        failureRedirect: "/api/jwtfail-register",
        successRedirect: "/api/jwt/success-register",
        })(req, res, next);
    } catch (error) {
        console.error("Error during registration:", error);
        res
        .status(500)
        .send({ status: "error", message: "Error registering user." });
    }
});

router.get("/success-register", (req, res) => {
    console.log("Registering the following new user:" + req.user.email);
    res
        .status(200)
        .send({ status: "success", message: "User registered successfully." });
});

router.get("/fail-register", (req, res) => {
    res.status(401).send({ error: "Failed to process register!" });
});

router.post("/logout", (req, res) => {
    const userName =
        req.session.user && req.session.user.name
        ? req.session.user.name
        : "Unknown User";
    req.session.destroy((err) => {
        if (err) {
        console.error("Logout error:", err);
        return res
            .status(500)
            .send({ status: "error", msg: "Internal Server Error" });
        }
        console.log(`User ${userName} logged out successfully.`);
        res.redirect("/users/login");
    });
});

export default router;
