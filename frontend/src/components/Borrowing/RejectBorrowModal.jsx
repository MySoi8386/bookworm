/**
 * ===================================================================
 * REJECT BORROW MODAL - Nhập lý do huỷ/từ chối phiếu mượn
 * ===================================================================
 */

import { useEffect, useState } from 'react';
import Modal from '../Modal';

const RejectBorrowModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    borrowRequestId
}) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={loading ? () => {} : onClose}
            title={`Huỷ phiếu${borrowRequestId ? ` #${borrowRequestId}` : ''}`}
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Vui lòng nhập lý do huỷ trước khi xác nhận.
                </p>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lý do huỷ
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Nhập lý do..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => onConfirm?.(reason)}
                        disabled={loading || !reason.trim()}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Xác nhận huỷ
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RejectBorrowModal;

