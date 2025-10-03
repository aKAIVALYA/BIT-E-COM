const imagekit = require("imagekit");
const {v4 : uuidv4} = require('uuid');


const imagekitInstance = new imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

async function uploadImage ({ buffer, fileName, folder = '/products'}) {
    const res = await imagekitInstance.upload({
        file : buffer,
        fileName: uuidv4() ,
        folder,
    });


    return {
    url: res.url,
    thumbnailUrl: res.thumbnailUrl  || res.url,
    id: res.fileId,
    };

}

module.exports = { imagekit, uploadImage }
