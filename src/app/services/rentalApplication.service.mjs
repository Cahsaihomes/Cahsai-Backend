import * as rentalRepo from '../repositories/rentalApplication.repo.mjs';
import { User } from '../../models/userModel/index.mjs';
import { uploadToCloudinary } from '../../utils/helper.mjs';

export const createRentalApplication = async (formData, files) => {
  try {
    console.log('Files received:', files);
    
    // Upload files to Cloudinary
    const uploadedFiles = {};
    
    if (files.governmentId) {
      console.log('Uploading governmentId:', files.governmentId[0]);
      uploadedFiles.governmentId = await uploadToCloudinary(
        files.governmentId[0],
        'rental_applications/government_ids'
      );
    }

    if (files.proofOfIncomeFile) {
      console.log('Uploading proofOfIncomeFile:', files.proofOfIncomeFile[0]);
      uploadedFiles.proofOfIncomeFile = await uploadToCloudinary(
        files.proofOfIncomeFile[0],
        'rental_applications/proof_of_income'
      );
    }

    if (files.studentLetter) {
      uploadedFiles.studentLetter = await uploadToCloudinary(
        files.studentLetter[0],
        'rental_applications/student_letters'
      );
    }

    if (files.guarantorDocs) {
      uploadedFiles.guarantorDocs = await uploadToCloudinary(
        files.guarantorDocs[0],
        'rental_applications/guarantor_docs'
      );
    }

    if (files.petVaccinationRecords) {
      uploadedFiles.petVaccinationRecords = await uploadToCloudinary(
        files.petVaccinationRecords[0],
        'rental_applications/pet_records'
      );
    }

    // Prepare application data
    const applicationData = {
      ...formData,
      ...uploadedFiles,
      numMinors: formData.numMinors || 0,
      hasPets: formData.hasPets === 'true' || formData.hasPets === true,
      monthlyIncome: parseFloat(formData.monthlyIncome),
      numAdults: parseInt(formData.numAdults),
    };

    const application = await rentalRepo.createRentalApplication(applicationData);

    return {
      status: 'success',
      message: 'Rental application submitted successfully',
      data: application,
    };
  } catch (error) {
    console.error('Error in createRentalApplication service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const getApplicationById = async (id) => {
  try {
    const application = await rentalRepo.getRentalApplicationById(id);
    
    if (!application) {
      return {
        status: 'error',
        message: 'Application not found',
      };
    }

    return {
      status: 'success',
      data: application,
    };
  } catch (error) {
    console.error('Error in getApplicationById service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const getUserApplications = async (userId) => {
  try {
    const applications = await rentalRepo.getRentalApplicationsByUserId(userId);
    
    return {
      status: 'success',
      count: applications.length,
      data: applications,
    };
  } catch (error) {
    console.error('Error in getUserApplications service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const getAllApplications = async (filters = {}) => {
  try {
    console.log('getAllApplications service called with filters:', filters);
    const applications = await rentalRepo.getAllRentalApplications(filters);
    console.log('getAllApplications service got applications:', applications.length);
    
    return {
      status: 'success',
      count: applications.length,
      data: applications,
    };
  } catch (error) {
    console.error('Error in getAllApplications service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const updateApplication = async (id, updateData) => {
  try {
    const application = await rentalRepo.updateRentalApplication(id, updateData);
    
    if (!application) {
      return {
        status: 'error',
        message: 'Application not found',
      };
    }

    return {
      status: 'success',
      message: 'Application updated successfully',
      data: application,
    };
  } catch (error) {
    console.error('Error in updateApplication service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return {
        status: 'error',
        message: 'Invalid status value',
      };
    }

    const application = await rentalRepo.updateApplicationStatus(id, status);

    if (!application) {
      return {
        status: 'error',
        message: 'Application not found',
      };
    }

    // If approved, update user's isRentalCompany field
    if (status === 'approved' && application.userId) {
      const user = await User.findByPk(application.userId);
      if (user) {
        await user.update({ isRentalCompany: true });
        console.log(`User ${application.userId} marked as rental company`);
      }
    }

    return {
      status: 'success',
      message: `Application status updated to ${status}`,
      data: application,
    };
  } catch (error) {
    console.error('Error in updateApplicationStatus service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};

export const deleteApplication = async (id) => {
  try {
    const deleted = await rentalRepo.deleteRentalApplication(id);
    
    if (!deleted) {
      return {
        status: 'error',
        message: 'Application not found',
      };
    }

    return {
      status: 'success',
      message: 'Application deleted successfully',
    };
  } catch (error) {
    console.error('Error in deleteApplication service:', error);
    return {
      status: 'error',
      message: error.message,
    };
  }
};
