import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "var(--color-text)",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          Pagamento Online
        </span>
        <span
          style={{
            color: "var(--color-primary)",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          R$ {total.toFixed(2).replace(".", ",")}
        </span>
      </div>

      <PaymentElement />

      {erro && (
        <p
          style={{
            color: "var(--color-error, #ef4444)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          {erro}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        style={{
          background: loading ? "var(--color-border)" : "var(--color-primary)",
          color: loading ? "var(--color-text-muted)" : "#000",
          border: "none",
          borderRadius: "8px",
          padding: "14px",
          fontWeight: 700,
          fontSize: "15px",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {loading ? "Processando..." : "Confirmar pagamento"}
      </button>

      <button
        onClick={onCancel}
        style={{
          background: "transparent",
          color: "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "14px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Cancelar
      </button>
    </div>
  );
}

export function StripeCheckout({
  clientSecret,
  total,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "night" } }}
    >
      <CheckoutForm total={total} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
