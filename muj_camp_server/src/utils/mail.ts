import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";

class CAMPMailer {

    private _transporter: Transporter<SentMessageInfo>;
    private _creds: Object = {
        host: process.env.M_HOST,
        port: process.env.M_PORT,
        secureConnection: true,
        auth: {
            user: process.env.M_MAIL,
            pass: process.env.M_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    };

    constructor() {
        this._transporter = nodemailer.createTransport(this._creds);
    }

    async sendOTP(authEmail: string, authName: string, otp: string) {
        let mailOptions: Object = {
            from: `"MUJ CAMP" <${process.env.M_MAIL}>`,
            to: authEmail,
            subject: "OTP to access MUJ CAMP 🎓",
            html : `
            <html>
                <head>
                    <meta name="color-scheme" content="light dark">
                    <meta name="supported-color-schemes" content="light dark">
                    <style>

                        .manipalLogo {
                            width: 30%;
                            height: auto;
                        }

                        .campLogo {
                            width: 40%;
                            height: auto;
                            float: right;
                        }

                        .doarLogo {
                            width: 9%;
                            height: auto;
                        }

                        .dark {
                            display: none;
                        }

                        .light {
                            display: unset;
                        }

                        @media (prefers-color-scheme: dark) {
                            
                            .doarLogo {
                                background: url("${process.env.M_ASSET}/assets/camp/white.jpg");
                                border-radius: 50%;
                            }

                            .dark {
                                display: unset;
                            }

                            .light {
                                display: none;
                            }

                        }
                        
                    </style>
                </head>
                <body style="border: 8px solid;border-radius: 18px;border-color: darkorange; background-color: #ffdab9; font-size: 20px;padding: 10px;padding-top: 1px;padding-bottom: 4px;">
                    <div style="margin-top: 0.4em;">
                        <img src="${process.env.M_ASSET}/assets/camp/logo_white.png" class="manipalLogo dark">
                        <img src="${process.env.M_ASSET}/assets/camp/logo.png" class="manipalLogo light">
                        <img src="${process.env.M_ASSET}/assets/camp/doar.png" class="doarLogo">
                        <img src="${process.env.M_ASSET}/assets/camp/camp_logo_white.png" class="campLogo dark">
                        <img src="${process.env.M_ASSET}/assets/camp/camp_logo.png" class="campLogo light">
                    </div>
                    <div>
                        <p style="font-size:1em">Hey ${authName} 👋<br><br>Welcome to MUJ CAMP 🎓! Your One Time Password (OTP) 🔐 to continue is:<br><br><b style="width: 100%; display: block; text-align: center; font-size: 2em; font-family: sans-serif;">${otp}</b><br>If you are not trying to access MUJ CAMP, then you can simply ignore this mail 📧, as some friend of yours might be playing with you 😂!<br><br><b>Thanks and regards 👍,<br>MUJ CAMP 🎓<br></b></p>
                    </div>
                </body>
            </html>
            `
        };
        this._transporter.sendMail(mailOptions, function(mailError, mailInfo) {
            if (mailError) {
                console.log("E: " + mailError);
            }
        });
    }

}

export default CAMPMailer;