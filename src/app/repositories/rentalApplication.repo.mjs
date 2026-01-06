import { RentalApplication } from '../../models/rentalApplicationModel/index.mjs';
import { User } from '../../models/userModel/index.mjs';

export const createRentalApplication = async (data) => {
  return await RentalApplication.create(data);
};

export const getRentalApplicationById = async (id) => {
  return await RentalApplication.findByPk(id, {
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'contact'],
    }],
  });
};

export const getRentalApplicationsByUserId = async (userId) => {
  return await RentalApplication.findAll({
    where: { userId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'contact'],
    }],
    order: [['createdAt', 'DESC']],
  });
};

export const getAllRentalApplications = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.userId) where.userId = filters.userId;
  
  console.log('getAllRentalApplications filters:', filters, 'where:', where);
  
  const applications = await RentalApplication.findAll({
    where,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email', 'contact'],
    }],
    order: [['createdAt', 'DESC']],
  });
  
  console.log('getAllRentalApplications found:', applications.length, 'applications');
  return applications;
};

export const updateRentalApplication = async (id, data) => {
  const application = await RentalApplication.findByPk(id);
  if (!application) return null;
  
  return await application.update(data);
};

export const deleteRentalApplication = async (id) => {
  const application = await RentalApplication.findByPk(id);
  if (!application) return false;
  
  await application.destroy();
  return true;
};

export const updateApplicationStatus = async (id, status) => {
  const application = await RentalApplication.findByPk(id);
  if (!application) return null;
  
  await application.update({ status });
  return application;
};

export default {
  createRentalApplication,
  getRentalApplicationById,
  getRentalApplicationsByUserId,
  getAllRentalApplications,
  updateRentalApplication,
  deleteRentalApplication,
  updateApplicationStatus,
};
