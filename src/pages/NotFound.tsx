import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center">
        <p className="text-6xl mb-6">🍽️</p>
        <h1 className="text-3xl font-700 mb-2" style={{ color: 'var(--color-text)' }}>Página não encontrada</h1>
        <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          O endereço que você acessou não existe ou foi removido.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl font-700 hover:opacity-85 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
