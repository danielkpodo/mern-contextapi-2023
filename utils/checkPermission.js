import { UnauthenticatedError } from '../errors/index.js';

const checkPermission = (requestUser, resourceId) => {
  if (requestUser.userId === resourceId.toString()) return; // if the user is the owner of the resource, return and proceed
  throw new UnauthenticatedError(
    'You are not authorized to perform this action'
  );
  return;
};

export default checkPermission;
