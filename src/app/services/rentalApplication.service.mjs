import * as rentalRepo from '../repositories/rentalApplication.repo.mjs';
import { User } from '../../models/userModel/index.mjs';
import { uploadToCloudinary } from '../../utils/helper.mjs';
import sendEmail from '../../utils/sendEmail.mjs';

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

    // Get user details for email
    const user = await User.findByPk(application.userId);

    // If approved, update user's isRentalCompany field
    if (status === 'approved' && application.userId) {
      if (user) {
        await user.update({ isRentalCompany: true });
        console.log(`User ${application.userId} marked as rental company`);
      }
    }

    // Send email based on status
    if (user && user.email) {
      try {
        if (status === 'approved') {
          const approvalEmailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #27ae60; text-align: center;">🎉 Rental Application Approved</h2>
              
              <p>Dear <strong>${user.first_name} ${user.last_name}</strong>,</p>
              
              <p>We are pleased to inform you that your rental application has been <strong style="color: #27ae60;">APPROVED</strong>!</p>
              
              <div style="background-color: #f0f8f0; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #27ae60;">Application Details:</h3>
                <p><strong>Applicant Name:</strong> ${application.fullName}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phoneNumber}</p>
                <p><strong>Desired Move-in Date:</strong> ${new Date(application.desiredMoveInDate).toLocaleDateString()}</p>
              </div>
              
              <p>Next Steps:</p>
              <ul style="color: #333;">
                <li>You will be contacted shortly with further instructions</li>
                <li>Please have your documents ready for verification</li>
                <li>Ensure you respond promptly to any communications</li>
              </ul>
              
              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
              
              <p style="margin-top: 30px; color: #666;">
                Best regards,<br>
                <strong>CAHSAI Admin Team</strong>
              </p>
            </div>
          `;
          
          await sendEmail(user.email, approvalEmailHTML, 'Rental Application Approved ✅');
          console.log(`Approval email sent to ${user.email}`);
        } 
        else if (status === 'rejected') {
          const rejectionEmailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e74c3c; text-align: center;">⚠️ Rental Application Status Update</h2>
              
              <p>Dear <strong>${user.first_name} ${user.last_name}</strong>,</p>
              
              <p>Thank you for submitting your rental application. After careful review, we regret to inform you that your application has been <strong style="color: #e74c3c;">REJECTED</strong> at this time.</p>
              
              <div style="background-color: #ffe8e8; padding: 20px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #e74c3c;">Application Details:</h3>
                <p><strong>Applicant Name:</strong> ${application.fullName}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phoneNumber}</p>
              </div>
              
              <p><strong>What this means:</strong></p>
              <p>Unfortunately, based on our review criteria, we are unable to move forward with your application at this time. This decision may be due to various factors such as income verification, credit assessment, or other qualifying requirements.</p>
              
              <p><strong>Options:</strong></p>
              <ul style="color: #333;">
                <li>You may reapply after 6 months with updated financial information</li>
                <li>Please contact us to discuss your application in detail</li>
                <li>Consider addressing any concerns and reapply with additional documentation</li>
              </ul>
              
              <p>We appreciate your interest and encourage you to improve your application for future consideration.</p>
              
              <p style="margin-top: 30px; color: #666;">
                Best regards,<br>
                <strong>CAHSAI Admin Team</strong>
              </p>
            </div>
          `;
          
          await sendEmail(user.email, rejectionEmailHTML, 'Rental Application Status Update ⚠️');
          console.log(`Rejection email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the operation if email fails
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
