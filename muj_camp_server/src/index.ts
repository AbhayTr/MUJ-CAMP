import dotenv from "dotenv";
dotenv.config();

import "./utils/init";

import express, { Application, Response } from "express";

import CAMPMailer from "./utils/mail";
import { CAMPDB } from "./utils/campdb";
import CAMPAuthManager from "./auth/auth";
import startWSServer from "./CampWSServer";
import CAMPRequest from "./utils/CAMPRequest";
import DOARDashboardManager from "./doar/dashboardManager";

var app: Application = express();

app.use(async (req: CAMPRequest, res: Response, next: Function) => {
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    await CAMPAuthManager.setUserDataIfAuthRequest(req, app);
    CAMPAuthManager.validateAccessToRequestedResource(req, res, next);

});
app.use(express.json());

app.get("/", function (req, res) {
    res.send(`
        <html>
            <body>
                <h1>Welcome to MUJ Collective Alumni Management Portal (CAMP) Server!</h1>
                <b>&copy; ${new Date().getFullYear()} Abhay Tripathi</b> (Reg. No. 219301226), B.Tech CSE (2021 to 2025), Manipal University Jaipur (MUJ)<br>
                <b>&copy; ${new Date().getFullYear()} Manipal University Jaipur</b> (MUJ)<br>
                <b>&copy; ${new Date().getFullYear()} Manipal University Jaipur Alumni Association</b> (MUJAA)
            </body>
        </html>
    `);
});

app.post("/signin/login", async (req: CAMPRequest, res: Response) => {
    CAMPAuthManager.handleSignIn(req, res, app);
});

app.post("/signin/validate", (req: CAMPRequest, res: Response) => {
    CAMPAuthManager.validateSignIn(req, res, app);
});

app.post("/auth/validate", (req: CAMPRequest, res: Response) => {
    CAMPAuthManager.validateToken(req, res, app);
});

app.get("/admin/doar/dashboard", (req: CAMPRequest, res: Response) => {
    app.locals.doarDashboardManager.handleVisualsListRequest(res);
});

app.post("/admin/doar/new", (req: CAMPRequest, res: Response) => {
    app.locals.doarDashboardManager.createNewVisual(req, res);
});

app.post("/admin/doar/delete", (req: CAMPRequest, res: Response) => {
    app.locals.doarDashboardManager.deleteVisual(req, res);
});

app.post("/admin/doar/update", (req: CAMPRequest, res: Response) => {
    app.locals.doarDashboardManager.updateVisual(req, res);
});

app.locals.campdb = new CAMPDB();
app.locals.campdbDoar = new CAMPDB();
app.locals.campdbDoarDashboard = new CAMPDB();
app.locals.campMailer = new CAMPMailer();

app.locals.campdb.connect().then(() => {
    app.locals.campdbDoar.connect().then(() => {
        app.locals.campdbDoarDashboard.connect().then(() => {
            app.listen(process.env.PORT, async () => {
                app.locals.doarDashboardManager = new DOARDashboardManager(app.locals.campdbDoarDashboard);
                console.clear();
                console.log(`\x1b[32mMUJ CAMP Server is live on:\n\nPort ${process.env.PORT} for HTTP Requests!\nPort ${process.env.WS_PORT} for WS Requests!\x1b[0m\n`);
                await startWSServer(app);
            });
        });
    });
});