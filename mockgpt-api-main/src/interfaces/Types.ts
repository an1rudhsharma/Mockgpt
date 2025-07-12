import { Request } from "express";

export interface User {
    userId: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
};

export interface Interview {
    interviewId: string,
    userId: string,
    conversationTranscript: string,
    callOutcome: string,
}

export interface CustomRequest extends Request {
    verifiedEmail?: string;
}