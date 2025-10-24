export interface IUser {
  createdAt: string;
  email: string;
  fullName: string;
  profilePic?: string;
  updatedAt: string;
  __v: number;
  _id: string;
}
export interface IFormDataSignUp {
  fullName: string;
  email: string;
  password: string;
}
export interface IFormDataLogin {
  email: string;
  password: string;
}
export interface IFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
}
