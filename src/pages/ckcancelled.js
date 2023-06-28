import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, ButtonGroup, Textarea, VStack, Input, Heading, Text, useToast} from '@chakra-ui/react';

export default function Failure() {
    return (
        <main className={styles.main}>
            Your payment was cancelled. Visit our homepage to resubmit our form or email support with any questions you have.
        </main>
    )
}