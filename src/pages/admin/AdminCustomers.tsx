import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { adminGetCustomers } from '@/services/admin';
import { formatDate } from '@/utils/format';
import { PageLoader } from '@/components/Loaders';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminGetCustomers()
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Customers ({customers.length})</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-12">No customers found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden sm:table-cell">Phone</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-900">{c.full_name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{c.phone ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{formatDate(c.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
