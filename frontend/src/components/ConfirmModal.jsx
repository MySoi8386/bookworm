/**
 * ===================================================================
 * CONFIRM MODAL - Modal xác nhận hành động
 * ===================================================================
 */

import Modal from './Modal';
import { HiOutlineExclamation, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning', // 'warning', 'danger', 'success'
    loading = false
}) => {
    const typeConfig = {
        warning: {
            icon: HiOutlineExclamation,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
        },
        danger: {
            icon: HiOutlineX,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700'
        },
        success: {
            icon: HiOutlineCheck,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonBg: 'bg-green-600 hover:bg-green-700'
        }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-6 py-2.5 ${config.buttonBg} text-white rounded-lg transition-colors font-medium flex items-center gap-2`}
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
