import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/components/products/styles';

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useState } from 'react';
import Head from 'next/head';

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  // mostrar uma div antes de carregar product
  // const { isFallback } = useRouter();
  // if (isFallback) {
  //   return <div>Carregando...</div>;
  // }
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false);

  async function handleBuyButton() {
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch (err) {
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout!');
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>R$ {product.price}</span>

          <p>{product.description}</p>

          <button
            disabled={isCreatingCheckoutSession}
            onClick={handleBuyButton}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          id: 'prod_Q4LU6td4oaQouc',
        },
      },
    ],
    fallback: 'blocking',
    // false para carregar apenas o id que esta no params
    // true para carregar todos os ids
    // blocking para mostrar todos id apenas quando todos estiverem carregado
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  if (!params) {
    return {
      notFound: true,
    }; // arrumar bug do params.id
  }
  const productId = params.id;

  const product = await stripe?.products.retrieve(productId, {
    expand: ['default_price'],
  });
  if (!product) {
    return {
      notFound: true,
    };
  }

  const price = product.default_price as Stripe.Price;
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0] : '';

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: imageUrl,
        price: price.unit_amount !== null ? price.unit_amount / 100 : 0,
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hours
  };
};
