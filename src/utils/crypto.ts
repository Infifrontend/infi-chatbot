import CryptoJS from "crypto-js";

// The following set of code is used for encrypt the data for security purpose
export const encodeString = (text: string, key: string): string => {
  const encoded = CryptoJS.AES.encrypt(text, key).toString();
  return encoded;
};

// The following set of code is used for decrypt the data for security purpose
export const decodeString = (encodedText: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encodedText, key);
  const decoded = bytes.toString(CryptoJS.enc.Utf8);
  return decoded;
};

// The following set of code is used for decrypt the reponse or data using AES method.
export const decryptResponse = (encodedResponse: string) => {
  const key = "97cc+XE5NTUVhWOrdxrESw==";
  try {
    const decryptedString = CryptoJS.AES.decrypt(
      encodedResponse.replace(/^"(.*)"$/, "$1"),
      CryptoJS.enc.Base64.parse(key),
      { mode: CryptoJS.mode.ECB }
    ).toString(CryptoJS.enc.Utf8);

    const response = JSON.parse(decryptedString);
    return response;
  } catch (error) {
    return null;
  }
};

// The following set of code is used for encrypt the request or data using AES method.
export const encryptRequest = (requestValue: any) => {
  let requestData = JSON.stringify(
    CryptoJS.AES.encrypt(
      JSON.stringify(requestValue),
      CryptoJS.enc.Base64.parse("97cc+XE5NTUVhWOrdxrESw=="),
      {
        mode: CryptoJS.mode.ECB,
      }
    ).toString()
  );
  return requestData;
};
