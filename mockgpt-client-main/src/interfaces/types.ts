export interface Captions { id: number, sender: string, text: string, timestamp: Date }

export interface User {
    userId :string,
    name: string,
    email: string,
    password: string
}

export type InterviewSubject = 'backend' | 'frontend' | 'analytics' | 'data-science' | 'product'

export interface Interview {
    interviewId: string
    userId: string
    interviewType: string
    date: string
    duration: {hours:number,minutes:number,seconds:number}
    time: number
}

export interface Review {
    "overall": {
        "feedback": string,
        "score": number
    },
    "question_summary": {
        "question1": string,
        "answer1": string,
        "question2": string,
        "answer2": string
    },
    "skills": {
        "problem_solving": {
            "score": number,
            "details": string
        },
        "communication": {
            "score": number,
            "details": string
        }
    }
}