import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Modal } from "@/components/ui/Modal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "");

interface StripeCheckoutProps {
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  onOpenWhatsApp: () => void;
}

function CheckoutForm({
  total,
  onSuccess,
  onCancel,
  onOpenWhatsApp,
}: Omit<StripeCheckoutProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [confirmedId, setConfirmedId] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErro(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErro(error.message ?? "Erro ao processar pagamento");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setConfirmedId(paymentIntent.id);
        setPagamentoConfirmado(true);
      }
    } catch (err) {
      setErro("Erro inesperado ao processar pagamento");
      console.error("[Stripe]", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    onOpenWhatsApp();
    onSuccess(confirmedId);
  };

  // ── Tela de sucesso ────────────────────────────────────────────────────────
  if (pagamentoConfirmado) {
    return (
      <Modal
        open={true}
        onClose={handleWhatsApp}
        maxWidth={480}
        fullscreenMobile={false}
      >
        <div className="flex flex-col items-center justify-center px-6 py-10 gap-5 text-center">
          {/* Ícone check */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgb(34 197 94 / 0.12)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-700" style={{ color: "var(--color-text)" }}>
              Pagamento confirmado!
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Clique abaixo para enviar seu pedido pelo WhatsApp
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full py-3.5 rounded-xl text-sm font-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: "var(--color-whatsapp, #25d366)",
              color: "#fff",
              boxShadow: "0 4px 16px rgb(37 211 102 / 0.35)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar pedido pelo WhatsApp
          </button>
        </div>
      </Modal>
    );
  }

  // ── Formulário de pagamento ────────────────────────────────────────────────
  return (
    <Modal open={true} onClose={onCancel} maxWidth={480} fullscreenMobile={false}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span className="text-base font-700" style={{ color: "var(--color-text)" }}>
          Pagamento Online
        </span>
        <div className="flex items-center gap-3">
          <span className="text-lg font-700" style={{ color: "var(--color-primary)" }}>
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
          <button
            onClick={onCancel}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <PaymentElement />
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4 flex flex-col gap-3"
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {erro && (
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-error, #ef4444)", margin: 0 }}
          >
            {erro}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !stripe}
          className="w-full py-3.5 rounded-xl text-sm font-700 transition-all active:scale-[0.98]"
          style={{
            backgroundColor:
              loading || !stripe ? "var(--color-surface-2)" : "var(--color-primary)",
            color: loading || !stripe ? "var(--color-text-muted)" : "#0D0D0D",
            cursor: loading || !stripe ? "not-allowed" : "pointer",
            boxShadow:
              !loading && stripe ? "0 4px 16px rgb(245 166 35 / 0.35)" : "none",
          }}
        >
          {loading ? "Processando..." : "Confirmar pagamento"}
        </button>

        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm transition-colors"
          style={{
            background: "transparent",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

export function StripeCheckout({
  clientSecret,
  total,
  onSuccess,
  onCancel,
  onOpenWhatsApp,
}: StripeCheckoutProps) {
  const isDark = document.documentElement.classList.contains("dark");

  const appearance = isDark
    ? {
        theme: "night" as const,
        variables: {
          colorPrimary: "#f59e0b",
          colorBackground: "#1e1e1e",
          colorText: "#ffffff",
          colorTextSecondary: "#9ca3af",
          colorDanger: "#ef4444",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
        },
      }
    : {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#f59e0b",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorDanger: "#ef4444",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
        },
      };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm
        total={total}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onOpenWhatsApp={onOpenWhatsApp}
      />
    </Elements>
  );
}
