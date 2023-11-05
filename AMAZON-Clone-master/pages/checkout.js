import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import Currency from "react-currency-formatter";
import { useSelector } from "react-redux";

import { selectItems, selectTotal } from "../slices/basketSlice";
import CheckoutProduct from "../components/CheckoutProduct";
import Header from "../components/Header";

const striprPromis = loadStripe(process.env.stripe_public_key);

const Checkout = () => {
  const items = useSelector(selectItems);
  const total = useSelector(selectTotal);
  const { data: session } = useSession();

  const createCheckOutSession = async () => {
    const stripe = await striprPromis;

    const checkOutSession = await axios.post("/api/create-checkout-session", {
      items: items,
      email: session?.user?.email,
    });

    const result = await stripe.redirectToCheckout({
      sessionId: checkOutSession.data.id,
    });

    if (result.error) alert(result.error.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gray-100"
    >
      <Head>
        <title>Amazon Clone</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://pngimg.com/uploads/amazon/amazon_PNG5.png"
        />
      </Head>
      <Header />
      <main className="lg:flex max-w-screen-2xl mx-auto">
        <div className="flex-grow m-5 shadow-sm">
          <Image
            src="/Billboard_3000x336.jpg"
            width={1020}
            height={250}
            className="object-contain"
          />

          <div className="flex flex-col p-5 space-y-10 bg-white">
            <h1 className="text-3xl border-b pb-4">
              {items.length === 0
                ? "Your Amazon Basket is empty"
                : "Your Shopping Basket"}
            </h1>
            {items.map((item, i) => (
              <CheckoutProduct
                key={i}
                id={item.id}
                title={item.title}
                price={item.price}
                description={item.description}
                category={item.category}
                image={item.image}
                hasPrime={item.hasPrime}
                rating={item.customRating}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white p-10 shadow-md">
          {items.length > 0 && (
            <>
              <h2 className="whitespace-nowrap">
                subtotal ({items.length}) items:
                <span className="font-bold">
                  <Currency quantity={total} currency="USD" />
                </span>
              </h2>
              <button
                role="link"
                disabled={!session}
                onClick={createCheckOutSession}
                className={`button mt-2 ${
                  !session &&
                  `from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed`
                }`}
              >
                {!session ? `Sign in to checkout` : `Proceed to checkout`}
              </button>
            </>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default Checkout;
