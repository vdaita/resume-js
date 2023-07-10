// export default function ViewRequests(){
//   return (<div></div>)
// }

import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import supabase from '@/utils/supabase.js';
import { Button, ButtonGroup, Textarea, VStack, Input, Box, Heading, Flex, Text, Spinner, Card, HStack, CardHeader, CardBody, CardFooter, Badge, Link, useToast} from '@chakra-ui/react';
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC = process.env.NEXT_PUBLIC_STRIPE_PUBLIC;

export default function ViewRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);

  useEffect(() => {
    // load all the requests with this user's id
    loadPreviousRequests();
  }, []);

  let loadPreviousRequests = async () => {

    setLoading(true);

    let userId = await getUserId();

    let {data, error} = await supabase.from('requests')
      .select()
      .eq('user_id', userId);

    console.log("loadPreviousRequests: ", data, error, userId);

    let requests = [];

    for(var requestIndex = 0; requestIndex < data.length; requestIndex++){
      let currentRequest = data[requestIndex];
      let firstImage = await getFirstImage(currentRequest.id);
      currentRequest.image = firstImage;
      requests.push(currentRequest);
    }

    setRequests(requests);

    setLoading(false);
  }

  let getFirstImage = async(id) => {
    const {data, error} = await supabase.storage.from('user_images')
      .list(id, {
        limit: 1,
        offset: 0
      });
    console.log("getFirstImage: ", id, data, error);
    let image_url = id + "/" + data[0].name;
    const signedUrl = await supabase.storage.from('user_images').createSignedUrls([image_url], 60);
    if(signedUrl.error){
      return false;
    }
    console.log("signedUrl: ", signedUrl.data[0].signedUrl);
    return signedUrl.data[0].signedUrl;
  }

  let getUserId = async () => {
    const { data: {user} } = await supabase.auth.getUser();
    setUser(user);
    return user?.id;
  }


  let processCheckout = async (bucketId) => { // TODO: don't have two different processCheckout methods in seperate files

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
    const stripe = await loadStripe(STRIPE_PUBLIC); // process.env.NEXT_PUBLIC_STRIPE_KEY
    const stripeRes = await stripe.redirectToCheckout({sessionId: data.id});

    console.log(stripeRes);
    if(!stripeRes.ok){
      return false;
    }

    return true;

  }

  return (
    <>
      <main classType={styles.main}>

        <HStack>
          <Link href="/">
            <Heading margin={4}>← petform</Heading>
          </Link>
          {loading && <Spinner/>}
        </HStack>


        {requests.map((item, index) => (
          <Card maxW='md' margin={4}>
            <CardBody>
              <Image width={250} height={250} src={item.image}/>
              <p>{(new Date(item.created_at)).toUTCString()}</p>

              {(!item.watermarked_free_trial && item.payment_confirmed) && <Badge margin={1} colorScheme='green'>Payment completed</Badge>}
              {(!item.watermarked_free_trial && !item.payment_confirmed) && <Badge margin={1} colorScheme='red' onClick={() => processCheckout(item.id)}>Payment not completed - tap to complete</Badge>}

              {(item.payment_confirmed && item.request_completed )&& <Badge margin={1} colorScheme='green'>Request fulfilled - check your email</Badge>}
              {(item.payment_confirmed && !item.request_completed) && <Badge margin={1} colorScheme="yellow">Request in progress</Badge>}

              {item.watermarked_free_trial && <Badge margin={1} colorScheme="blue">Free trial request</Badge>}
            </CardBody>
            
          </Card>
        ))}
      </main>
    </>
  )
}
