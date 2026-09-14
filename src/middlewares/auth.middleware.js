import ApiError from "../utils/ApiErrors.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // Cookie ya header se token nikalna
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Token verify
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Database se user find karna
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            //Invalid token ki surat mai
            throw new ApiError(401, "Invalid Access Token");
        }

        // Request object mai user attach kar dena
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token");
    }

});