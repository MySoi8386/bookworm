/**
 * Add rejected_at & reject_reason to borrow_requests
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('borrow_requests', 'rejected_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Ngày huỷ/từ chối phiếu'
    });

    await queryInterface.addColumn('borrow_requests', 'reject_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Lý do huỷ/từ chối phiếu'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('borrow_requests', 'reject_reason');
    await queryInterface.removeColumn('borrow_requests', 'rejected_at');
  }
};

