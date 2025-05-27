import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterFormInputs, UserRole } from '../../types';
import { checkInvitation, checkOrganizationCode } from '../../services/authService';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  organizationName: z.string().optional(),
  joinExisting: z.boolean().default(false),
  inviteToken: z.string().optional(),
  organizationCode: z.string().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER]).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(data => {
  if (!data.joinExisting) {
    return data.organizationName && data.organizationName.length >= 2;
  }
  return true;
}, {
  message: "Organization name is required when creating a new organization",
  path: ['organizationName'],
}).refine(data => {
  if (data.joinExisting && !data.inviteToken) {
    return data.organizationCode && data.organizationCode.length > 0;
  }
  return true;
}, {
  message: "Organization code is required when joining without an invitation",
  path: ['organizationCode'],
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, error, loading, clearError } = useAuth();
  const [inviteDetails, setInviteDetails] = useState<{
    token: string;
    organization?: { name: string; id: string };
    role?: string;
  } | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeValid, setCodeValid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      joinExisting: false,
      role: UserRole.MEMBER,
    }
  });
  
  const joinExisting = watch('joinExisting');
  const organizationCode = watch('organizationCode');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setCheckingInvite(true);
      checkInvitation(token)
        .then(response => {
          if (response.valid) {
            setInviteDetails({
              token,
              organization: response.organization,
              role: response.role,
            });
            setValue('inviteToken', token);
            setValue('joinExisting', true);
            setValue('role', response.role as UserRole);
          }
        })
        .catch(error => {
          console.error('Invalid invitation:', error);
        })
        .finally(() => {
          setCheckingInvite(false);
        });
    }
  }, [location.search, setValue]);

  useEffect(() => {
    if (organizationCode) {
      const validateCode = async () => {
        setCheckingCode(true);
        try {
          const isValid = await checkOrganizationCode(organizationCode);
          setCodeValid(isValid);
        } catch (err) {
          setCodeValid(false);
        } finally {
          setCheckingCode(false);
        }
      };

      const timeoutId = setTimeout(validateCode, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setCodeValid(false);
    }
  }, [organizationCode]);

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  if (checkingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Verifying invitation...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-md bg-primary-500 flex items-center justify-center">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {inviteDetails && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  You have been invited to join {inviteDetails.organization?.name} as a{' '}
                  <span className="font-semibold">{inviteDetails.role}</span>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={clearError}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {!inviteDetails && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="joinExisting"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('joinExisting')}
                />
                <label htmlFor="joinExisting" className="ml-2 block text-sm text-gray-900">
                  Join an existing organization
                </label>
              </div>

              {joinExisting ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="organizationCode" className="block text-sm font-medium text-gray-700">
                      Organization Code
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="organizationCode"
                        type="text"
                        className={`input pr-10 ${errors.organizationCode ? 'border-red-300' : ''}`}
                        placeholder="Enter organization code"
                        {...register('organizationCode')}
                      />
                      {checkingCode ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                        </div>
                      ) : organizationCode && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {codeValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {errors.organizationCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.organizationCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      className={`mt-1 input ${errors.role ? 'border-red-300' : ''}`}
                      {...register('role')}
                    >
                      <option value={UserRole.MEMBER}>Member</option>
                      <option value={UserRole.MANAGER}>Manager</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    id="organizationName"
                    type="text"
                    className={`mt-1 input ${errors.organizationName ? 'border-red-300' : ''}`}
                    placeholder="Your company or team name"
                    {...register('organizationName')}
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;