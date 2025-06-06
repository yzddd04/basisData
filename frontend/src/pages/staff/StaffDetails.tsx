import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Import instance API

interface Staff {
  _id: string; // Ubah dari 'id' menjadi '_id' sesuai backend
  name: string;
  email: string;
  role: string;
  joinDate: string; // Asumsikan format string dari backend
  status: 'active' | 'inactive'; // Sesuai backend jika ada
  phone: string;
  address: string;
}

const StaffDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        // Ganti dengan panggilan API yang sebenarnya
        const response = await api.get(`/staff/${id}`); // Endpoint GET /api/staff/:id
        // Asumsikan respons backend langsung berupa objek staf
        setStaff(response.data); // Sesuaikan jika struktur respons berbeda (misalnya response.data.staff)
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch staff details');
        console.error('Failed to fetch staff details:', error);
        setLoading(false);
      }
    };

    if (id) { // Pastikan ada id sebelum fetch
      fetchStaffDetails();
    } else {
      setLoading(false); // Jika tidak ada id, tidak perlu fetch
    }

  }, [id]); // Jalankan ulang efek jika id berubah

  const handleStatusToggle = async () => {
    if (!staff) return;

    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';

    if (window.confirm(`Are you sure you want to ${action} this staff member?`)) {
      try {
        // TODO: Replace with actual API call for status toggle
        // Contoh: await api.put(`/api/staff/${staff._id}/status`, { status: newStatus });
        setStaff(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Staff member ${action}d successfully`);
      } catch (error) {
        toast.error(`Failed to ${action} staff member`);
        console.error(`Failed to ${action} staff member:`, error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!staff) {
    return <div className="py-8 text-center">Staff member not found</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Staff Details</h1>
          <div className="space-x-4">
            <Link
              to={`/staff/${staff._id}/edit`} // Gunakan _id untuk navigasi
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Edit
            </Link>
            <button
              onClick={handleStatusToggle}
              className={`px-4 py-2 text-white rounded ${
                staff.status === 'active'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {staff.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{staff.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{staff.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1">{staff.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
              {/* Format tanggal jika perlu, atau tampilkan langsung */}
              <p className="mt-1">{new Date(staff.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              {/* Perlu disesuaikan jika backend tidak mengembalikan status */}
              <p className="mt-1 capitalize">{staff.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1">{staff.phone}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1">{staff.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails; 
