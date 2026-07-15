import express from 'express';
import { CountryController } from './country.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/', auth('SUPER_ADMIN'), CountryController.createCountry);
router.get('/', CountryController.getAllCountries);
router.patch('/:id', auth('SUPER_ADMIN'), CountryController.updateCountry);
router.delete('/:id', auth('SUPER_ADMIN'), CountryController.deleteCountry);

export const CountryRoutes = router;
