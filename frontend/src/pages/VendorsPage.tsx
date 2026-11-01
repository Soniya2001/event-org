import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Phone, Mail, Globe, ArrowLeft, Trash2, Edit2, 
  CheckCircle, Clock, DollarSign, Shield, ExternalLink, Filter
} from 'lucide-react';
import { EventItem, VendorItem } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

interface VendorsPageProps {
  event: EventItem;
  onBack: () => void;
}

export const VendorsPage: React.FC<VendorsPageProps> = ({ event, onBack }) => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<number | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Venue & Banquets');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [estimatedQuote, setEstimatedQuote] = useState('0');
  const [actualQuote, setActualQuote] = useState('0');
  const [bookingStatus, setBookingStatus] = useState<any>('NOT_CONTACTED');
  const [paymentStatus, setPaymentStatus] = useState<any>('UNPAID');
  const [notes, setNotes] = useState('');

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVendors(event.id);
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [event.id]);

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: vendorName,
      category: vendorCategory,
      contact_details: {
        contact_person: contactPerson,
        phone,
        email,
        website,
      },
      estimated_quote: parseFloat(estimatedQuote) || 0,
      actual_quote: parseFloat(actualQuote) || 0,
      booking_status: bookingStatus,
      payment_status: paymentStatus,
      notes,
    };

    try {
      if (editingVendorId) {
        await api.updateVendor(event.id, editingVendorId, payload);
      } else {
        await api.createVendor(event.id, payload);
      }
      setIsModalOpen(false);
      setEditingVendorId(null);
      resetForm();
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (!window.confirm('Delete this vendor record?')) return;
    try {
      await api.deleteVendor(event.id, vendorId);
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setVendorName('');
    setVendorCategory('Venue & Banquets');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setEstimatedQuote('0');
    setActualQuote('0');
    setBookingStatus('NOT_CONTACTED');
    setPaymentStatus('UNPAID');
    setNotes('');
  };

  const categories = Array.from(new Set(vendors.map(v => v.category)));

  const filteredVendors = vendors.filter(v => {
    if (filterCategory === 'all') return true;
    return v.category === filterCategory;
  });

  // Quotation comparison metrics
  const totalEstimated = vendors.reduce((acc, v) => acc + (v.estimated_quote || 0), 0);
  const totalBooked = vendors.filter(v => v.booking_status === 'BOOKED').reduce((acc, v) => acc + (v.actual_quote || 0), 0);
  const bookedCount = vendors.filter(v => v.booking_status === 'BOOKED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-purple-200 text-slate-600 hover:text-slate-900 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Vendor Directory & Quotation Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Procurement pipeline & quotation comparisons for {event.event_name}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingVendorId(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Vendors In Directory</span>
          <p className="text-3xl font-bold font-serif text-slate-900 mt-1">{vendors.length}</p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
            {bookedCount} contracts confirmed
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Estimated Quotations</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
            {event.currency} {totalEstimated.toLocaleString()}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Pipeline aggregate
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Confirmed Contract Total</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-700 mt-1">
            {event.currency} {totalBooked.toLocaleString()}
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Signed contracts
          </span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-brand-600 text-white font-bold shadow-soft'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-brand-600 text-white font-bold shadow-soft'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const bookingBadge = {
            BOOKED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            QUOTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
            DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
            NOT_CONTACTED: 'bg-slate-100 text-slate-600 border-slate-200',
          }[vendor.booking_status] || 'bg-slate-100 text-slate-600 border-slate-200';

          const paymentBadge = {
            FULLY_PAID: 'text-emerald-700 bg-emerald-50',
            ADVANCE_PAID: 'text-amber-700 bg-amber-50',
            UNPAID: 'text-slate-600 bg-slate-100',
          }[vendor.payment_status] || 'text-slate-600 bg-slate-100';

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${bookingBadge}`}>
                    {vendor.booking_status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {vendor.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-900 truncate">
                    {vendor.name}
                  </h3>
                  {vendor.selection_criteria && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {vendor.selection_criteria}
                    </p>
                  )}
                </div>

                {/* Quotation Comparison */}
                <div className="bg-[#FAF8FF] p-3.5 rounded-2xl border border-purple-100/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Estimated</span>
                    <span className="font-bold text-slate-700">
                      {event.currency} {vendor.estimated_quote.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Actual Quote</span>
                    <span className="font-bold text-slate-900">
                      {vendor.actual_quote > 0 ? `${event.currency} ${vendor.actual_quote.toLocaleString()}` : 'Pending Quote'}
                    </span>
                  </div>
                </div>

                {/* Contact items */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  {vendor.contact_details?.contact_person && (
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Rep:</span>
                      <span className="font-medium text-slate-800">{vendor.contact_details.contact_person}</span>
                    </div>
                  )}
                  {vendor.contact_details?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-brand-600" />
                      <span>{vendor.contact_details.phone}</span>
                    </div>
                  )}
                  {vendor.contact_details?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-brand-600" />
                      <span className="truncate">{vendor.contact_details.email}</span>
                    </div>
                  )}
                  {vendor.contact_details?.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-brand-600" />
                      <a href={vendor.contact_details.website} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline truncate">
                        {vendor.contact_details.website}
                      </a>
                    </div>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-purple-50 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${paymentBadge}`}>
                  {vendor.payment_status.replace('_', ' ')}
                </span>
                <div className="space-x-1">
                  <button
                    onClick={() => {
                      setEditingVendorId(vendor.id);
                      setVendorName(vendor.name);
                      setVendorCategory(vendor.category);
                      setContactPerson(vendor.contact_details?.contact_person || '');
                      setPhone(vendor.contact_details?.phone || '');
                      setEmail(vendor.contact_details?.email || '');
                      setWebsite(vendor.contact_details?.website || '');
                      setEstimatedQuote(vendor.estimated_quote.toString());
                      setActualQuote(vendor.actual_quote.toString());
                      setBookingStatus(vendor.booking_status);
                      setPaymentStatus(vendor.payment_status);
                      setNotes(vendor.notes || '');
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                    title="Edit vendor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE/EDIT VENDOR MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendorId ? 'Edit Vendor Details' : 'Add New Vendor'}
        subtitle="Track quotations, service contracts, and payment stages"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Studio Name *</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Royal Palace Banquets / Studio Luminance"
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
                placeholder="e.g. Venue, Catering, Photography, Florals"
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@vendor.com"
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website / Portfolio</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Quote ({event.currency})</label>
              <input
                type="number"
                step="100"
                value={estimatedQuote}
                onChange={(e) => setEstimatedQuote(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Contract Quote ({event.currency})</label>
              <input
                type="number"
                step="100"
                value={actualQuote}
                onChange={(e) => setActualQuote(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Booking Status</label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value="NOT_CONTACTED">Not Contacted</option>
                <option value="CONTACTED">Contacted / Inquiry Sent</option>
                <option value="QUOTED">Quotation Received</option>
                <option value="BOOKED">Contract Confirmed & Booked</option>
                <option value="DECLINED">Declined / Passed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="ADVANCE_PAID">Advance / Deposit Paid</option>
                <option value="FULLY_PAID">Fully Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes & Inclusions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes lighting rig and wireless microphone kit..."
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

