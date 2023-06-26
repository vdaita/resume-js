// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import stripe from 'stripe';

const stripeInstance = new stripe("", {
    apiVersion: '2022-11-15'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabaseId = req.body.supabaseId;
    const session = await stripeInstance.checkout.sessions.create({
        mode: 'payment',
        success_url: '',
        cancel_url: '',
        line_items: [
            {
                price: '',
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