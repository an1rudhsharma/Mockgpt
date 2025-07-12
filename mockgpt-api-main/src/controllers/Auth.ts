import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { validateUserInput } from "../utils/Validation";
import { CustomRequest, User } from "../interfaces/Types";
import { createUser, findUserByEmail } from "../db/User.Dynamo";
import { generateToken } from "../utils/AuthUtils";
dotenv.config();

// SignUp Handler
export const signup = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        // Validate user inputs
        validateUserInput("signup", { email, password, name });

        // Check if user with email already exists
        const existinguser = await findUserByEmail(email);

        if (existinguser) {
            res.status(409).json({ message: "User Already Exists" });
            return;
        }

        //  Create a new user
        const hashedPassword = await bcrypt.hash(password, 10);

        const user: User = {
            userId: uuidv4(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await createUser(user);

        res.status(200).json({ message: "User registered Successfully" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error during signup: ", err.message);
            res.status(500).json({ message: err.message });
        } else {
            console.error("Unexpected error during signup: ", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

// SignIn Handler
export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Validate user inputs
        validateUserInput("signin", { email, password });

        // Find user by email
        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
            res
                .status(404)
                .json({ message: "User doesn't exist. Please register first." });
            return;
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password,
        );

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        // Generate JWT token and set in cookies
        const token = generateToken(existingUser.email);

        res.cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res
            .status(200)
            .json({
                message: "Sign in successful",
                user: { name: existingUser.name, email: existingUser.email },
            });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error during signup: ", err.message);
            res.status(500).json({ message: err.message });
        } else {
            console.error("Unexpected error during signup: ", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

// Verify cookies
export const verifyMe = async (req: CustomRequest, res: Response) => {
    const verifiedEmail = req.verifiedEmail;

    if (verifiedEmail) {
        const user = await findUserByEmail(verifiedEmail);

        if (user) {
            res
                .status(200)
                .json({ valid: true, user: { name: user.name, email: user.email } });
            return;
        }
    }

    res.status(401).json({ valid: false, message: "Unauthorized" });
}