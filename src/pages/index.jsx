import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
// import {createClient} from '@supabase/supabase-js';
import supabase from '@/utils/supabase';
import { Button, SimpleGrid, ButtonGroup, Textarea, Label, VStack, Container, Stack, Icon, Arrow, useColorModeValue, HStack, Input, Heading, Text, Spinner, Flex, Spacer, Box, Link, useToast} from '@chakra-ui/react';
import axios from "axios";
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { loadStripe } from '@stripe/stripe-js';

const inter = Inter({ subsets: ['latin'] })
// const supabase = createClient('https://fmyzoqfdmuxtujffwngp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteXpvcWZkbXV4dHVqZmZ3bmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4Mjg4ODAsImV4cCI6MTk4OTQwNDg4MH0.5Ie-OTM75T7fig6Or2rtp9yJP_izV9zGmzBzPnv69dc');

// const STRIPE_PUBLIC = "pk_test_51Kb55ZK7c7Mb50VzqCqKpw8CKE2OaOaN6dXX9CSFOESTYCO8XzzYAyR3AKfy1T2wdh246mwmWc1xHDW0MxUQej6j00gzQGymvF";
const STRIPE_PUBLIC = process.env.NEXT_PUBLIC_STRIPE_PUBLIC;

export default function Home() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const inputBtnRef = React.useRef(null);

  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(false);

  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
         
  useEffect(() => {
    // console.log("stripe public: ", STRIPE_PUBLIC);
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      if(event == 'PASSWORD_RECOVERY'){
        console.log("Currently in password recovery mode.");
        setPasswordRecovery(true);
      }
      if(session){
        console.log("Current session user: ", session.user, session.user.email);
        setUser(session.user);
        isFreeTrialUsed();        
        setUserLoggedIn(true);
      } else {
        setUser(undefined);
        setFreeTrialUsed(false);
        setUserLoggedIn(false);
      }
    })
  }, []);

  let isFreeTrialUsed = async () => {
    const getUserResponse = await supabase.auth.getUser();
    const funcUser = getUserResponse.data.user;
    const {data, error} = await supabase.from("requests").select().eq("watermarked_free_trial", true).eq("user_id", funcUser.id);
    console.log("isFreeTrialUsed: ", data, error);
    if(error){
      toast({
        title: 'Error checking your free trial status.',
        description: '',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      return false;
    } else {
      setFreeTrialUsed(data.length > 0);
      return data.length > 0;
    }
  }

  let generateBucketId = async (strLength) => {

    const { data: {user} } = await supabase.auth.getUser();
    console.log(user);
    let uid = user.id;

    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < strLength) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return uid + "/" + result;
  }

  let onImagesAdd = (e) => {
    console.log([...e.target.files]);
    var files = [...images];
    var fileUrls = [...imageUrls];
    for(var i = 0; i < e.target.files.length; i++){
      fileUrls.push(URL.createObjectURL(e.target.files[i]));
      files.push(e.target.files[i]);
    }

    if(fileUrls.length > 10){
      toast({
        title: 'Too many files',
        description: '',
        status: 'error',
        duration: 2000,
        isClosable: true
      })
      files = files.splice(0, 10); // end is non-inclusive
      fileUrls = fileUrls.splice(0, 10);
    }

    setImages(files);
    setImageUrls(fileUrls);
  }

  let uploadFilesToSupabase = async (bucketId, imagesToUpload) => {
    for(var i = 0; i < imagesToUpload.length; i++){
      let x = uploadImage(bucketId, images[i], i);
      if(x.error){
        console.log(x.error);
        displayUploadError();
        return false;
      }
    }
    return true;
  }

  let createNewRecordInSupabase = async(bucketId, prompts, isWatermarked) => {
      const {data: {user}} = await supabase.auth.getUser();
      const {data, error} = await supabase
        .from("requests")
        .insert({
          id: bucketId,
          user_id: user.id,
          email: user.email,
          watermarked_free_trial: isWatermarked,
          prompts: {"data": prompts}
        });
      if(error){
        console.log(error);
        displayUploadError();
        return false;
      }
      return true;
  }

  let displayUploadError = () => {
    toast({
      title: 'Error uploading files',
      description: 'Email me at vijay@longlaketech.com with your information and I will get you set up!',
      status: 'error',
      duration: 3000,
      isClosable: true
    })
  }

  let removeImage = (index) => {
    let imagesCpy = [...images];
    let imagesUrlCpy = [...imageUrls];
    console.log("removing image at index ", index, images, imagesUrlCpy, imagesCpy, imagesUrlCpy);
    imagesCpy.splice(index, 1);
    imagesUrlCpy.splice(index, 1);
    setImages(imagesCpy);
    setImageUrls(imagesUrlCpy);
  }

  // the bucket for storage is images
  let uploadImage = async (bucketId, file, i) => {
    const filenameSplitUp = file.name.split(".");
    const fileExtension = filenameSplitUp[filenameSplitUp.length - 1];
    console.log(file, fileExtension);
    const {data, error} = await supabase
      .storage
      .from("user_images")
      .upload(bucketId + "/" + i.toString() + '.' + fileExtension, file, {
        cacheControl: '3600',
        upsert: false
      });
    console.log(data, error);
    return {data, error};
  }

  let processCheckout = async (bucketId) => {

    const res = await fetch("/api/payment", {
      method: "POST",
      body: JSON.stringify({supabaseId: bucketId}),
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + STRIPE_PUBLIC
      })
    })
    console.log('Fetched session id from backend: ', res);
    if(!res.ok){
      return false;
    }

    const data = await res.json();

    // console.log("data: ", data);

    const stripe = await loadStripe(STRIPE_PUBLIC); // process.env.NEXT_PUBLIC_STRIPE_KEY

    // console.log("stripe instance: ", stripe);

    const stripeRes = await stripe.redirectToCheckout({sessionId: data.id});

    console.log(stripeRes);
    if(!stripeRes.ok){
      return false;
    }

    return true;
  }

  // test version of uploadThenCheckout
  // let uploadThenCheckout = async() => {
  //   // await fetch("/api/payment");
  //   let testBucketId = await generateBucketId(8);
  //   console.log("making request with testBucketId: " + testBucketId);
  //   // const res = await fetch("/api/hello", {
  //   //   body: {supabaseId: testBucketId},
  //   //   method: 'POST',
  //   //   headers: new Headers({
  //   //     'Content-Type': 'application/json',
  //   //     'Accept': 'application/json'
  //   //   })
  //   // })
  //   const res = await fetch("/api/payment", {
  //     body: JSON.stringify({supabaseId: testBucketId}),
  //     method: 'POST',
  //     headers: new Headers({
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //     })
  //   });
  //   console.log(res);
  // }

  function getColor(value){
    //value from 0 to 1
    var hue=((1-value)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
  }

  let uploadFreeTrial = async () => {
    const wasFreeTrialUsed = await isFreeTrialUsed();
    if(wasFreeTrialUsed){
      toast({
        title: 'Your free trial has already been used.',
        description: '',
        status: 'error',
        duration: 2000,
        isClosable: true
      })
      return false;
    }

    const didUploadWork = await upload(true);

    if(didUploadWork){
      setFreeTrialUsed(true);
      // // update free trial to having been used up
      // const {data, error} = await supabase.auth.updateUser({
      //   data: {freeTrialUsed: true}
      // });
      // setFreeTrialUsed(true);
      // console.log(data, error);
    }
    setLoading(false);

    setTimeout(window.location.replace("https://petform.longlaketech.com/cksuccess"), 1000);
  }

  let upload = async (isWatermarked) => {
      // first, validate the forms
      if(images.length < 5 || prompts.length <= 0){
        console.log(imageUrls, imageUrls.length, prompts.length)
        toast({
          title: 'Please fill out all parts of the form before submitting. You may need to add more images.',
          description: '',
          status: 'error',
          duration: 2000,
          isClosable: true
        })
        return false;
      }
  
      setLoading(true);
  
      // first, upload the images
      let bucketId = await generateBucketId(7);
      let uploadWorked = await uploadFilesToSupabase(bucketId, images);
      if(!uploadWorked){
        setLoading(false);
        return false;
      }
      // then, save the other parts of the request
      console.log("prompts: ", prompts);
      let recordCreationWorked = await createNewRecordInSupabase(bucketId, prompts, isWatermarked);
      if(!recordCreationWorked){
        setLoading(false);
        return false;
      }
  
      toast({
        title: 'File upload successful!',
        description: 'Your files were successfully uploaded for processing',
        status: 'success',
        duration: 2000,
        isClosable: true
      })
      return bucketId;
  }

  let uploadThenCheckout = async () => {
    let bucketId = await upload(false);
    if(!bucketId){
      return;
    }

    // then, send the user to the checkout flow
    const checkoutProcessSucceeded = await processCheckout(bucketId);
    if(!checkoutProcessSucceeded){
      setPaymentFailed(bucketId);
      toast({
        title: 'Loading payment interface unsuccessful',
        description: 'Loading your payment interface was unsuccessful. Please email support using the provided button.',
        status: 'error',
        duration: 30000,
        isClosable: true
      })
      return setLoading(false);
    }
    setLoading(false);
  }

  const resetPassword = async () => {
    const {data, error} = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if(error){
      toast({
        title: 'Unfortunately, your password reset failed',
        description: '',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: 'Password reset successful! Page will refresh soon.',
        description: '',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      setTimeout(window.location.replace("https://petform.longlaketech.com"), 1000);
    }
  }

  let addPrompt = () => {
    if(newPrompt.length == 0){
      toast({
        title: 'Please write something in your new prompt.',
        description: '',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      return;
    }
    setPrompts([...prompts, newPrompt]);
    setNewPrompt("");
  }

  let deletePrompt = (index) => {
    let promptsCopy = [...prompts];
    promptsCopy.splice(index, 1);
    setPrompts(promptsCopy);
  }

  if(passwordRecovery){
    return (
      <main className={styles.main}>
        <HStack>
          <Input type={'password'} placeholder="new password" onChange={(e) => setNewPassword(e.target.value)}></Input>
          <Button onClick={() => resetPassword()}>Reset password</Button>
        </HStack>
      </main>
    )
  }

  return (
    <>

      <main className={styles.main}>

          <Flex top="1rem" right="1rem" alignSelf="end">
            {user && 
              <Box padding={2} borderRadius={4}>
                {/* <HStack> */}
                  {user.email} | {freeTrialUsed ? 'Free trial used | ' : ''}
                  <Link href="/view-requests">View Past Requests</Link> |
                  <Button backgroundColor="red.200" margin={2} color="white" onClick={() => supabase.auth.signOut()}>Sign out</Button>
                {/* </HStack> */}
              </Box>
            }
          </Flex>
        
          {!userLoggedIn &&
            <div>
              <Heading>petform</Heading>
              <Container maxW={'3xl'}>
                <Stack
                  as={Box}
                  textAlign={'center'}
                  spacing={{ base: 8, md: 14 }}
                  py={{ base: 16, md: 20 }}>
                  <Heading
                    fontWeight={600}
                    fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
                    lineHeight={'110%'}>
                    Create beautiful, AI-assisted images  <br />
                    <Text as={'span'} color={'green.400'}>
                      of your pet.
                    </Text>
                  </Heading>
                  <HStack>
                    <VStack alignSelf="flex-start">
                      <Text fontSize="3xl">
                        Source Images
                      </Text>
                      <Image src="/original.png" width={500} height={300}/>
                    </VStack>
                    <Text fontSize="6xl">→</Text>
                    <VStack alignSelf="flex-start">
                      <Text fontSize="3xl">
                        Generated Images
                      </Text>
                      <Image src="/generated.png" width={300} height={300}/>
                      <Text fontSize="sm" align="left">
                        <b>Prompts</b><br/>
                        on a mountain<br/>
                        as an astronaut<br/>
                        sunset in the background<br/>
                      </Text>
                    </VStack>
                  </HStack>
                  <Stack
                    direction={'column'}
                    spacing={3}
                    align={'center'}
                    alignSelf={'center'}
                    position={'relative'}>
                   <Text fontSize="2xl">Log in or sign up and get started!</Text>
                    <Auth
                    supabaseClient={supabase}
                    appearance={{theme: ThemeSupa}}
                    providers={[]}
                    />
                  </Stack>
                </Stack>
              </Container>

            </div>
          }

          {userLoggedIn &&
            <div>
              <VStack>
                <Heading margin={4}>petform</Heading>
              </VStack>

              {/* {JSON.stringify(images)} */}

              <SimpleGrid columns={2} spacing={10}>
                <Box>
                  <Box backgroundColor={getColor(images.length >= 10 ? 0 : (10 - images.length)/10)} textColor={"#000000"} borderRadius={3} padding={3}>
                    {/* <p>{images.length < 5 ? ((5 - images.length).toString() + " images remaining") : "You can add up to 10 images."}</p> */}
                    <p>Select 5-10 photos of your pet, preferably from different angles and without any other subjects.</p>
                </Box>
                </Box>


                <Box>
                  <Input ref={inputBtnRef} style={{display: 'none'}} type="file" multiple accept="image/*" onChange={onImagesAdd} value={[]}/>
                  <Button colorScheme='teal' variant='solid' onClick={() => inputBtnRef.current.click()}>
                    Select files
                  </Button>
                  <br/> Tap image to remove
                    <SimpleGrid minChildWidth="110px" spacing={10}>
                    {imageUrls.map((item, index) => (
                      <VStack key={index} marginTop={"4"} borderWidth={2} borderRadius={4} padding={4} className="block-icon">
                        <Image style={{objectFit: "cover"}} src={item} width={100} height={100} onClick={() => removeImage(index)}>
                        </Image>
                        {/* <Button style={{alignSelf: "flex-end"}} fontSize={8} className="icon-tag" bottom="0rem" color="black" onClick={() => removeImage(index)}>❌</Button> */}
                      </VStack>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <label>Prompts - what do you want the generated images to look like? Add as many as you like. </label>
                </Box>
                <Box>
                  <Box overflowY="auto" maxHeight="300px">
                    {/* <SimpleGrid> */}
                      {prompts.map((item, index) => (
                        <>
                          <Flex dir="row" margin={2} marginLeft={0} borderWidth={2} padding={2} borderRadius={4}>
                            <Box>{item}</Box>
                            <Spacer/>
                            <Button pos="relative" alignSelf="self-end" backgroundColor="red.200" onClick={() => deletePrompt(index)}>X</Button>
                          </Flex>
                        </>
                      ))}
                    {/* </SimpleGrid> */}
                  </Box>
                  <Textarea type="text" value={newPrompt} placeholder="my pet sitting majestically on a mountain, my pet in a suit" width='100%' onChange={(event) => setNewPrompt(event.target.value)}></Textarea>
                  <Button onClick={() => addPrompt()} margin={2}>Add prompt</Button>
                </Box>
              </SimpleGrid>
              <VStack marginTop="8">
                <HStack>
                  {/* {!loading && <Button marginTop="4" backgroundColor='blue.300' onClick={() => uploadThenCheckout()}>Proceed to checkout (via Stripe)</Button>} */}
                  {loading && <Spinner/>}
                </HStack>
                {(!loading && !freeTrialUsed) && <Button marginTop="4"  onClick={() => uploadFreeTrial()}>Use your watermarked free trial</Button>}
                {paymentFailed && <a color='blue.300' href={"mailto:vijay@longlaketech.com?subject=Petform Payment Failed&body=Payment code " + paymentFailed}>Email support with code (send as is)</a>}
              </VStack>
            </div>
          }

        <Box spacing={2}>
          <Text>feedback? <Link href="mailto:vijay@longlaketech.com">email me at vijay@longlaketech.com</Link></Text>
          <Link href="/terms">Terms and Conditions  </Link>
          {/* <Link href="/about"> About</Link> */}
        </Box>
      </main>
    </>
  )
}
