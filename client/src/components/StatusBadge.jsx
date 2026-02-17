const statusConfig = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Draft' },
  sent: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Sent' },
  viewed: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Viewed' },
  accepted: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Accepted' },
  declined: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Declined' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
