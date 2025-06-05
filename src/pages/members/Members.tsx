import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Import instance API
import { useRefresh } from '../../contexts/RefreshContext'; // Import useRefresh
import { AxiosError } from 'axios';

interface Member {
  _id: string; // Ubah dari 'id' menjadi '_id' sesuai backend
  name: string;
  email: string;
  phone: string;
  membershipDate: string; // Ubah dari 'joinDate' dan asumsikan string tanggal
  isDeleted: boolean;
  createdAt: string;
  membershipExpiry?: string; // tambahkan field ini
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { memberRefreshKey, refreshMembers } = useRefresh(); // Gunakan useRefresh dan memberRefreshKey

  useEffect(() => {
    fetchMembers();
  }, [memberRefreshKey]); // Tambahkan memberRefreshKey sebagai dependency

  const fetchMembers = async () => {
    try {
      // Ganti dengan panggilan API yang sebenarnya
      const response = await api.get('/members');
      // Respons backend memiliki struktur { members: [...], ... }
      setMembers(response.data.members);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch members');
      console.error('Failed to fetch members:', error);
      setLoading(false);
    }
  };

  // Function to handle member deletion
  const handleDelete = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/members/${memberId}`);
        toast.success('Member deleted successfully');
        refreshMembers(); // Call refreshMembers after successful deletion
      } catch (error: unknown) { // Use unknown for catch clause variable type
        if (error instanceof AxiosError && error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete member');
        }
        console.error('Failed to delete member:', error);
      }
    }
  };

  // Filter hanya member yang belum dihapus (jaga-jaga jika backend tidak filter)
  const visibleMembers = members.filter((m) => !m.isDeleted);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Periksa jika daftar anggota kosong setelah loading
  if (visibleMembers.length === 0 && !loading) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="mb-6 text-2xl font-bold">Members</h1>
         <Link
          to="/members/add"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add New Member
        </Link>
        <p className="mt-4 text-gray-600">No members found.</p>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <Link
          to="/members/add"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add New Member
        </Link>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Join Date
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Membership Expiry
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleMembers.map((member) => (
              <tr key={member._id}> {/* Gunakan _id sebagai key */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Format tanggal jika perlu, atau tampilkan langsung */}
                  <div className="text-sm text-gray-500">{member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : (member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  {/* Gunakan _id untuk navigasi */}
                  <Link
                    to={`/members/${member._id}`}
                    className="mr-4 text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link><Link
                    to={`/members/${member._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="ml-4 text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members; 