import { AttributeValue, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { User } from "../interfaces/Types";
import { User_Table_Name } from "../config/Constants";
import dynamoUser from "./DynamoClient";

// Find a user by email
const findUserByEmail = async (email: string): Promise<User | null> => {
    const params = {
        TableName: User_Table_Name,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": { S: email } },
    };

    try {
        const command = new ScanCommand(params);
        const response = await dynamoUser.send(command);

        return response.Count && response.Count > 0
            ? transformDynamoItem(response.Items![0]) as User
            : null;
    } catch (error) {
        console.log(error);
        throw new Error("Error while searching User by email");
    }
};

// Create a new user
const createUser = async (user: User): Promise<void> => {
    const params = {
        TableName: User_Table_Name,
        Item: transformUserToDynamoItem(user),
    };

    try {
        const command = new PutItemCommand(params);
        await dynamoUser.send(command);
    } catch {
        throw new Error("Error while Creating a newUser in dynamoDB");
    }
};

// Helper function to transform a DynamoDB item into a User type
const transformDynamoItem = (item: Record<string, AttributeValue>): User => {
    return {
        userId: item.userId.S!,
        name: item.name.S!,
        email: item.email.S!,
        password: item.password.S!,
        createdAt: item.createdAt.S!,
        updatedAt: item.updatedAt.S!,
    };
};

// Helper function to transform a User type to DynamoDB Item format
const transformUserToDynamoItem = (user: User): Record<string, AttributeValue> => {
    return {
        userId: { S: user.userId },
        name: { S: user.name },
        email: { S: user.email },
        password: { S: user.password },
        createdAt: { S: user.createdAt },
        updatedAt: { S: user.updatedAt },
    };
};

export { findUserByEmail, createUser };