// https://devblog.pedro.resende.biz/how-to-create-a-file-upload-api-using-next-js

// have this file just be for sending a request to openai

import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from "openai";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY
});
const openai = new OpenAIApi(configuration);

type Data = {
  message?: string
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  try{

    console.log("Request: ", req.body.toString().substring(0, 100));

    let fileContent = req.body.resume;
    let jobDesc = req.body.job;
    let outputType = req.body.outputType;
  
    // send information to the HuggingFace/OpenAI API
    if(fileContent.length > 0 && jobDesc.length > 0){

      console.log("both fileContent and jobDesc exist");

      let prompt = `JOB DESCRIPTION:

      ${jobDesc}
      
      CURRENT RESUME:
      
      ${fileContent}
      
      INSTRUCTION:
      
      You are an expert resume writer with many years of experience helping people get jobs and working within HR departments. Generate a highly effective ${outputType} each in Markdown format based on the above current resume and optimized to get hired for the above job description. Do not use any Markdown extensions or fonts that don't come standard. Do not list anything on the new resume that's not based on content from the above current resume. The resume must be capable of getting past HR Applicant Tracking System filters.`

      const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}]
      });

      console.log("Chat completed: ", chatCompletion.data);

      res.status(200).send({message: chatCompletion.data.choices[0].message?.content});
    } else {
      console.error("Sent incomplete input");
      res.status(500).send({message: "Incomplete input"});
    }

    // using social logins instead of email will probably reduce shareability significantly
  } catch (err: any) {
    console.error("Exception", err);
    res.status(400).send({message: 'Error'});
  }
}

export default handler;