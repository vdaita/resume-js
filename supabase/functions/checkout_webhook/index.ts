import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

// Import via bare specifier thanks to the import_map.json file.
import Stripe from 'https://esm.sh/stripe@12.10.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

console.log('Hello from Stripe Webhook!')

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    )

    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { global: { headers: { Authorization: request.headers.get('Authorization')! } } }
    )

    const bucketId = receivedEvent.data.object["custom_fields"][0]["label"]["custom"];

    const {error} = await supabaseClient
      .from("requests")
      .update({payment_completed: true})
      .eq("id", bucketId);

    if(error){
      return new Response(error.message, {status: 400});
    }

    console.log(`Supabase bucket information: ${bucketId}`);
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})