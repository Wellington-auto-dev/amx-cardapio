export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-700 text-gray-900 mb-2">Acesso não autorizado</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          O link de acesso é inválido ou expirou. Entre em contato com o suporte para obter um novo link de acesso ao painel.
        </p>
      </div>
    </div>
  );
}
