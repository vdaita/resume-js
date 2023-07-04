// https://www.codedaily.io/tutorials/Stripe-Webhook-Verification-with-NextJS

import stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabase = createClient("https://fmyzoqfdmuxtujffwngp.supabase.co", process.env.SUPABASE_SECRET_KEY);


export default async function handler(req, res){
  console.log("Webhook received req: ", req.body, req.method, req.body.data.object.metadata);
  const supabaseId = req.body.data.object.metadata.supabaseId;
  supabase.from("requests").update({ payment_confirmed: true}).eq('id', supabaseId);
  res.status(200).end();
  // if(req.method == "POST"){
  //   const buf = await buffer(req);
  //   const sig = req.headers["stripe-signature"];

  //   let event;
  //   try {
  //     event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  //   } catch (err) {
  //     console.log("Webhook error: ", err.message);
  //     res.status(400).send(`Webhook error: ${err.message}`);
  //     return;
  //   }

  //   console.log("Event constructed: ", event, event.data.object);

  //   if (event.type == "charge.succeeded") {
  //     const charge = event.data.object;
  //     console.log("Received charge: " + charge);
  //     // the metadata stores the supabaseId
  //     const supabaseId = charge.metadata.supabaseId;
  //     console.log("Supabase id: ", supabaseId);
  //     supabase.from("requests").update({ payment_confirmed: supabaseId }).eq('id', supabaseId);
  //   } else {
  //     console.warn(`Unhandled event type: ${event.type}`);
  //   }

  //   res.status(200).end();
  // } else {
  //   res.setHeader("Allow", "POST");
  //   res.status(405).end("Method not allowed");
  // }
}
