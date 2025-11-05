import * as CryptoJS from 'crypto-js';
import { injectable } from 'inversify';

import { ICypherService } from '../application/services/ICypherService';

@injectable()
export class CypherServiceImpl implements ICypherService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.AES_SECRET_KEY;
  }

  encrypt(text: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, this.secretKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return iv.toString() + ':' + encrypted.toString();
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted password format');
    }
    const iv = CryptoJS.enc.Hex.parse(parts[0]);
    const encrypted = parts[1];
    const decrypted = CryptoJS.AES.decrypt(encrypted, this.secretKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
