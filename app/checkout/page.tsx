"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");
  const router = useRouter();

  const [reservation, setReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchReservation() {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`);
      const data = await res.json();
      if (res.ok) {
        setReservation(data);
      } else {
        setMessage(data.error || "Failed to load reservation");
      }
    } catch (error) {
      setMessage("Error loading reservation details");
    }
  }

  useEffect(() => {
    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId]);

  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(reservation.expiresAt).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(distance / 1000 / 60);
      const seconds = Math.floor((distance / 1000) % 60);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function confirmPayment() {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reservations/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        setLoading(false);
        return;
      }

      setMessage("Payment Confirmed!");
      setReservation((prev: any) => ({
        ...prev,
        status: "CONFIRMED",
      }));
      router.refresh();
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      setMessage("Payment confirmation failed. Please try again.");
      setLoading(false);
    }
  }

  async function cancelReservation() {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error);
        setLoading(false);
        return;
      }

      setMessage("Reservation Cancelled!");
      setReservation((prev: any) => ({
        ...prev,
        status: "CANCELLED",
      }));
      router.refresh();

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      setMessage("Cancellation failed. Please try again.");
      setLoading(false);
    }
  }

  if (!reservation) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading reservation details...</p>
        </div>
      </main>
    );
  }

  const isPending = reservation.status === "PENDING";
  const isConfirmed = reservation.status === "CONFIRMED";
  const isCancelled = reservation.status === "CANCELLED";
  const isExpired = reservation.status === "EXPIRED" || (isPending && timeLeft === "Expired");

  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 overflow-hidden transition-all duration-300">
        
        {/* Status Header Banner */}
        <div className={`p-6 text-center ${
          isConfirmed ? "bg-emerald-500 text-white" :
          isCancelled ? "bg-rose-500 text-white" :
          isExpired ? "bg-amber-500 text-white" :
          "bg-slate-900 text-white"
        }`}>
          <div className="text-sm font-semibold tracking-wider uppercase opacity-85">
            Checkout Session
          </div>
          <h1 className="text-3xl font-extrabold mt-1">
            {isConfirmed && "Payment Completed"}
            {isCancelled && "Reservation Cancelled"}
            {isExpired && "Reservation Expired"}
            {isPending && !isExpired && "Confirm Your Booking"}
          </h1>
        </div>

        <div className="p-8">
          {/* Notifications Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-center font-medium border animate-fadeIn transition-all ${
              isConfirmed ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
              isCancelled ? "bg-rose-50 border-rose-200 text-rose-800" :
              "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
              {message}
            </div>
          )}

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-medium">Reservation ID</span>
              <span className="text-slate-800 font-mono text-sm bg-slate-200 px-2 py-0.5 rounded select-all max-w-[200px] truncate" title={reservation.id}>
                {reservation.id}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-medium">Product</span>
              <span className="text-slate-800 font-bold">{reservation.product?.name}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-medium">Warehouse</span>
              <span className="text-slate-800 font-medium">{reservation.warehouse?.name}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-medium">Quantity</span>
              <span className="text-slate-800 font-semibold">{reservation.quantity} Unit(s)</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isConfirmed ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                isCancelled ? "bg-rose-100 text-rose-800 border border-rose-200" :
                isExpired ? "bg-amber-100 text-amber-800 border border-amber-200" :
                "bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse"
              }`}>
                {isExpired ? "EXPIRED" : reservation.status}
              </span>
            </div>
          </div>

          {/* Time Limit Section */}
          {isPending && !isExpired && (
            <div className="text-center mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-pulse">
              <div className="text-amber-800 font-medium text-sm">Time remaining to complete payment:</div>
              <div className="text-amber-700 text-3xl font-extrabold mt-1 tracking-wider">{timeLeft}</div>
            </div>
          )}

          {/* Actions Button Panel */}
          {isPending && !isExpired && (
            <div className="space-y-3">
              <button
                onClick={confirmPayment}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : "Confirm & Pay"}
              </button>

              <button
                onClick={cancelReservation}
                disabled={loading}
                className="w-full bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-700 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-200 disabled:cursor-not-allowed font-medium py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel Reservation
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading checkout details...</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}