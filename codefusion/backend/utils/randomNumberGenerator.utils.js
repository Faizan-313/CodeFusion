import crypto from 'crypto';

export default function generateRandomNumber(){
    return crypto.randomInt(100000, 1000000);
}