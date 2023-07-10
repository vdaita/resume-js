import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, ButtonGroup, Textarea, VStack, HStack, Link, Input, Heading, Text, useToast} from '@chakra-ui/react';

export default function Success() {
    return (
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
    )
}