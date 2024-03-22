import dotenv from "dotenv";
dotenv.config();

import "./utils/init";

import express, { Application, Request, Response } from "express";

import CAMPMailer from "./utils/mail";
import { CAMPDB } from "./utils/campdb";
import CAMPAuthManager from "./auth/auth";
import { setApp } from "./CampWSServer";

var app: Application = express();
setApp(app);

app.use((req: Request, res: Response, next: Function) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use(express.json());

app.get("/", function (req, res) {
    res.send(`
        <html>
            <body>
                <h1>Welcome to MUJ Convocation and Alumni Management Portal (CAMP) Server!</h1>
                <b>&copy; ${new Date().getFullYear()} Abhay Tripathi</b> (Reg. No. 219301226), B.Tech CSE (2021 to 2025), Manipal University Jaipur (MUJ)<br>
                <b>&copy; ${new Date().getFullYear()} Manipal University Jaipur</b> (MUJ)<br>
                <b>&copy; ${new Date().getFullYear()} Manipal University Jaipur Alumni Association</b> (MUJAA)
            </body>
        </html>
    `);
});

app.post("/signin/login", async (req: Request, res: Response) => {
    CAMPAuthManager.handleSignIn(req, res, app);
});

app.post("/signin/validate", (req: Request, res: Response) => {
    CAMPAuthManager.validateSignIn(req, res, app);
});

app.post("/auth/validate", (req: Request, res: Response) => {
    CAMPAuthManager.validateToken(req, res, app);
});

app.locals.campdb = new CAMPDB();
app.locals.campMailer = new CAMPMailer();

app.locals.campdb.connect().then(() => {
    app.listen(process.env.PORT, () => {
        //console.clear();
        console.log(`\x1b[32mMUJ CAMP Server is live on:\n\nPort ${process.env.PORT} for HTTP Requests!\nPort ${process.env.WS_PORT} for WS Requests!\x1b[0m`);
    });
});