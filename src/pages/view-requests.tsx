export default function ViewRequests(){
  return (<div></div>)
}

// import React, {useState, useEffect} from 'react';
// import Head from 'next/head'
// import Image from 'next/image'
// import { Inter } from 'next/font/google'
// import styles from '@/styles/Home.module.css'
// import supabase from '@/utils/supabase.js';
// import { Button, ButtonGroup, Textarea, VStack, Input, Heading, Text, Spinner, Card, CardHeader, CardBody, CardFooter, Badge, useToast} from '@chakra-ui/react';
// import axios from "axios";

// export default function ViewRequests() {
//   const [requests, setRequests] = useState([]);
//   const [user, setUser] = useState();

//   useEffect(() => {
//     // load all the requests with this user's id

//   }, []);

//   let loadPreviousRequests = async () => {
//     let userId = await getCurrentUserId();
//     setUser(userId);

//     let {data, error} = await supabase.from('requests')
//       .select()
//       .eq('user_id', userId);

//     if(!error){
//       for(var i = 0; i < data.length; i++){
//         data.images = [];
//         for(var j = 0; j < data.images; j++){

//         }
//       }
//     }
//   } 

//   let getCurrentUserId = async () => {
//     const { data: {user} } = await supabase.auth.getUser();
//     if(user){
//       return user.id;
//     } else {
//       return false;
//     }
//   }

//   let processCheckout = async (bucketId) => { // TODO: don't have two different processCheckout methods in seperate files

//     const STRIPE_PUBLIC = "pk_test_51Kb55ZK7c7Mb50VzqCqKpw8CKE2OaOaN6dXX9CSFOESTYCO8XzzYAyR3AKfy1T2wdh246mwmWc1xHDW0MxUQej6j00gzQGymvF";


//     const res = await fetch("/api/payment", {
//       method: "POST",
//       body: JSON.stringify({supabaseId: bucketId}),
//       headers: new Headers({
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': 'Bearer ' + STRIPE_PUBLIC
//       })
//     })
//     console.log('Fetched session id from backend: ', res);
//     if(!res.ok){
//       return false;
//     }

//     const data = await res.json();
//     const stripe = await loadStripe(STRIPE_PUBLIC); // process.env.NEXT_PUBLIC_STRIPE_KEY
//     const stripeRes = await stripe.redirectToCheckout({sessionId: data.id});

//     console.log(stripeRes);
//     if(!stripeRes.ok){
//       return false;
//     }

//     return true;

//   }

//   return (
//     <>
//       <Head>
//         <title>Petform</title>
//         <meta name="description" content="Generated by create next app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main classType={styles.main}>
//         <Heading>petform</Heading>

//         <p>Unpaid requests are deleted after 30 days</p>
//         {requests.map((item, index) => (
//           <Card>
//             <p>{item.prompts}</p>

//             {item.payment_completed && <Badge colorScheme='green'>Payment completed</Badge>}
//             {!item.payment_completed && <Badge colorScheme='red' onPress={() => processCheckout(item.id)}>Payment not completed - tap to complete.</Badge>}
//           </Card>
//         ))}
//       </main>
//     </>
//   )
// }
