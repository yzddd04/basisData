import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Import instance API

interface Member {
  _id: string; // Ubah dari 'id' menjadi '_id' sesuai backend
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string; // Asumsikan format string tanggal dari backend
}

const MemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        // Ganti dengan panggilan API yang sebenarnya
        const response = await api.get(`/members/${id}`); // Endpoint GET /api/members/:id
        // Asumsikan respons backend langsung berupa objek anggota
        setMember(response.data); // Sesuaikan jika struktur respons berbeda
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch member details');
        console.error('Failed to fetch member details:', error);
        setLoading(false);
      }
    };

    if (id) { // Pastikan ada id sebelum fetch
       fetchMemberDetails();
    } else {
      setLoading(false); // Jika tidak ada id, tidak perlu fetch
    }

  }, [id]); // Jalankan ulang efek jika id berubah

  const handleDelete = async () => {
     if (!member) return;

    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/members/${member._id}`);
        toast.success('Member deleted successfully'); // Ini akan dipanggil jika API call berhasil
        navigate('/members');
      } catch (error) {
        toast.error('Failed to delete member');
        console.error('Failed to delete member:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!member) {
    return <div className="text-center py-8">Member not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Member Details</h1>
          <div className="space-x-4">
            <Link
              to={`/members/${member._id}/edit`} // Gunakan _id untuk navigasi
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </Link>
            {/* Delete button is now on the list page */}
            {/* <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button> */}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{member.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{member.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1">{member.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
               {/* Format tanggal jika perlu, atau tampilkan langsung */}
              <p className="mt-1">{new Date(member.membershipDate).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1">{member.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails; 