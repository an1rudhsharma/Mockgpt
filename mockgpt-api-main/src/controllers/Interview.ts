import { Request, Response } from "express";
import { fetchReviewbyInterviewId } from "../db/Interview.Dynamo";

export const InterviewReviewById = async (req: Request, res: Response) => {
    const { interviewId } = req.params;
    try {
        const data = await fetchReviewbyInterviewId(interviewId);

        res.status(200).json({ message: "Successfull", data })
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
}