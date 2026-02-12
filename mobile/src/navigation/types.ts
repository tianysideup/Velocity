import { Vehicle } from '../services/vehicleService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  GetStarted: undefined;
  Home: undefined;
  VehicleDetails: { vehicle: Vehicle };
  Reservation: { vehicle: Vehicle };
  Notifications: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  AboutApp: undefined;
  PrivacyPolicy: undefined;
  HelpSupport: undefined;
};
