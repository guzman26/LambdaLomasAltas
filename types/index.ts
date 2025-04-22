import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface LambdaEvent {
  path: string;
  httpMethod: string;
  body?: string;
  queryStringParameters?: { [key: string]: string } | null;
  pathParameters?: { [key: string]: string } | null;
  resource?: string;
  stageVariables?: { [key: string]: string } | null;
  headers: { [key: string]: string };
  multiValueHeaders: { [key: string]: string[] };
  multiValueQueryStringParameters?: { [key: string]: string[] } | null;
  isBase64Encoded: boolean;
  requestContext: any;
}

export interface LambdaResponse extends APIGatewayProxyResult {
  statusCode: number;
  headers?: {
    [header: string]: boolean | number | string;
  };
  body: string;
}

export interface ApiResponse {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
  };
}

export interface Box {
  codigo: string;
  fechaCalibreFormato: string;
  ubicacion: string;
  palletId?: string;
  estado: string;
  fechaCreacion: string;
  ultimaActualizacion?: string;
  customInfo?: string;
}

export interface Pallet {
  codigo: string;
  fechaCalibreFormato: string;
  estado: string;
  cajas: string[];
  cantidadCajas: number;
  fechaCreacion: string;
  ubicacion: string;
  ultimaActualizacion?: string;
}

export interface Issue {
  id: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  fechaResolucion?: string;
  resolucion?: string;
}

export interface SystemConfig {
  key: string;
  value: string;
  updatedAt: string;
}

export interface DynamoDbItem {
  [key: string]: any;
}

export type Location = 'TRANSITO' | 'BODEGA' | 'PACKING' | 'VENTA';
export type ItemType = 'BOX' | 'PALLET';
export type PalletStatus = 'open' | 'closed';
export type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'; 