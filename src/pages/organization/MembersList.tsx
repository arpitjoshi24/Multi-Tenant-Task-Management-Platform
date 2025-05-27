import React, { useEffect, useState } from 'react';
import { 
  getOrganizationMembers, 
  inviteUser, 
  updateUserRole, 
  removeUser,
  getPendingInvitations,
  cancelInvitation
} from '../../services/organizationService';
import { User, Invitation, UserRole, InviteUserFormInputs } from '../../types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, 
  UserPlus, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Check, 
  X, 
  
  ChevronDown
} from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER]),
});

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormInputs>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: UserRole.MEMBER,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, invitationsData] = await Promise.all([
        getOrganizationMembers(),
        getPendingInvitations(),
      ]);
      setMembers(membersData);
      setInvitations(invitationsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching organization data:', err);
      setError('Failed to load organization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onInviteSubmit = async (data: InviteUserFormInputs) => {
    try {
      setInviting(true);
      setError(null);
      const response = await inviteUser(data);
      setInvitations([...invitations, response]);
      
      // Generate invite link
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/register?token=${response.token}`);
      
      reset();
      setShowInviteForm(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while sending invitation');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setMembers(members.map(member => 
        member._id === userId ? { ...member, role: newRole } : member
      ));
      // Close dropdown
      setDropdownOpen({ ...dropdownOpen, [userId]: false });
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the organization?')) {
      return;
    }
    
    try {
      await removeUser(userId);
      // Update local state
      setMembers(members.filter(member => member._id !== userId));
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user. Please try again.');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }
    
    try {
      await cancelInvitation(invitationId);
      // Update local state
      setInvitations(invitations.filter(invitation => invitation._id !== invitationId));
      setInviteLink(null);
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setError('Failed to cancel invitation. Please try again.');
    }
  };

  const toggleDropdown = (userId: string) => {
    setDropdownOpen({
      ...dropdownOpen,
      [userId]: !dropdownOpen[userId],
    });
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invitation link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Loading team members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="btn btn-primary flex items-center"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Invite Member
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {inviteLink && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-3 flex-grow">
              <p className="text-sm text-green-700">Invitation sent successfully! Share this link with the recipient:</p>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-grow input text-sm py-1 px-2"
                />
                <button
                  onClick={copyInviteLink}
                  className="mt-2 sm:mt-0 sm:ml-2 btn btn-outline py-1 px-3 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              className="mt-2 sm:mt-0 sm:ml-2 text-green-700 hover:text-green-900"
              onClick={() => setInviteLink(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {showInviteForm && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Invite New Member</h2>
          <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`mt-1 input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="member@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
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
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  reset();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="btn btn-primary"
              >
                {inviting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg ">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Active Members ({members.length})
          </h2>
        </div>
        
        {members.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No members found. Invite members to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 ">
            {members.map((member) => (
              <li key={member._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 ">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${member.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                      member.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  
                  <div className="ml-4 relative">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => toggleDropdown(member._id)}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                    
                    {dropdownOpen[member._id] && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                          Change Role
                        </div>
                        
                        <button
                          onClick={() => handleRoleChange(member._id, UserRole.ADMIN)}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                            member.role === UserRole.ADMIN ? 'bg-gray-100' : ''
                          }`}
                          disabled={member.role === UserRole.ADMIN}
                        >
                          Admin
                        </button>
                        
                        <button
                          onClick={() => handleRoleChange(member._id, UserRole.MANAGER)}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                            member.role === UserRole.MANAGER ? 'bg-gray-100' : ''
                          }`}
                          disabled={member.role === UserRole.MANAGER}
                        >
                          Manager
                        </button>
                        
                        <button
                          onClick={() => handleRoleChange(member._id, UserRole.MEMBER)}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                            member.role === UserRole.MEMBER ? 'bg-gray-100' : ''
                          }`}
                          disabled={member.role === UserRole.MEMBER}
                        >
                          Member
                        </button>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          Remove from organization
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {invitations.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Pending Invitations ({invitations.length})
            </h2>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <li key={invitation._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${invitation.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                        invitation.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}
                    `}>
                      {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Sent {new Date(invitation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => handleCancelInvitation(invitation._id)}
                    className="text-red-600 hover:text-red-900 focus:outline-none"
                    title="Cancel invitation"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MembersList;