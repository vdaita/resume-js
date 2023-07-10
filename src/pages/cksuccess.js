import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, ButtonGroup, Textarea, VStack, HStack, Link, Input, Heading, Text, useToast} from '@chakra-ui/react';
import Script from "next/script";

export default function Success() {
    return (
        <>
            <Script>
                {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '257397480350606');
            fbq('track', 'StartTrial');`}
            </Script>
            <main className={styles.main}>
                <VStack>
                    <Link href="/">
                        <Heading margin={4}>← petform</Heading>
                    </Link>
                    <p>
                    Your payment was successful! You should expect an email from longlaketech.com in the coming days with either your images or a request for clarification.
                    </p>
                </VStack>
            </main>
        </>

    )
}