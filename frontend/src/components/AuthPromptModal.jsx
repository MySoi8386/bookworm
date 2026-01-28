/**
 * ===================================================================
 * AUTH PROMPT MODAL - Popup yêu cầu đăng nhập/đăng ký
 * ===================================================================
 */

import Modal from './Modal';

const AuthPromptModal = ({
    isOpen,
    onClose,
    onLogin,
    onRegister,
    title = 'Bạn cần đăng nhập'
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-5">
                <p className="text-gray-600 text-sm">
                    Vui lòng đăng nhập hoặc đăng ký để sử dụng tính năng mượn sách.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onLogin}
                        className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={onRegister}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AuthPromptModal;

