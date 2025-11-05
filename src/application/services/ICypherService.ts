export interface ICypherService {
  encrypt(text: string): string;
  decrypt(text: string): string;
}
