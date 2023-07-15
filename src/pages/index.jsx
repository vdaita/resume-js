'use client'

import 'katex/dist/katex.min.css';
import React, {useEffect, useRef, useState} from 'react';
import { Button, ButtonGroup, Textarea, VStack, HStack, Box, Link, Input, Heading, Text, Container, useToast, Spinner, GlobalStyle} from '@chakra-ui/react';
import Latex from 'react-latex-next';
import mammoth from 'mammoth/mammoth.browser';

export default function Index() {

  const inputBtnRef = useRef(null);
  const [file, setFile] = useState();
  const [genName, setGenName] = useState("");
  const [resume, setResume] = useState("");

  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultFocus, setResultFocus] = useState(false);

  const latexBox = useRef(null);
  
  const [result, setResult] = useState("");

  let onFileAdd = async (e) => {
    if(e.target.files.length > 0){
      setFile(e.target.files[0]);
      let targetFile = e.target.files[0];
      if(targetFile.name.split(".").at(-1) === "pdf"){
        const url = URL.createObjectURL(targetFile.blob);
        
      } else {
        // dealing with a .docx
        console.log(targetFile);
        let arrayBuf = await new Response(targetFile.blob).arrayBuffer();
        console.log(arrayBuf);
        let rawText = await mammoth.extractRawText({arrayBuffer: arrayBuf});
        setResume(rawText);
      }
    }
  }

  let query = async () => {
    setLoading(true);
    let res = await fetch("/api/", {
      method: "POST",
      body: JSON.stringify({
        resume: resume,
        job: desc        
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
    
    setResult(res.body.message);

    setLoading(false);
  }

  // paid feature: allow people to upload multiple job descriptions at the same time?
  // let save = async() => {
    
  // }


  return (
    <main>
      {/* <Container alignChildren="center">
      </Container> */}
      <Container alignchildren="center">
        {!resultFocus && 
          <div className="noprint">
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
            {!loading && <Button onClick={() => query()}>Submit</Button>}
            {loading && <Spinner/>}
            <Text>CTRL-P/CMD-P will show only the result.</Text>
          </div>
        }
        <Latex ref={latexBox}>{result}</Latex> 
      </Container>
    </main>
  )
}
