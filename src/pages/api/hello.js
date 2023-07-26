// https://devblog.pedro.resende.biz/how-to-create-a-file-upload-api-using-next-js

// have this file just be for sending a request to openai

// import type { NextApiRequest, NextApiResponse } from 'next';

import { ChatOpenAI } from "../../../node_modules/langchain/chat_models/openai";
import { ChatMessage, HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { CallbackManager } from "langchain/callbacks";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const config = {
  runtime: "edge"
};

export default async function handler(req, res) {
  try {
    // res.writeHead(200, { 
    //   "Content-Type": "application/octet-stream"
    // , "Transfer-Encoding": "chunked" });
    res.headers.set({
      "Content-Type": "application/octet-stream",
      "Transfer-Encoding": "chunked"
    })
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    // console.log(req);
    const {resume, job, outputType} = req.body;
    // console.log(req.body);

    let s = "";
    const chatStreaming = new ChatOpenAI({
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          // console.clear();
          // s += token;
          // console.log(s);
          handleNewToken(token);
        },
      }),
    });

    // const responseD = await chatStreaming.call([
    //   new HumanChatMessage("Write me a song about sparkling water."),
    // ]);

    function handleNewToken(token) {
      res.write(`${token}`);
    }

    await chatStreaming.call([
      new SystemChatMessage(`You are an expert in ${outputType} writing with 30 years of experience. You use Markdown. Here is the job I am applying for: ${job}. Here's the context of my resume: ${resume}`),
      new HumanChatMessage(`Please generate a new ${outputType} based on my resume context and my job description.`)
    ]);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

// export const config = {
//   runtime: "edge"
// };

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_SECRET_KEY
// });
// const openai = new OpenAIApi(configuration);

// type Data = {
//   message?: string
// };

// const handler = async (
//   req: Request,
// ): Promise<Response> => {
//   try{
//     const {resume, job, outputType} = (await req.json()) as {
//       resume?: string;
//       job?: string;
//       outputType?: string;
//     }
//     // console.log("Request: ", req.body.toString().substring(0, 100));

//     let fileContent = resume;
//     let jobDesc = job;
  
//     // send information to the HuggingFace/OpenAI API
//     if(fileContent !== undefined && jobDesc !== undefined){

//       console.log("both fileContent and jobDesc exist");

//       let prompt = `JOB DESCRIPTION:

//       ${jobDesc}
      
//       CURRENT RESUME:
      
//       ${fileContent}
      
//       INSTRUCTION:
      
//       You are an expert resume writer with many years of experience helping people get jobs and working within HR departments. Generate a highly effective ${outputType} each in Markdown format based on the above current resume and optimized to get hired for the above job description. Do not use any Markdown extensions or fonts that don't come standard. Do not list anything on the new resume that's not based on content from the above current resume. The resume must be capable of getting past HR Applicant Tracking System filters.`

//       console.log("prompt created");

//       // const chatCompletion = await openai.createChatCompletion({
//       //   model: "gpt-3.5-turbo",
//       //   messages: [{role: "user", content: prompt}],
//       //   stream: true
//       // });

//       const completion = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo-16k-0613",
//         messages: [{role: "user", content: prompt}],
//         stream: true
//       });

//       console.log("created completion variable");

//       const stream = new ReadableStream({
//         async start(controller) {
//           const encoder = new TextEncoder()
    
//           for await (const part of completion) {
//             const text = part.choices[0]?.delta.content || ''
//             const chunk = encoder.encode(text)
//             controller.enqueue(chunk)
//           }
//           controller.close()
//         },
//       })

//       console.log("Created stream variable");

//       return new Response(stream);

//       // console.log("Chat completed: ", chatCompletion.data);


//       // res.status(200).send({message: chatCompletion.data.choices[0].message?.content});
//     } else {
//       console.error("Sent incomplete input");
//       return new Response();
//     }

//     // using social logins instead of email will probably reduce shareability significantly
//   } catch (err: any) {
//     console.error("Exception", err);
//     return new Response();
//   }
// }

// export default handler;