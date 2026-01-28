/**
 * ===================================================================
 * ALERT MODAL - Modal hiển thị thông báo/ cảnh báo
 * ===================================================================
 */

import Modal from './Modal';
import { HiOutlineExclamation, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

const AlertModal = ({
    isOpen,
    onClose,
    title = 'Thông báo',
    message,
    type = 'warning', // 'warning', 'danger', 'success', 'info'
    buttonText = 'Đóng'
}) => {
    const typeConfig = {
        warning: {
            icon: HiOutlineExclamation,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
        },
        danger: {
            icon: HiOutlineX,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        },
        success: {
            icon: HiOutlineCheck,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        info: {
            icon: HiOutlineExclamation,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        }
    };

    const config = typeConfig[type] || typeConfig.warning;
    const Icon = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AlertModal;
