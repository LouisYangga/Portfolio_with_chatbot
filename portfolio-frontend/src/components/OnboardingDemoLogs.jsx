const OnboardingDemoLogs = ({ logs, logsEndRef, getLogColor }) => (
  <div className="bg-slate-50 rounded-lg shadow-lg p-8 h-full">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Live Process Logs</h2>
    <div className="bg-slate-800 text-green-400 p-6 rounded-lg h-[500px] border border-slate-600 relative">
      {/* Terminal header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Terminal content - scrollable area */}
      <div className="h-[calc(100%-60px)] overflow-y-auto pr-2">
        <div className="mb-4 text-gray-400 text-xs">
          <span className="text-green-400">$</span> onboarding-automation --start
        </div>
        {logs.length === 0 ? (
          <div className="text-gray-500">
            <span className="text-green-400">{'>'}</span> Waiting for onboarding process to start...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-2">
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className={getLogColor(log.type)}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  </div>
);

export default OnboardingDemoLogs; 