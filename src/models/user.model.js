import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema (
    {
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
    trim: true
  },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
   fullName: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
   avatar: {
    type: String, // cloudinary URL
    required: true
  },
   coverImage: {
    type: String
  },
  watchHistory: [
    {
        type: Schema.Types.ObjectId,
        ref: "video"
    },
  ],
  password: {
    type: String,
    required: [true, 'password is required']
  },
  refreshToken: {
    type: String
  },

},
{
    timestamps: true
}
)

userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function 
(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateAccessAndRefreshTokens = async function(){
    try {
        const accessToken = this.generateAccessToken();
        const refreshToken = this.generateRefreshToken();

        this.refreshToken = refreshToken;
        await this.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

export const User = mongoose.model("User",userSchema);