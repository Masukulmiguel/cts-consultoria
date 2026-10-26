import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export default function NotFound(): Metadata {
  return {
    title: 'Página não encontrada',
  };
}