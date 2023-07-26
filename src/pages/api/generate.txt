import { OpenAI } from "openai-streams";

export default async function handler(req) {

    const {resume, job, outputType} = await req.json();
    if(resume && job && outputType){
        console.log("can run");
        let prompt = `JOB DESCRIPTION:

        ${job}
        
        CURRENT RESUME:
        
        ${resume}
        
        INSTRUCTION:
        
        You are an expert ${outputType} writer with many years of experience helping people get jobs and working within HR departments. Generate a highly effective ${outputType} each in Markdown format based on the above current resume and optimized to get hired for the above job description. Do not use any Markdown extensions or fonts that don't come standard. Do not list anything on the new resume that's not based on content from the above current resume. The resume must be capable of getting past HR Applicant Tracking System filters.`
    
        console.log("prompt created");
    
        const stream = await OpenAI(
            "chat",
            {
            model: "gpt-3.5-turbo",
            messages: [{role: "system", content: prompt}],
            },
            { apiKey: process.env.OPENAI_API_KEY }
        );
    
        return new Response(stream);
    } else {
        console.log("can't run")
        return new Response();
    }
}

export const config = {
  runtime: "edge"
};