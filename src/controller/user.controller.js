import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js'
import { uploadOnCloud } from '../utils/cloudinary.js'
import { ApiSuccess } from '../utils/apiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    // get user Details from frontend
    const { userName, email, fullName, password } = req.body
    console.log(userName);
    // validate those details 
    if (
        [fullName, userName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // check already exists check by email and userName
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or userName is already exists");
    }

    // check for images and avatar
    // upload them to cloudinary , avatar

    //const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)) {
        coverImageLocalPath = req.files.coverImage[0]?.path
    }
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar && req.files.avatar.length > 0)) {
        avatarLocalPath = req.files.avatar[0].path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloud(avatarLocalPath)
    const coverImage = await uploadOnCloud(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is not uploaded required");
    }

    // create user object 
    const userDetails = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || " ",
        email,
        password,
        userName: userName.toLowerCase()
    });

    const createdUser = await User.findById(userDetails._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiSuccess(200, createdUser, "User Registered successfully")
    )
});

const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const userInfo = User.findById(userId);

        const accessToken = userInfo.generateAccessToken();
        const refToken = userInfo.generateRefreshToken();

        userInfo.refreshToken = refToken
        await userInfo.save({ validateBeforeSave: false })

        return { accessToken, refToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}
const loginUser = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body;

    if (!userName || !email) {
        throw new ApiError(400, "Please Enter userName or Email");
    }
    
    const userDetails = await User.findOne({
        $or:[{userName},{email}]
    });

    let passwordCheck = await user.isPasswordCorrect(password);
    if(!passwordCheck)
        {
            throw new ApiError(400, "Invalid User credentials");
        }
   
    const {accessToken, refToken } =  await generateAccessAndRefreshTokens(userDetails._id);

    const loggedUser = await User.findById(userDetails._id).select("-password -refreshToken")

    const options = { 
        httpOnly : true,
        secure: true,
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refToken,options)
    .json(
        new ApiSuccess( 200, { user:loggedUser, accessToken, refreshToken },
            "User Logged In Successfully"
         )
    )
})

const logoutUser = asyncHandler (async (req,res)=>{
    await User.findByIdAndUpdate( 
        req.user._id, 
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = { 
        httpOnly : true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiSuccess(200,{},"User Logout successfully")
    );
})

export { registerUser, loginUser, logoutUser };