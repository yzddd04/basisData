import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRefresh } from '../../contexts/RefreshContext';
import api from '../../services/api';

interface TrashItem {
  id: string;
  type: 'book' | 'member' | 'staff';
  name: string;
  email: string;
  phone: string;
  deletedAt: string;
  deletedBy: string;
  documentData: any;
}

const Trash: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { trashRefreshKey, refreshTrash } = useRefresh();

  useEffect(() => {
    const fetchTrashItems = async () => {
      try {
        const response = await api.get('/trash');
        // response.data adalah array gabungan dari members, staffs, books yang isDeleted: true
        setTrashItems(
          response.data.map((item: any) => ({
            id: item._id,
            type: item.type,
            name: item.name || item.title || '-',
            email: item.email || '-',
            phone: item.phone || '-',
            role: item.role || '-',
            deletedAt: item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '-',
            deletedBy: '-', // tidak ada info deletedBy di model utama
            documentData: item,
          }))
        );
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch trash items');
        console.error('Failed to fetch trash items:', error);
        setLoading(false);
      }
    };

    fetchTrashItems();
  }, [/* page, */ trashRefreshKey]); // Remove page from dependency if removed state

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === trashItems.length 
        ? [] 
        : trashItems.map(item => item.id)
    );
  };

  const handleRestore = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to restore');
      return;
    }

    try {
      for (const itemId of selectedItems) {
        const item = trashItems.find((i) => i.id === itemId);
        if (!item) continue;
        await api.put(`/trash/${itemId}/restore`, { type: item.type });
      }
      toast.success('Selected items restored successfully');
      setSelectedItems([]);
      refreshTrash();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restore items');
      console.error('Failed to restore items:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete these items? This action cannot be undone.')) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        const item = trashItems.find((i) => i.id === itemId);
        if (!item) continue;
        await api.delete(`/trash/${itemId}`, { data: { type: item.type } });
      }
      toast.success('Selected items deleted permanently');
      setSelectedItems([]);
      refreshTrash();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete items');
      console.error('Failed to delete items:', error);
    }
  };

  // Gabungkan trash member dan staff
  const peopleTrashItems = trashItems.filter(item => item.type === 'member' || item.type === 'staff');

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!loading && peopleTrashItems.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Trash - People</h1>
        <p className="mt-4 text-gray-600">No deleted members or staff found.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trash</h1>
        <div className="space-x-4">
          <button
            onClick={handleRestore}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Restore Selected
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            Delete Permanently
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === peopleTrashItems.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peopleTrashItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.role || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.deletedAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.deletedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trash; 