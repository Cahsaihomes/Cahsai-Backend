import * as rentalService from '../app/services/rentalApplication.service.mjs';

export const submitRentalApplication = async (req, res) => {
  try {
    const { 
      fullName, email, phoneNumber, dateOfBirth, currentAddress,
      desiredMoveInDate, monthlyIncome, employmentStatus, employerName,
      lengthOfEmployment, numAdults, numMinors, hasPets, petType,
      petBreed, petWeight, proofOfIncomeType, propertyId
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !dateOfBirth || !currentAddress ||
        !desiredMoveInDate || !monthlyIncome || !employmentStatus || !employerName ||
        !lengthOfEmployment || !numAdults || proofOfIncomeType === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // Validate pet fields if hasPets is true
    if (hasPets === 'true' || hasPets === true) {
      if (!petType || !petBreed || !petWeight) {
        return res.status(400).json({
          status: 'error',
          message: 'Pet information required when hasPets is true',
        });
      }
    }

    // Validate file uploads
    if (!req.files || !req.files.governmentId || !req.files.proofOfIncomeFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Government ID and proof of income files are required',
      });
    }

    const formData = {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      currentAddress,
      desiredMoveInDate,
      monthlyIncome,
      employmentStatus,
      employerName,
      lengthOfEmployment,
      numAdults,
      numMinors: numMinors || 0,
      hasPets: hasPets === 'true' || hasPets === true,
      petType: petType || null,
      petBreed: petBreed || null,
      petWeight: petWeight || null,
      proofOfIncomeType,
      propertyId: propertyId || null,
      userId: req.user?.id || null,
      status: 'pending',
    };

    const result = await rentalService.createRentalApplication(formData, req.files);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in submitRentalApplication:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Application ID is required',
      });
    }

    const result = await rentalService.getApplicationById(id);
    const statusCode = result.status === 'error' ? 404 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const result = await rentalService.getUserApplications(userId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUserApplications:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (userId) filters.userId = userId;

    console.log('getAllApplications controller called with query:', req.query);
    const result = await rentalService.getAllApplications(filters);
    console.log('getAllApplications controller result:', result);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Application ID is required',
      });
    }

    const result = await rentalService.updateApplication(id, req.body);
    const statusCode = result.status === 'error' ? 404 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in updateApplication:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Application ID and status are required',
      });
    }

    const result = await rentalService.updateApplicationStatus(id, status);
    const statusCode = result.status === 'error' ? 400 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Application ID is required',
      });
    }

    const result = await rentalService.deleteApplication(id);
    const statusCode = result.status === 'error' ? 404 : 200;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in deleteApplication:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};
