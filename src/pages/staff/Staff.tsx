import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Import instance API
import { useRefresh } from '../../contexts/RefreshContext'; // Import useRefresh

interface Staff {
  _id: string; // Ubah dari 'id' menjadi '_id' sesuai backend
  name: string;
  email: string;
  role: string;
  joinDate: string; // Asumsikan format string dari backend
  status: 'active' | 'inactive'; // Sesuai backend jika ada
  isDeleted?: boolean; // Optional isDeleted field
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { staffRefreshKey } = useRefresh(); // Gunakan useRefresh dan staffRefreshKey

  useEffect(() => {
    fetchStaff();
  }, [page, search, staffRefreshKey]); // Tambahkan staffRefreshKey sebagai dependency

  const fetchStaff = async () => {
    try {
      // Ganti dengan panggilan API yang sebenarnya
      const response = await api.get('/staff'); // Endpoint GET /api/staff
      console.log('Staff API response:', response.data);
      // Perbaiki assignment agar tidak error jika response.data.staffs undefined
      if (Array.isArray(response.data.staff)) {
        setStaff(response.data.staff);
      } else if (Array.isArray(response.data)) {
        setStaff(response.data);
      } else if (Array.isArray(response.data.staffs)) {
        setStaff(response.data.staffs);
      } else {
        setStaff([]);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch staff data');
      console.error('Failed to fetch staff data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: Staff['status']) => {
    // Perlu disesuaikan jika backend tidak mengembalikan status
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/staff/${staffId}`);
        toast.success('Staff member deleted successfully');
        fetchStaff(); // Refresh data
      } catch (error) {
        toast.error('Failed to delete staff member');
        console.error('Failed to delete staff member:', error);
      }
    }
  };

  // Filter hanya staff yang belum dihapus (jaga-jaga jika backend tidak filter)
  const visibleStaff = staff.filter((s: any) => !s.isDeleted);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Periksa jika daftar staf kosong setelah loading
  if (visibleStaff.length === 0 && !loading) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Staff Members</h1>
         <Link
          to="/staff/add"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add New Staff
        </Link>
        <p className="mt-4 text-gray-600">No staff members found.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff Members</h1>
        <Link
          to="/staff/add"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add New Staff
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
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Join Date
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleStaff.map((member) => (
              <tr key={member._id}> {/* Gunakan _id sebagai key */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{member.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Format tanggal jika perlu, atau tampilkan langsung */}
                  <div className="text-sm text-gray-500">{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {/* Perlu disesuaikan jika backend tidak mengembalikan status */}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status || 'inactive')}`}>
                    {(member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                   {/* Gunakan _id untuk navigasi */}
                  <Link
                    to={`/staff/${member._id}`}
                    className="mr-4 text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <Link
                    to={`/staff/${member._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteStaff(member._id)}
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

export default Staff; 