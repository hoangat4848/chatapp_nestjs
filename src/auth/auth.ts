import { ValidateUsertDetails } from 'src/utils/types';

export interface IAuthService {
  validateUser(userCredentials: ValidateUsertDetails);
}
