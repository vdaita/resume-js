// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import stripe from 'stripe';

const stripeInstance = new stripe("pk_test_51Kb55ZK7c7Mb50VzqCqKpw8CKE2OaOaN6dXX9CSFOESTYCO8XzzYAyR3AKfy1T2wdh246mwmWc1xHDW0MxUQej6j00gzQGymvF", {
    apiVersion: '2022-11-15'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabaseId = req.body.supabaseId;
    const session = await stripeInstance.checkout.sessions.create({
        mode: 'payment',
        success_url: 'https://localhost:3000/checkout_completed/success',
        cancel_url: 'https://localhost:3000/checkout_completed/failure',
        line_items: [
            {
                price: 'price_1NNHfLK7c7Mb50VzYRrAy30o',
                quantity: 1
            }
        ],
        custom_fields: [
            {
                key: 'supabaseId',
                label: {
                    type: 'custom',
                    custom: supabaseId
                },
                type: 'text'
            }
        ]
    })

    res.send({
        id: session.id
    });
}