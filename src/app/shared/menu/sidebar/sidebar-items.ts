// Menu
export interface Menu {
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  headTitle?: string;
  badgeType?: string;
  badgeValue?: string;
  children?: Menu[];
}

export const MENUITEMS: Menu[] = [
  {
    headTitle: 'Dashboard'
  },
  {
    path: '/dashboard/default', title: 'HOME', icon: 'icon-desktop', type: 'link'
  },
  {
    path: '/dashboard/default', title: 'Report', icon: 'icofont icofont-dashboard-web', type: 'link'
  },
  {
    headTitle: 'Quản lý thanh toán'
  },
  {
    path: '/mpay/approval', title: 'Thanh toán đơn hàng', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/approvaladvancepayment', title: 'Duyệt tạm ứng đơn hàng', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/orderpaymentapproval', title: 'Duyệt Thanh toán đơn hàng', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/orderpaid', title: 'Đơn hàng đã thanh toán', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/waitingapprovalorder', title: 'Chờ duyệt hủy đơn', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/payment', title: 'Giao dịch thanh toán', icon: 'icon-archive', type: 'link'
  },
  {
    path: '/mpay/deposits', title: 'Giao dịch nạp tiền', icon: 'icon-wallet', type: 'link'
  },
  {
    path: '/mpay/refundtransaction', title: 'Giao dịch hoàn tiền', icon: 'icon-wallet', type: 'link'
  },
  {
    path: '/mpay/waitingdeposite', title: 'Chờ xử lý nạp tiền', icon: 'icon-wallet', type: 'link'
  },
  {
    path: '/mpay/processdeposite', title: 'Đã xử lý nạp tiền', icon: 'icon-wallet', type: 'link'
  },
  {
    path: '/mpay/withdrawal', title: 'Giao dịch rút tiền', icon: 'icon-credit-card', type: 'link'
  },
  {
    path: '/mpay/freeze', title: 'Giao dịch tạm giữ', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/wallettrans', title: 'Lịch sử thay đổi', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/bankdeposit', title: 'Ngân hàng nạp tiền', icon: 'icon-receipt', type: 'link'
  },
  {
    path: '/mpay/bankclientinfo', title: 'Tiến trình nạp tiền', icon: 'icon-receipt', type: 'link'
  },
  // {
  //   path: '/mpay/banktransactionhistory', title: 'Giao dịch ngân hàng', icon: 'icon-receipt', type: 'link'
  // },
   
];
