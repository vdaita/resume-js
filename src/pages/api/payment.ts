// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import stripe from 'stripe';

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15'
});

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     console.log("Request received by /api/payment");
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Request received by /api/payment", req.body);
    const supabaseId = req.body.supabaseId;
    console.log("received request from frontend: ", req.body, supabaseId);
    const session = await stripeInstance.checkout.sessions.create({
        mode: 'payment',
        success_url: 'http://localhost:3000/cksuccess',
        cancel_url: 'http://localhost:3000/ckcancelled',
        line_items: [
            {
                price: 'price_1NQxATK7c7Mb50Vz09SqksfC',
                quantity: 1
            }
        ],
        metadata: {
            supabaseId: supabaseId
        }
    })
    console.log("payment session created: ", session);
    res.send({
        id: session.id
    });
}
