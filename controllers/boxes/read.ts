import AWS from 'aws-sdk';
import { ApiResponse } from '../../types';
import Box from '../../models/Box';
import SystemConfig from '../../models/SystemConfig';
import * as dbUtils from '../../utils/db';
import createApiResponse from '../../utils/response';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get a box by its code
 * @param {string} code - Box code
 * @returns {Promise<ApiResponse>} API response
 */
export async function getBoxByCode(code: string): Promise<ApiResponse> {
  try {
    const box = await dbUtils.getItem(Box.getTableName(), { codigo: code });
    if (!box) {
      return createApiResponse(404, `Box with code ${code} not found`);
    }
    return createApiResponse(200, "Box data fetched successfully", box);
  } catch (error) {
    console.error(`❌ Error retrieving box ${code}:`, error);
    return createApiResponse(500, `Error retrieving box: ${(error as Error).message}`);
  }
}

/**
 * Get boxes by location
 * @param {string} location - Location to filter by
 * @returns {Promise<ApiResponse>} API response
 */
export async function getBoxesByLocation(location: string): Promise<ApiResponse> {
  try {
    const boxes = await dbUtils.scanItems(
      Box.getTableName(),
      'ubicacion = :location',
      { ':location': location }
    );
    return createApiResponse(200, "Boxes fetched successfully", boxes);
  } catch (error) {
    console.error('❌ Error retrieving boxes by location:', error);
    return createApiResponse(500, `Error retrieving boxes: ${(error as Error).message}`);
  }
}

/**
 * Get boxes by date
 * @param {string} date - The date to filter by (YYYYMMDD format)
 * @returns {Promise<ApiResponse>} API response
 */
export async function getBoxesByDate(date: string): Promise<ApiResponse> {
  try {
    // Assuming the box code starts with the date in format YYYYMMDD
    const boxes = await dbUtils.scanItems(
      Box.getTableName(),
      'begins_with(codigo, :date)',
      { ':date': date }
    );
    return createApiResponse(200, "Boxes by date fetched successfully", boxes);
  } catch (error) {
    console.error(`❌ Error retrieving boxes for date ${date}:`, error);
    return createApiResponse(500, `Error retrieving boxes: ${(error as Error).message}`);
  }
}

/**
 * Get all boxes
 * @returns {Promise<ApiResponse>} API response
 */
export async function getAllBoxes(): Promise<ApiResponse> {
  try {
    const boxes = await dbUtils.scanItems(Box.getTableName());
    return createApiResponse(200, "All boxes fetched successfully", boxes);
  } catch (error) {
    console.error('❌ Error retrieving all boxes:', error);
    return createApiResponse(500, `Error retrieving boxes: ${(error as Error).message}`);
  }
}

/**
 * Get unassigned boxes in packing
 * @returns {Promise<ApiResponse>} API response
 */
export async function getUnassignedBoxesInPacking(): Promise<ApiResponse> {
  try {
    const boxes = await dbUtils.scanItems(
      Box.getTableName(),
      'ubicacion = :location AND attribute_not_exists(palletId)',
      { ':location': SystemConfig.getLocations().PACKING }
    );
    return createApiResponse(200, "Unassigned boxes in packing fetched successfully", boxes);
  } catch (error) {
    console.error('❌ Error retrieving unassigned boxes in packing:', error);
    return createApiResponse(500, `Error retrieving unassigned boxes: ${(error as Error).message}`);
  }
}

export default {
  getBoxByCode,
  getUnassignedBoxesInPacking,
  getBoxesByLocation,
  getAllBoxes,
  getBoxesByDate
}; 