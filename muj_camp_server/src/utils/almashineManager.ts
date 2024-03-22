class AlmaShineManager {

    #sessionCookie!: string | null;
 
    async startSession() {
        await this.#updateSessionCookie();
    }

    async #updateSessionCookie() {
        await fetch("https://mujalumni.in/account?cid=359", {
            "credentials": "include"
        }).then(response => {
            this.#sessionCookie = response.headers.get("set-cookie");
        });
        await this.#login();
    }

    async #login() {
        await fetch("https://mujalumni.in/api/login/loginUser", {
            "headers": {
                "cookie": this.#sessionCookie!
            },
            "body": `{\"email\":\"${process.env.MAS_MAIl}\",\"password\":\"${process.env.MAS_PASS}\",\"force_signup_cid\":\"359\"}`,
            "method": "POST"
        }).then(response => {
            this.#sessionCookie = response.headers.get("set-cookie");
            console.log(this.#sessionCookie);
        });
    }

}

export default AlmaShineManager;