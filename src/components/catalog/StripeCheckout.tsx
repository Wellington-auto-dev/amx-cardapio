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
}

function CheckoutForm({
  total,
  onSuccess,
  onCancel,
}: Omit<StripeCheckoutProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setErro(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErro(error.message ?? "Erro ao processar pagamento");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
    setLoading(false);
  };

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
      <CheckoutForm total={total} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
