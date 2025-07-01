export interface ShortenUrlResponse {
  originalUrl: string;
  shortUrl: string;
  user: string | { id: number; name: string; email: string };
}

export interface UrlData {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteUrlResponse {
  message: string;
  shortUrl: string;
  originalUrl: string;
}

export interface UpdateUrlResponse {
  message: string;
  shortUrl: string;
  originalUrl: string;
  updatedAt: string;
}
