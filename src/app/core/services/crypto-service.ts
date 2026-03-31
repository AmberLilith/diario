import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CryptoService {

  private readonly SECRET_KEY = environment.cryptoKey; 

  // Converte string para CryptoKey usando AES-256-GCM
  private async getKey(): Promise<CryptoKey> {
    const keyMaterial = new TextEncoder().encode(this.SECRET_KEY.padEnd(32).slice(0, 32));
    return crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Criptografa — retorna string base64 (iv + dados cifrados)
  async encrypt(plainText: string): Promise<string> {
    console.log(plainText)
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV (recomendado para GCM)
    const encoded = new TextEncoder().encode(plainText);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Concatena IV + dados cifrados e converte para base64
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);
    const retorno = btoa(String.fromCharCode(...combined))
    return retorno;
  }

  // Descriptografa — recebe string base64 e retorna texto original
  async decrypt(cipherText: string): Promise<string> {
    const key = await this.getKey();
    const combined = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);           // primeiros 12 bytes = IV
    const data = combined.slice(12);            // resto = dados cifrados

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  }
}

/* Como usar:
const cifrado = await this.crypto.encrypt('Site Da Microsoft'); ou
teste(){
    this.cryptoService.encrypt("cu").then((encrypted:string) =>{
        //ação que usa o valor retornado
    })
    }
const original = await this.crypto.decrypt(registro.plataformName);  */