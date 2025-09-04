import { saveAs } from 'file-saver';
import CryptoJS from 'crypto-js';

export interface DownloadResponse {
  blob: Blob;
  filename: string;
  contentType: string;
}

export const downloadFile = async (
  inputData: any,
  actionName: string,
  url: string,
  fileName: string
): Promise<boolean> => {
  try {
    // AES encryption using the same key from crypto.ts
    const encryptionKey = "97cc+XE5NTUVhWOrdxrESw==";
    const data: string = CryptoJS.AES.encrypt(
      JSON.stringify(inputData),
      CryptoJS.enc.Base64.parse(encryptionKey),
      { mode: CryptoJS.mode.ECB }
    ).toString();

    const formData = new FormData();
    formData.append('data', data);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzOTM4ODgzLCJpYXQiOjE3NTM4NjY5OTQsImp0aSI6ImYyMDc0ZjNhODRlNTQ1MWFhM2ZkNmZkNmQ0MTUzNWEzIiwidXNlcl9pZCI6MX0.DCl3Pdvw-s0KbL0-H-LbEKgntoUC6x4X6vNWsbXgYYs.Q2pLbTluK0NvY1cwVWJYdW1aVmxIRkNWRWVXckNLT0lIVjdRSkNpbzdjRUNma2NuZ3hLeTlxbWNsVW5CSjFBT09pMkt5UjJzWFJYejVzd2k2MmJQSGQzd0NtcjVsTnZ2dHN3TjUvRStkT09EeTZvRXdVMGJPbGVOTEVlS3RaUFV4Q2tISXI4MDVWR01mQ2tSVlZuOHVydDVnWWN3d3VSaUQvT0xJM25DcUJvWFNLTlpyUnMxSEJOSkVSMHJWYUFPTlRQTDhpay9wMFJRUUR5OURJR0lSUT09`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      saveAs(blob, `${fileName}.${actionName}`);
      return true;
    } else {
      console.error('Download failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

export const downloadDirectBinary = async (fileType: 'excel' | 'csv'): Promise<boolean> => {
  try {
    // Use existing static files instead of non-existent endpoints
    const fileName = fileType === 'excel' ? 'sample_excel.json' : 'sample_csv.json';
    const response = await fetch(`/staticResponse/${fileName}`, {
      method: 'GET'
    });

    if (response.ok) {
      const jsonData = await response.json();
      
      // Convert base64 data to blob
      const binaryString = atob(jsonData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: jsonData.contentType });
      saveAs(blob, jsonData.filename);
      return true;
    } else {
      console.error('Direct download failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Direct download error:', error);
    return false;
  }
};

export const downloadBinaryFile = async (binaryData: any): Promise<boolean> => {
  try {
    let blob: Blob;
    let filename: string;

    // Case 1: Mock binary response format (base64 encoded)
    if (binaryData?.type === 'binary' && binaryData?.data) {
      const binaryString = atob(binaryData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: binaryData.contentType });
      filename = binaryData.filename;
    }
    // Case 2: API response in { blob, filename, contentType } format
    else if (binaryData?.blob instanceof Blob) {
      blob = binaryData.blob;
      filename = binaryData.filename || 'download';
    }
    // Case 3: Raw Blob object
    else if (binaryData instanceof Blob) {
      blob = binaryData;
      filename = 'download';
    }
    else {
      console.error('Unsupported binary data format:', binaryData);
      return false;
    }

    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Binary download error:', error);
    return false;
  }
};

export const isBinaryResponse = (response: any): boolean => {
  // Check if response has binary data structure (our mock format)
  if (response?.type === 'binary' && response?.data && response?.filename) {
    return true;
  }
  
  // Check if response is a Blob object (real API binary response)
  if (response instanceof Blob) {
    return true;
  }
  
  // Check if response has binary content type header
  if (response?.headers && response?.headers['content-type']) {
    const contentType = response.headers['content-type'];
    return contentType.includes('application/octet-stream') ||
           contentType.includes('application/vnd.openxmlformats') ||
           contentType.includes('text/csv') ||
           contentType.includes('application/pdf') ||
           contentType.includes('application/zip');
  }
  
  // Check if response is binary data (not JSON structure)
  if (typeof response === 'string') {
    try {
      JSON.parse(response);
      return false; // Valid JSON, not binary
    } catch {
      return true; // Not valid JSON, likely binary
    }
  }
  
  // Check if response doesn't have the expected chat completion structure
  return !response?.choices?.[0]?.message?.content && !response?.content;
};

export const detectFileType = (response: any): string => {
  // Check if it's our binary response format
  if (response?.type === 'binary' && response?.contentType) {
    const contentType = response.contentType;
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      return 'xlsx';
    } else if (contentType.includes('csv')) {
      return 'csv';
    } else if (contentType.includes('pdf')) {
      return 'pdf';
    }
  }
  
  // You can enhance this based on response headers or content
  const contentType = response?.headers?.['content-type'] || '';
  
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
    return 'xlsx';
  } else if (contentType.includes('csv')) {
    return 'csv';
  } else if (contentType.includes('pdf')) {
    return 'pdf';
  }
  
  return 'xlsx'; // Default to excel
};