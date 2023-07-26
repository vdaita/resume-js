'use client'

// import 'katex/dist/katex.min.css';
import React, {useEffect, useRef, useState} from 'react';
import { Button, ButtonGroup, Textarea, VStack, HStack, Box, Link, Input, Heading, Text, Container, useToast, Spinner, GlobalStyle} from '@chakra-ui/react';
// import Latex from 'react-latex-next';
import mammoth from 'mammoth/mammoth.browser';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';

// import html2pdf from 'html2pdf.js/dist/html2pdf.min'
import ReactToPrint, { useReactToPrint } from 'react-to-print';
// import { useTextBuffer, StreamingText } from "nextjs-openai";
// import { useCompletion } from 'ai/react'
// import { useDebouncedCallback } from 'use-debounce'

export default function Index() {

  const inputBtnRef = useRef(null);
  const [file, setFile] = useState();
  const [genName, setGenName] = useState("");
  const [resume, setResume] = useState("");

  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultFocus, setResultFocus] = useState(false);
  
  const [result, setResult] = useState("");

  const [data, setData] = useState({

  });

  // const { buffer, refresh, cancel, done } = useTextBuffer({ 
  //   url: "/api/generate",
  //   throttle: 100,
  //   data
  // });

  // const { complete, completion, isLoading } = useCompletion({
  //   api: '/api/generate'
  // });

  // const handlePrint = () => {
  //   console.log(markdownBox, markdownBox.current);
  //   useReactToPrint({
  //     content: () => markdownBox.current
  //   })
  // }

  // useEffect(() => {
  //   console.log(buffer);
  //   let addbuff = "";
  //   for(var i = 0; i < buffer.length; i++){
  //     addbuff += buffer[i];
  //   }
  //   setResult(addbuff);
  // }, [buffer]);

  const handlePrint = useReactToPrint({
    content: () => markdownBoxRef.current
  });

  let showCurrent = () => {
    console.log(markdownBoxRef.current, markdownBoxRef);
  }

  let onFileAdd = async (e) => {
    if(e.target.files.length > 0){
      setFile(e.target.files[0]);
      let targetFile = e.target.files[0];
      if(targetFile.name.split(".").at(-1) === "pdf"){
        const url = URL.createObjectURL(targetFile.blob());
        
      } else {
        // dealing with a .docx
        console.log(targetFile);
        const blob = new Blob([targetFile], {type: targetFile.type});
        console.log(blob);
        let arrayBuf = await new Response(blob).arrayBuffer();
        console.log(arrayBuf);
        let rawText = (await mammoth.extractRawText({arrayBuffer: arrayBuf})).value;
        console.log(rawText);
        setResume(rawText);
      }
    }
  }

  let query = async (outputType) => {
    setLoading(true);

    console.log("loading is true");

    // setData({
    //   resume: resume,
    //   job: desc,
    //   outputType: outputType
    // });

    let res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        resume: resume,
        job: desc,
        outputType: outputType        
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });

    console.log("Response: ", res);

    if(!res.ok){
      throw new Error(res.statusText);
    }

    const data = res.body;
    console.log(data);
    if(!data){
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while(!done){
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      console.log("Adding chunk ", chunkValue);
      setResult((result) => result + chunkValue);
    }

    setLoading(false);
  }

  // https://dev.to/kazmi066/converting-jsx-to-downloadable-pdf-in-react-20bh
  // const printHandler = () => {
  //   const printElement = markdownBox.current;
  //   html2pdf().from(printElement).save()
  // }

  // paid feature: allow people to upload multiple job descriptions at the same time?
  // let save = async() => {
    
  // }

  let RenderedMarkdown = () => (
    <div>
      <ReactMarkdown components={ChakraUIRenderer()} children={result}></ReactMarkdown> 
    </div>
  )


  return (
    <main >
      {/* <Container alignChildren="center">
      </Container> */}
      <Container alignchildren="center">
        <div className="print-hide">
          <Heading>Resume.js</Heading>
          <Box padding={2} flex={1}>
            <Text fontSize="lg">Current Resume</Text>
            <Input ref={inputBtnRef} style={{display: 'none'}} type="file" multiple accept="application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileAdd} value={[]}/>
            <Button colorScheme='teal' variant='solid' onClick={() => inputBtnRef.current.click()}>
              Select file
            </Button>
            <Text>{file ? file.filename : ""}</Text>
            <Text fontSize="sm">.doc, or .docx accepted</Text>

            <Textarea flex={1} placeholder={"Copy and paste your resume manually or upload a file"} height={"400"} value={resume} onChange={(e) => setResume(e.target.value)}>
            </Textarea>
          </Box>
          <Box padding={2}>
            <Text fontSize="lg">Job description</Text>
            
            <Textarea onChange={(e) => setDesc(e.target.value)} value={desc}>
            </Textarea>
          </Box>
          {!loading && <Button margin={2} onClick={() => query("resume")}>Generate Resume</Button>}
          {!loading && <Button margin={2} onClick={() => query("cover letter")}>Generate Cover Letter</Button>}
          {loading && <Spinner/>}
          <br/>
          {result.length > 0 && 
            <Box padding={2}>
              <Text fontSize="lg">Edit Result (Markdown)</Text>
              {/* <StreamingText buffer={buffer} fade={600}/> */}
              <Textarea height={"400"}  onChange={(e) => setResult(e.target.value)} value={result}/>
              <Button margin={2} onClick={() => window.print()}>Print</Button>
              {/* {result.length > 0 && <ReactToPrint
                trigger={() => <Button margin={2}>Print</Button>}
                content={() => markdownBox.current}/>} */}
            </Box>
          }

          
        </div>

        <RenderedMarkdown/>
      </Container>
    </main>
  )
}
