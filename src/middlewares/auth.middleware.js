import ApiError from "../utils/ApiErrors.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    // JWT verification logic here...
    next();
})