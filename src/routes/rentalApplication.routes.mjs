import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.mjs';
import { postUpload } from '../middlewares/postUpload.middleware.mjs';
import {
  submitRentalApplication,
  getApplicationById,
  getUserApplications,
  getAllApplications,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/rentalApplication.controller.mjs';

const router = Router();

// POST /rental-applications/submit - Submit a new rental application
router.post(
  '/submit',
  isAuthenticated,
  postUpload.fields([
    { name: 'governmentId', maxCount: 1 },
    { name: 'proofOfIncomeFile', maxCount: 1 },
    { name: 'studentLetter', maxCount: 1 },
    { name: 'guarantorDocs', maxCount: 1 },
    { name: 'petVaccinationRecords', maxCount: 1 },
  ]),
  submitRentalApplication
);

// GET /rental-applications/:id - Get application by ID
router.get('/:id', getApplicationById);

// GET /rental-applications/user/my-applications - Get current user's applications
router.get('/user/my-applications', isAuthenticated, getUserApplications);

// GET /rental-applications - Get all applications (admin only)
router.get('/', getAllApplications);

// PUT /rental-applications/:id - Update application
router.put('/:id', isAuthenticated, updateApplication);

// PATCH /rental-applications/:id/status - Update application status (admin only)
router.patch('/:id/status', updateApplicationStatus);

// DELETE /rental-applications/:id - Delete application
router.delete('/:id', isAuthenticated, deleteApplication);

export default router;
