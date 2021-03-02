let admin = require("firebase-admin");
let serviceAccount = {
    "type": "service_account",
    "project_id": "kaavya-7de37",
    "private_key_id": "c4f1dfa43b41f781f3a04d0f1f42cd64334cf899",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLlSmp9SfGWjUh\nT0KdcSaeoS0Z2WyCoQUjvnhGxMTRdzspmg00fK1D3xRA4vZa4Wm/8gsHH8yJiSc0\nI+XHuv0/TdanlSSNf3L0QvpkKVo81kaJdV2g9QeYMQLqjoP2bEZgYccS9/ri7h7M\nWAqtGky27Zc9NEWS2lZ+39EN/Z77qkqOPuoQhZLYIIB2/fadH2huRuLXKeDoBMzu\n6rCUmIHUXQE25LcAOs/7v8tiTw5/SEfXEoD4mVQlfoFByN2roEp78Rd6b++RU/+X\ndCUJhQWoqWZWqdRv7JOKE2BixXGHvJE09I4Dt34LPoPAQINkYFO+oDdmbE/enmb8\nI6I32empAgMBAAECggEAZUCbxzbyAFoPQLDeDdYgAhdhihC0Qkf5eWya/3+P8Cof\n17IRzUARIMeLmDYJluuzn86vI2zyWplHUUxlVTAwElMRZqnr0yBHOSsyw6w5gDaG\nQImJ9qrHiy8dJzGYenAhlIAs9cc2FbWexb0oGi4RZ43FgaBE1iQXjuScYhv4/Wsy\nWBrOnQNP50/Ssxpwh/tdSEcD2mT8H9rR42D7bXExEBCV8HCNYeLOSG2IC0NehOMn\n4F7Hsj9vLpQ1cBSHb+cmDtTuezZqhe7FyM1TIPG3Y80OHIkW36yowzS+TKjdlkZo\n8ZvKS+GOATUAkuYhfR9XP03rA9ujlaGc1j3ujk25jQKBgQDxTKaAMAbt2Mkkd028\n+Si2Lgne4pPr5WynlW5td063wt7tmcwtDO8iG8OTe8kU1OoTOlTmYz0VAVWkc8kr\nJbOePpZ67yNNNOA+9Bp2iVqA+shN3LReUsXDJl0TVGS/RrHIu8+ey4TQicteGtsR\nMb30UGDZ2n3kTr1886kvoIdXUwKBgQDX/EZrnzaPvVy7PI42Zr4pT9+NX37GpD69\nBhXNBNN9KwtQf1VUeCLYWOwLGGCHfYpEo1k4xx07HK/7ZMOIK9G34yKyWHomaDkR\n5ATeAdYV5RzbbEKLen/p8IOXgjLn3zqWpcPGF0R3x0+N+ps0FCuKFJnfO6ieVfY9\n7Cafs9KHkwKBgB9QfDcchHmvbYMO/IauqwrhdKR5MQsnDe+9o8QO/Kc6YeXh1K5w\nBESf58SnBtRuQSZXppbzgATO1IdwA0ZXMTUzGCJCEIm/d+6TjS+e6aDdass3/ixT\nf5iwzNlqVVzBVucfAHWyIb1SdJL010Mm+mjPWZJMGZRcZ5jkoistIQNDAoGAcwb5\nHiIJ9d18wH8Moi5vwiK2xV0BcJtSimruO2UBmVzORs25zSW6MQySkYonBqG2fL2e\nK93nVG7/zlwowqHLrCp8dQ0n6MKC+mM8sFu7/6coijeK7SuNajLcclk18UVyt36K\n2DnWDhCI7u1zsPW5Bm3YUQo90C2p2eql21Hyop8CgYEAxk+cbWc8ltN9EcpGXqbR\nvj33le9KYskgpZqL4cZwNLENXK1caGXxyLAaZ1efrdGbrfS7zJvkhGB5v2aGThoR\nOKttrWHQQoDp2i25ccybNYuYaND+ANf4nj7OSA2hJ7UV40RpTFmU8gRumJunxsVM\ne8CTsQaxyUph/fzxvYG8+68=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-6q4jf@kaavya-7de37.iam.gserviceaccount.com",
    "client_id": "104226449830262448658",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-6q4jf%40kaavya-7de37.iam.gserviceaccount.com"
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kaavya-7de37-default-rtdb.firebaseio.com"
});

module.exports.admin = admin;

// module.exports.firebaseDb = function () {
//     let firebaseDb = admin.firestore();
//     return firebaseDb;
// }