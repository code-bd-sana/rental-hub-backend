import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CountryService } from './country.service';

const createCountry = catchAsync(async (req: Request, res: Response) => {
  const result = await CountryService.createCountry(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Country created successfully',
    data: result,
  });
});

const getAllCountries = catchAsync(async (req: Request, res: Response) => {
  const result = await CountryService.getAllCountries();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Countries retrieved successfully',
    data: result,
  });
});

const updateCountry = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CountryService.updateCountry(id, req.body);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Country updated successfully',
    data: result,
  });
});

const deleteCountry = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CountryService.deleteCountry(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Country deleted successfully',
    data: result,
  });
});

export const CountryController = {
  createCountry,
  getAllCountries,
  updateCountry,
  deleteCountry,
};
