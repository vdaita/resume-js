import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import {createClient} from '@supabase/supabase-js';
import { Button, SimpleGrid, ButtonGroup, Textarea, VStack, HStack, Input, Heading, Text, Spinner, Flex, Spacer, Box, useToast} from '@chakra-ui/react';
import axios from "axios";
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { loadStripe } from '@stripe/stripe-js';

const inter = Inter({ subsets: ['latin'] })
const supabase = createClient('https://fmyzoqfdmuxtujffwngp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteXpvcWZkbXV4dHVqZmZ3bmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4Mjg4ODAsImV4cCI6MTk4OTQwNDg4MH0.5Ie-OTM75T7fig6Or2rtp9yJP_izV9zGmzBzPnv69dc');

// const STRIPE_PUBLIC = "pk_test_51Kb55ZK7c7Mb50VzqCqKpw8CKE2OaOaN6dXX9CSFOESTYCO8XzzYAyR3AKfy1T2wdh246mwmWc1xHDW0MxUQej6j00gzQGymvF";
const STRIPE_PUBLIC = process.env.NEXT_PUBLIC_STRIPE_PUBLIC;

export default function Home() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompts, setPrompts] = useState("my pet sitting majestically on a mountain, my pet in a suit");

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [user, setUser] = useState(false);

  useEffect(() => {
    // console.log("stripe public: ", STRIPE_PUBLIC);
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      if(event == 'PASSWORD_RECOVERY'){
        console.log("Currently in password recovery mode.");
        setPasswordRecovery(true);
      }
      if(session){
        setUser(session.user);
        setUserLoggedIn(true);
      } else {
        setUser(undefined);
        setUserLoggedIn(false);
      }
    })
  }, []);

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
      fileUrls = filesUrls.splice(0, 10);
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

  let createNewRecordInSupabase = async(bucketId, prompts) => {
      const {data: {user}} = await supabase.auth.getUser();
      const {data, error} = await supabase
        .from("requests")
        .insert({
          id: bucketId,
          user_id: user.id,
          email: user.email,
          prompts: {"data": prompts.split("\n")}
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

  let uploadThenCheckout = async () => {

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
      return;
    }
    // then, save the other parts of the request
    console.log("prompts: ", prompts);
    let recordCreationWorked = await createNewRecordInSupabase(bucketId, prompts);
    if(!recordCreationWorked){
      setLoading(false);
      return;
    }

    toast({
      title: 'File upload successful!',
      description: 'Your files were successfully uploaded for processing',
      status: 'success',
      duration: 2000,
      isClosable: true
    })

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
      <Head>
        <title>Petform</title>
        <meta name="description" content="Generate pet photo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
          {user && 
            <Flex>
              <Spacer/>
              <Box>
                <p>{user.email}</p>
                <Button backgroundColor="red.200" color="white" onClick={() => supabase.auth.signOut()}>Sign out</Button>
              </Box>
            </Flex>
          }

        
          <Heading>petform</Heading>

          {!userLoggedIn &&
            <div>
              <label>Please log in or sign up before submitting your form.</label>
              <Auth
              supabaseClient={supabase}
              appearance={{theme: ThemeSupa}}
              providers={[]}
              />
            </div>
          }

          {userLoggedIn &&
            <div>
              <VStack>
                <label>Select 5-10 photos of your pet, preferably from different angles and without any other subjects.</label>
                <Box backgroundColor={getColor(images.length > 5 ? 0 : (5 - images.length)/5)} textColor={"#000000"} borderRadius={3} padding={3}>
                  <p>{images.length <= 5 ? 5 - images.length : 0} images remaining</p>
                </Box>
                <Input type="file" multiple accept="image/*" onChange={onImagesAdd} value={[]}/>
              </VStack>

              {/* {JSON.stringify(images)} */}

              <SimpleGrid columns={3} spacing={10}>
                {imageUrls.map((item, index) => (
                  <VStack marginTop={"4"}>
                    <Image src={item} width={250} height={250}/>
                    <Button backgroundColor="red.300" color="black" onClick={() => removeImage(index)}>remove image</Button>
                  </VStack>
                ))}
              </SimpleGrid>

              <VStack marginTop="8">
                <label>Prompts</label>
                <Textarea type="text" value={prompts} placeholder="" width='100%' onChange={(event) => setPrompts(event.target.value)}></Textarea>
                {!loading && <Button marginTop="4" onClick={() => uploadThenCheckout()}>Proceed to checkout</Button>}
                {loading && <Spinner/>}
                {paymentFailed && <a href={"mailto:vijay@longlaketech.com?subject=Petform Payment Failed&body=Payment code " + paymentFailed}>Email support with code (send as is)</a>}
              </VStack>


            </div>
          }


          <Text>feedback? email me at vijay@longlaketech.com</Text>
      </main>
    </>
  )
}
