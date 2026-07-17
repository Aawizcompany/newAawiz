export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
      <div className="hidden lg:flex lg:flex-1 bg-[#3B4B9E] items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl font-bold mb-4">Aa</div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to Aawiz</h2>
          <p className="text-white/70 max-w-xs">Continuous wellbeing insights for your organization</p>
        </div>
      </div>
    </div>
  );
}
