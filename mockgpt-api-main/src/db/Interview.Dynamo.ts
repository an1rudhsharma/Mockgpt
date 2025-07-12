import { AttributeValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Interview_Table_Name } from "../config/Constants";
import dynamoUser from "./DynamoClient";
import { Interview } from "../interfaces/Types";

const fetchReviewbyInterviewId = async (interviewId: string) => {
    const params = {
        TableName: Interview_Table_Name,
        FilterExpression: "interviewId = :interviewId",
        ExpressionAttributeValues: { ":interviewId": { S: interviewId } },
    };

    try {
        const command = new ScanCommand(params);
        const response = await dynamoUser.send(command);

        return response.Count && response.Count > 0
            ? transformDynamoItem(response.Items![0])
            : null;
    } catch (error) {
        console.log(error);
        throw new Error("Error while searching User by email");
    }
}

// Helper function to transform a DynamoDB item into a Interview type
const transformDynamoItem = (item: Record<string, AttributeValue>) => {
    return {
        conversationTranscript: item.conversationTranscript.S ? item.conversationTranscript.S : '',
        callOutcome: item.callOutcome.S ? item.callOutcome.S : '',
    };
};

export { fetchReviewbyInterviewId }