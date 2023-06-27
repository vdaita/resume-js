import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import {createClient} from '@supabase/supabase-js';
import { Button, ButtonGroup, Textarea, VStack, Input, Heading, Text, useToast} from '@chakra-ui/react';
import axios from "axios";
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { loadStripe } from '@stripe/stripe-js';

const inter = Inter({ subsets: ['latin'] })
const supabase = createClient('https://fmyzoqfdmuxtujffwngp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteXpvcWZkbXV4dHVqZmZ3bmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4Mjg4ODAsImV4cCI6MTk4OTQwNDg4MH0.5Ie-OTM75T7fig6Or2rtp9yJP_izV9zGmzBzPnv69dc');

export default function Home() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompts, setPrompts] = useState("");

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      if(session){
        setUserLoggedIn(true);
      } else {
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
    return uid + "/" + Date.now().toString() + result;
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

    setImages([...e.target.files]);
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

  let createNewRecordInSupabase = async(bucketId, name, email, prompts) => {
      const {data, error} = await supabase
        .from("records")
        .insert({
          id: bucketId,
          name: name,
          email: email,
          prompts: {"data": prompts.split("\n")}
        });
      if(error){
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

  let processCheckout = async () => {
    const { data } = await axios.get(`/api/payment`)
    const stripe = await loadStripe(); // process.env.NEXT_PUBLIC_STRIPE_KEY
    await stripe.redirectToCheckout({sessionId: data.id});
  }

  let uploadThenCheckout = async () => {

    setLoading(true);

    // first, upload the images
    let bucketId = await generateBucketId(8);
    let uploadWorked = await uploadFilesToSupabase(bucketId, images);
    if(!uploadWorked){
      return;
    }
    // then, save the other parts of the request
    let recordCreationWorked = await createNewRecordInSupabase(bucketId, name, email, prompts);
    if(!recordCreationWorked){
      return;
    }
    // then, send the user to the checkout flow
    await processCheckout();

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Petform</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
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
                
                <Input type="file" multiple accept="image/*" onChange={onImagesAdd} value={[]}/>
              </VStack>

              {/* {JSON.stringify(images)} */}

              {imageUrls.map((item, index) => (
                <VStack marginTop={"4"}>
                  <Image src={item} width={250} height={250}/>
                  <Button backgroundColor="red.300" color="black" onClick={() => removeImage(index)}>remove image</Button>
                </VStack>
              ))}

              <VStack>
                <label>Prompts</label>
                <Textarea type="text" placeholder="my pet sitting majestically on a mountain" width='200%' onChange={(value) => setPrompts(value)}></Textarea>
              </VStack>
            

              <Button disabled={loading || !supabase.auth.currentSession} onClick={() => uploadThenCheckout()}>Proceed to checkout</Button>

            </div>
          }


          <Text>feedback? email me at vijay@longlaketech.com</Text>
      </main>
    </>
  )
}
