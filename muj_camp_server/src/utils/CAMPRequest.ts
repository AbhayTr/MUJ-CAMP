import { Request } from "express";

import User from "../auth/user";

interface CAMPRequest extends Request {
    user?: User;
}

export default CAMPRequest;