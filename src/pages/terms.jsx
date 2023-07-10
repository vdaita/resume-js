import React, {useState, useEffect} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import supabase from '@/utils/supabase.js';
import { Button, ButtonGroup, Textarea, VStack, Input, Box, Heading, Flex, Text, Spinner, Card, HStack, CardHeader, CardBody, CardFooter, Badge, Link, useToast} from '@chakra-ui/react';
import axios from "axios";

export default function Terms(){
    return (
        <Text margin={4}>
            We are providing this as a fun service to the users. Petform, Long Lake Technologies, and their affiliated parties are not responsible for any damages caused by the software. Our service is provided at our discretion only, and we reserve the
            right to terminate service to any user. Furthermore, by using this service, you agree to have your uploaded images be processed by Long Lake Technologies and companies Long Lake Technologies works with to
            generate your images. Finally, as a user of this website, you cannot bring litigation against Long Lake Technologies, its employees, or its executives. Please write to us if you have any questions or comments and 
            we will work in earnest to resolve it. Thank you.
        </Text>
    )    
}
