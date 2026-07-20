export default function Navigation({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10 no-print">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(index)}
              className={`flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium flex-1 border-b-2 transition-all ${
                activeTab === index
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  activeTab === index
                    ? 'bg-green-500 text-white'
                    : index < activeTab
                    ? 'bg-green-200 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < activeTab ? '✓' : index + 1}
              </span>
              <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
