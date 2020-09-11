let admin = require("firebase-admin");
let serviceAccount = {
    "type": "service_account",
    "project_id": "nibbin-b3ebc",
    "private_key_id": "8c45021ab3e71eb5343a7b3b4e9c1fcd6900ad41",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCm1cr0SsNCb24V\n+jKYzSDerbqHT9svKMBHAFNQgtgpUQU6MzH/2Lr7ZiKBW/uAZeDV4k/ouMG6hLWu\nqmxDSWR6ICKlvncNpSXz5InSdXQvLrKbS5PVsGZqV9bJc/Bu+ZmcFkGur/d4RnFs\nWbxSRgxFpZcOMP/1HYh8moMz+IN6zW8HCyR7sOvMYj5EAEGiWWNI9Y4tbptlpxus\nqoqLzKq4Lq6IJRd7VKvT46zjHUo3ddH1ygZRb3CelB1BLhY1Y3rtX4+WwE+hCLxK\nkSqX9BpB4UroRZVsPXfbRKwUUzINBMj/3T99wA1pHR/DGAAkhVHB9Q0XtLGWiTjP\nWEqyHqylAgMBAAECggEAAoI9go3rQMD/NUplX2HaSC7xmp5LS/q/ZXHuTswg5wIm\nY3kom9HNAgHHrA1Pi1880cqM7BF3LFBZkQ5UAXEFl0aLbtWd4bElkHTT07vbaug3\nXFl3GCQGbjvy6WWabHjJZAz7oN5ZiM/6Xag9yjjub0+tpVN8TdnLVyBVr77hb0PI\nVoW/qDdcybqa3PNpP50rZZjkE7+HTWSqb68vJmEjVPCL8Fr5lgw/48dkh9MbD16j\nXDlHtOMo4EZy7MGSqN5DaQaNNckUH0/Y9xNa5aPTyZEI33nbGhZxlNqHLwhGfNHt\njGmPULfRQF+K9wLA7U24/0yow2hnB2/Ar48OJq5FAwKBgQDggiE08FHy7tw53/hb\nM8uIynGprbFIwkfO4EGmsqJtskb/IiAWEWqAjSLP3QUG17UeusDnMD7sCOIfE0SX\n00LCfatHkkMfVNDEc8TbH4a6+g67p93IxCHp2W8FFG7xXbhR2RsogxgjvXzl6Juo\nQ/t9+UhId04RR0sQ3Owdqyh2IwKBgQC+PK0ai37sHO8y395JIvu7Yf76BgLtWXoZ\nqdRYugxPckJgELVm+f98cjDfTiUFjlRRVaAQaMo7N7SJ4WlSG8BGUuFKI1OFI9Uv\nUbbjBOcXe4/x9csCkqpApj0HnfhhIXzyMUAltrFFtUpqSTgrs7CVkGUOYgOKqS3C\nTBv7vXfqlwKBgBRQcgTCQggDSPYLqANImoAUIVjDGKmGusyjSg11WHEoknf/dHvK\ns6JSIvY//3ZxCjhvmYjRur/Mxfkd2zUJrp6+lELznxM0r3c3KnbRUXWVrsOYGt9R\nr+fi/sKs6KT6X/U3+dcelY6WVLjQ5VTCYf0yEzJLaUry8n3iH5NHq2+VAoGAAabT\nNezKIFCr/vwUmPv1xY23QgJ1Wgwx1DE2R8Ltwm7ShrT+bjNzdWgkZnvuNFsk/kPJ\nDPtr7hGwvpW3bWASTkn/7L3bxscl3bBO7y+mtfx7pnUk2xPc6IzI8Nz9QBKjXBLz\nZKBub5WAXOXf1/lKajIDvpk5QKXxYMN6ZrghZ2cCgYEAkDuphRXNrP9JG5TAXun1\no3beyDlNGowzm/1iZqhjcE7qEUphsQVSaougMQ/vqx4tTEBGISObMbY11XkTvUu+\nEJBuToYd07TybAAAXdE68c+fskMOtHxNv7fzoE439kGP7X+rfh1PK5T2X6ip/34U\nUZPvTyNfL3zCak/fpxD4F3o=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-hzxac@nibbin-b3ebc.iam.gserviceaccount.com",
    "client_id": "106486462841705751150",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hzxac%40nibbin-b3ebc.iam.gserviceaccount.com"
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nibbin-b3ebc.firebaseio.com"
});

module.exports.firebaseDb = function () {
    let firebaseDb = admin.firestore();
    return firebaseDb;
}