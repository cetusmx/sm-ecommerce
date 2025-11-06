import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import styles from './CheckoutForm.module.css';

const CheckoutForm = ({ onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required"
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete) and pass the result to the parent.
      setErrorMessage(error.message);
      onPaymentComplete({ error: true, message: error.message });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, pass the result to the parent.
      onPaymentComplete({ success: true, message: "¡Pago exitoso! Tu pedido ha sido creado, recibirás un correo confirmando tu compra." });
    } else {
      // Handle other statuses if needed
      onPaymentComplete({ error: true, message: `El pago no se completó. Estado: ${paymentIntent?.status}` });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <PaymentElement />
      <button disabled={isProcessing || !stripe || !elements} className={styles.submitButton}>
        <span>
          {isProcessing ? "Procesando..." : "Pagar ahora"}
        </span>
      </button>
      {/* Show local error message to your customers */}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
