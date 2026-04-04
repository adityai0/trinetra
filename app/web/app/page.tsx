import { redirect } from 'next/navigation';

/**
 * Redirects the root route to the primary dashboard experience.
 */
export default function Home() {
  redirect('/dashboard');
}
