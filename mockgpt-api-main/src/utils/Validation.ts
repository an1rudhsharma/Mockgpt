import { User } from "../interfaces/Types";

export const validateUserInput = (
    type: "signin" | "signup",
    user: Partial<User>,
) => {
    if (type == "signup" && !user.name) {
        throw new Error("Missing required fields: Name.");
    }
    if (!user.email) {
        throw new Error("Missing required fields: Email.");
    }
    if (!user.password) {
        throw new Error("Missing required fields: Password.");
    }
    return true;
};