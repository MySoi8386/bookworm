/**
 * ===================================================================
 * EXTEND MODAL - Modal gia hạn phiếu mượn
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { HiOutlineCalendar } from 'react-icons/hi';

const ExtendModal = ({ isOpen, onClose, onConfirm, borrowRequest, loading = false }) => {
    const [newDueDate, setNewDueDate] = useState('');
    const [notes, setNotes] = useState('');

    // Set initial due date when modal opens or borrowRequest changes
    useEffect(() => {
        if (isOpen && borrowRequest?.due_date) {
            // Set default to current due date + 7 days (or tomorrow if overdue)
            const currentDue = new Date(borrowRequest.due_date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // If current due date is in the past, start from tomorrow
            // Otherwise, extend by 7 days from current due date
            const defaultDate = currentDue < today 
                ? tomorrow 
                : new Date(currentDue);
            
            if (currentDue >= today) {
                defaultDate.setDate(defaultDate.getDate() + 7);
            }
            
            setNewDueDate(defaultDate.toISOString().split('T')[0]);
        } else if (isOpen) {
            // If no due date, set to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNewDueDate(tomorrow.toISOString().split('T')[0]);
        }
        
        // Reset notes when modal opens
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen, borrowRequest?.due_date]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newDueDate) return;
        onConfirm(newDueDate, notes);
    };

    // Get minimum date (must be after current due date or tomorrow)
    const getMinDate = () => {
        if (borrowRequest?.due_date) {
            const currentDue = new Date(borrowRequest.due_date);
            const today = new Date();
            // Must be after current due date, or tomorrow if overdue
            const minDate = currentDue > today ? currentDue : new Date(today);
            minDate.setDate(minDate.getDate() + 1);
            return minDate.toISOString().split('T')[0];
        }
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gia hạn phiếu mượn" size="sm">
            <form onSubmit={handleSubmit} className="space-y-5">
                {borrowRequest && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Phiếu mượn</p>
                        <p className="font-semibold text-gray-900">#{borrowRequest.id}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Hạn hiện tại: {new Date(borrowRequest.due_date).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiOutlineCalendar className="inline w-4 h-4 mr-1" />
                        Ngày hạn mới
                    </label>
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        min={getMinDate()}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Lý do gia hạn..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !newDueDate}
                        className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Gia hạn
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ExtendModal;
