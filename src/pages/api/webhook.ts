// https://www.codedaily.io/tutorials/Stripe-Webhook-Verification-with-NextJS

import type { NextApiRequest, NextApiResponse } from 'next';
import stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15'
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabase = createClient( process.env.);


export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method == "POST"){
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      res.status(400).send(`Webhook error: ${err.message}`);
      return;
    }

    if (event.type == "charge.succeeded") {
      const charge = event.data.object;
      // the metadata stores the supabaseId
      const supabaseId = charge.metadata.supabaseId;

    } else {
      console.warn(`Unhandled event type: ${event.type}`);
    }

    res.json({received: true});
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
}
