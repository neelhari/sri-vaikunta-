import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Phone, Mail, UserCheck } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { fetchAllProfiles } from '../../lib/supabase';

export default function AdminCustomers() {
  const { orders, refreshOrders } = useStoreData();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshOrders();
    (async () => {
      setLoading(true);
      const res = await fetchAllProfiles();
      if (res.success && res.data) {
        setProfiles(res.data);
      }
      setLoading(false);
    })();
  }, [refreshOrders]);

  // Combine registered profiles with order stats
  const customersMap = {};

  // 1. Seed registered accounts
  profiles.forEach((p) => {
    const key = (p.phone || p.email || p.id).toLowerCase();
    customersMap[key] = {
      id: p.id,
      name: p.name || 'Registered Customer',
      phone: p.phone || 'N/A',
      email: p.email || 'N/A',
      isRegistered: true,
      ordersCount: 0,
      totalSpent: 0,
      lastOrder: 'No orders yet',
    };
  });

  // 2. Aggregate actual orders
  orders.forEach((o) => {
    const key = (o.customerPhone || o.customerEmail || o.customerName).toLowerCase();
    if (!customersMap[key]) {
      customersMap[key] = {
        name: o.customerName,
        phone: o.customerPhone || 'N/A',
        email: o.customerEmail || 'N/A',
        isRegistered: !!o.userId,
        ordersCount: 0,
        totalSpent: 0,
        lastOrder: o.date || 'Recent',
      };
    }
    customersMap[key].ordersCount += 1;
    customersMap[key].totalSpent += (Number(o.totalAmount) || 0);
    if (o.date) customersMap[key].lastOrder = o.date;
  });

  const customerList = Object.values(customersMap);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Customer Directory ({customerList.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time registered customer accounts and purchasing history</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spent</th>
                <th className="p-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    {loading ? 'Loading customer accounts...' : 'No customers registered yet.'}
                  </td>
                </tr>
              ) : (
                customerList.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#6B1518]/10 text-[#6B1518] flex items-center justify-center font-bold text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{c.phone}</td>
                    <td className="p-4 text-gray-500">{c.email}</td>
                    <td className="p-4">
                      {c.isRegistered ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <UserCheck className="w-3 h-3" /> Registered
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Guest Checkout
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-800">{c.ordersCount} Orders</td>
                    <td className="p-4 font-extrabold text-gray-900 text-sm">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-gray-500">{c.lastOrder}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
